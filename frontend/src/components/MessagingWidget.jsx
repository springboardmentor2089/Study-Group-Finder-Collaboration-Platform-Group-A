import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../api";
import useAuth from "../context/useAuth";
import "./MessagingWidget.css";

// Example chatContext: { type: 'group' | 'direct', id: string, name: string, receiverEmail?: string }
export default function MessagingWidget({ chatContext, currentUser, onSelectChat, isFullPage }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [groupMembers, setGroupMembers] = useState([]);
  // Default recipient is deleted - group messages are always to 'everyone'
  
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch message history when context changes
  useEffect(() => {
    if (!chatContext) return;
    
    // Reset messages when switching context
    setMessages([]);
    setLoadingHistory(true);
    
    const fetchHistory = async () => {
      try {
        let endpoint = "";
        if (chatContext.type === 'group') {
            endpoint = `/api/chat/group/${chatContext.id}/messages`;
        } else {
            // Direct chat mode (from sidebar)
            endpoint = `/api/chat/direct/${chatContext.receiverEmail}/messages`;
        }
        
        const res = await api.get(endpoint);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    fetchHistory();

    // Fetch members if it's a group
    if (chatContext.type === 'group') {
        api.get(`/api/groups/${chatContext.id}/members`)
           .then(res => setGroupMembers(res.data))
           .catch(err => console.error("Error fetching group members:", err));
    } else {
        setGroupMembers([]);
    }

    setSelectedFile(null);
    setInputValue("");
  }, [chatContext.id, chatContext.type, chatContext.receiverEmail]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!token || !chatContext) return;

    const socketUrl = "http://localhost:8081/ws";
    
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function () {
        // console.log(str); 
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("✅ Connected to WebSocket");
      setConnected(true);
      
      // Subscribe to group topic if in group mode
      if (chatContext.type === 'group') {
        console.log("📢 Subscribing to group topic:", `/topic/group/${chatContext.id}`);
        client.subscribe(`/topic/group/${chatContext.id}`, (message) => {
          console.log("📨 Received group message:", message.body);
          if (!message.body) return;
          try {
            const parsed = JSON.parse(message.body);
            setMessages((prev) => {
              // Check if message already exists
              if (prev.some(m => m.id === parsed.id)) return prev;
              return [...prev, parsed];
            });
          } catch (e) {
            console.error("Error parsing message:", e);
          }
        });
      }
      
      // Subscribe to user's personal queue for direct messages
      console.log("👤 Subscribing to user queue");
      client.subscribe(`/user/queue/messages`, (message) => {
        console.log("📨 Received direct message:", message.body);
        if (!message.body) return;
        try {
          const parsed = JSON.parse(message.body);
          setMessages((prev) => {
            // Check if message already exists
            if (prev.some(m => m.id === parsed.id)) return prev;
            return [...prev, parsed];
          });
        } catch (e) {
          console.error("Error parsing message:", e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message']);
      setConnected(false);
    };
    
    client.onDisconnect = () => {
      console.log("❌ Disconnected from WebSocket");
      setConnected(false);
    };
    
    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🔌 Cleaning up WebSocket connection");
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [chatContext.id, chatContext.type, token]); // Fixed dependencies

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!connected || !clientRef.current) {
      console.error("Not connected to WebSocket");
      alert("Not connected to chat server. Please wait...");
      return;
    }
    if (!inputValue.trim() && !selectedFile) return;

    setUploading(true);
    let fileUrl = null;
    let fileName = null;

    try {
        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            // Explicitly set headers for multipart upload
            const res = await api.post("/api/files/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            fileUrl = res.data.fileUrl;
            fileName = res.data.fileName;
        }

        // Determine destination based on current RECIPIENT state
        let destination = "";
        let body = { 
            content: inputValue.trim(),
            fileUrl,
            fileName
        };

        if (chatContext.type === 'group') {
            // In group context, always use the group destination
            destination = `/app/chat/${chatContext.id}/sendMessage`;
        } else {
            // Dedicated direct chat window
            destination = `/app/chat/direct/${chatContext.receiverEmail}/sendMessage`;
        }

        console.log("📤 Sending message to:", destination, body);
        
        clientRef.current.publish({
            destination: destination,
            body: JSON.stringify(body)
        });

        setInputValue("");
        setSelectedFile(null);
        const fileInput = document.getElementById("chat-file-upload");
        if (fileInput) fileInput.value = "";
        
    } catch (err) {
        console.error("Send failed:", err);
        alert("Failed to send message.");
    } finally {
        setUploading(false);
    }
  };

  if (!chatContext) return null;

  return (
    <div className={`messaging-widget unified-chat ${isFullPage ? 'chat-page-mode' : ''}`}>
      <div className="mw-header">
        <div className="mw-header-info">
            <h3>
                {chatContext.type === 'group' ? <i className="bi bi-people-fill" /> : <i className="bi bi-person-fill" />}
                {chatContext.name}
            </h3>
            <span className={`mw-connection-status ${connected ? 'connected' : 'connecting'}`}>
                {connected ? "● Live" : "○ Connecting..."}
            </span>
        </div>
      </div>
      
      <div className="mw-messages">
        {loadingHistory ? (
          <div className="mw-loading-messages"><div className="spinner-border spinner-border-sm me-2" /> Loading...</div>
        ) : messages.length === 0 ? (
          <div className="mw-empty-state"><i className="bi bi-chat-quote" /><p>This is the beginning of your conversation.</p></div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.senderEmail === currentUser?.email;
            // Use explicit flag from backend if available, fallback to receiverEmail check
            const isPrivate = msg.isPrivate !== undefined ? msg.isPrivate : !!msg.receiverEmail;
            
            // Extract filename from fileUrl for download endpoint
            const getFileNameFromUrl = (url) => {
              if (!url) return '';
              const parts = url.split('/');
              return parts[parts.length - 1];
            };
            
            return (
              <div key={msg.id || idx} className={`mw-message-wrapper ${isMine ? 'mw-message-mine' : 'mw-message-theirs'}`}>
                <div className="mw-message-meta">
                  <span className="mw-sender-name" 
                        onClick={() => !isMine && onSelectChat && onSelectChat({type: 'direct', email: msg.senderEmail, name: msg.senderName})}
                        style={{cursor: isMine ? 'default' : 'pointer'}}
                        title={isMine ? "" : `Click to message ${msg.senderName}`}>
                      {isMine ? 'You' : msg.senderName}
                  </span>
                  

                  <span className="mw-msg-time ms-2" title={msg.sentAt ? new Date(msg.sentAt).toLocaleString() : ''}>
                      {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>
                
                <div className="mw-message-bubble-outer">
                   <div className={`mw-message-bubble ${isPrivate ? 'mw-bubble-private' : ''}`}>
                      {msg.content && <div className="mw-message-text">{msg.content}</div>}
                      {msg.fileUrl && (() => {
  const fileUrl = `http://localhost:8081${msg.fileUrl}`;
  const fileName = msg.fileName?.toLowerCase() || "";

  const isDoc = fileName.endsWith(".doc") || fileName.endsWith(".docx");
  const isPpt = fileName.endsWith(".ppt") || fileName.endsWith(".pptx");

  const viewUrl =
    isDoc || isPpt
      ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`
      : fileUrl;

  return (
    <div className="mw-file-attachment">
      <div className="mw-file-info">
        <i className="bi bi-file-earmark-fill"></i>
        <span className="file-name">{msg.fileName || "Document"}</span>
      </div>

      <div className="mw-file-actions">

        {/* VIEW */}
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mw-file-btn mw-view-btn"
        >
          <i className="bi bi-eye-fill"></i>
          <span>View</span>
        </a>

        {/* DOWNLOAD */}
        <a
          href={`http://localhost:8081/api/files/force-download/${getFileNameFromUrl(msg.fileUrl)}`}
          className="mw-file-btn mw-download-btn"
        >
          <i className="bi bi-download"></i>
          <span>Download</span>
        </a>

      </div>
    </div>
  );
})()}
                   </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="mw-input-area-unified" onSubmit={handleSendMessage}>
        {selectedFile && (
          <div className="mw-file-preview">
            <i className="bi bi-file-earmark-fill"></i>
            <span>{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)}><i className="bi bi-x"></i></button>
          </div>
        )}
        
        <div className="mw-input-controls">

            <div className="mw-input-field-wrapper">
                <input 
                    type="file" id="chat-file-upload" 
                    onChange={handleFileChange} className="d-none" 
                />
                <button type="button" className="mw-btn-attach" onClick={() => document.getElementById('chat-file-upload').click()}>
                    <i className="bi bi-plus-lg"></i>
                </button>
                <input
                  type="text" className="mw-input-unified"
                  placeholder="Type a message..."
                  value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  disabled={uploading} autoComplete="off"
                />
                <button type="submit" className="mw-btn-send" disabled={(!inputValue.trim() && !selectedFile) || uploading}>
                  {uploading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send-fill" />}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
}