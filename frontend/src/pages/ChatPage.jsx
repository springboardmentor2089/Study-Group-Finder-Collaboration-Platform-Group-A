import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import MessagingWidget from "../components/MessagingWidget";
import "./ChatPage.css";

const ChatPage = () => {
  const [groups, setGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const location = useLocation();

  useEffect(() => {
    // GET USER
    api.get("/user/me").then(res => {
      setCurrentUser(res.data);

      // OPEN GROUP FROM DASHBOARD
      if (location.state?.groupChat) {
        const { id, name } = location.state.groupChat;

        setActiveChat({
          type: "group",
          id,
          name
        });
      }
    });

    // ONLY MY GROUPS
    api.get("/api/groups/my")
      .then(res => setGroups(res.data))
      .catch(() => {});
      
  }, [location.state]);



  const handleSelectChat = (group) => {
    setActiveChat({
      type: "group",
      id: group.id,
      name: group.name
    });
  };



  if (!currentUser) return <div>Loading...</div>;



  return (
    <div className="chat-page-container">

      {/* LEFT SIDEBAR */}
      <div className="chat-sidebar">

        <div className="sidebar-header">
          <h2>Chats</h2>
        </div>

        <div className="sidebar-section">
          <h3>My Groups</h3>

          <ul className="chat-list">
            {groups.map(group => (
              <li
                key={group.id}
                className={`chat-list-item ${activeChat?.id === group.id ? "active" : ""}`}
                onClick={() => handleSelectChat(group)}
              >
                <div className="chat-avatar">
                  {group.name.charAt(0).toUpperCase()}
                </div>

                <div className="chat-info">
                  <h4>{group.name}</h4>
                </div>
              </li>
            ))}
          </ul>

        </div>

      </div>



      {/* RIGHT CHAT */}
      <div className="chat-main-area">

        {activeChat ? (
          <div className="chat-wrapper">
            <MessagingWidget
              chatContext={activeChat}
              currentUser={currentUser}
              isFullPage={true}
            />
          </div>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a group</h3>
          </div>
        )}

      </div>

    </div>
  );
};

export default ChatPage;