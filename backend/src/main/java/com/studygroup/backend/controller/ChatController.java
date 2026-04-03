package com.studygroup.backend.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studygroup.backend.service.ChatService;
import com.studygroup.backend.service.NotificationService;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:8081"})
public class ChatController {

    private final ChatService chatService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final com.studygroup.backend.repository.UserRepository userRepository;
    private final NotificationService notificationService;

    public ChatController(ChatService chatService, 
                          SimpMessageSendingOperations messagingTemplate, 
                          com.studygroup.backend.repository.UserRepository userRepository,
                          NotificationService notificationService) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @MessageMapping("/chat/{groupId}/sendMessage")
    public void sendGroupMessage(@DestinationVariable Long groupId, Principal principal, Map<String, Object> payload) {
        try {
            String content = (String) payload.get("content");
            String fileUrl = (String) payload.get("fileUrl");
            String fileName = (String) payload.get("fileName");
            
            System.out.println("📨 Processing message for group " + groupId + " from " + principal.getName());
            
            if ((content == null || content.trim().isEmpty()) && fileUrl == null) {
                System.out.println("❌ Empty message, ignoring");
                return;
            }
            
            Map<String, Object> messageMap = chatService.saveMessage(groupId, null, principal.getName(), content, fileUrl, fileName);
            System.out.println("✅ Message saved with ID: " + messageMap.get("id"));
            
            String destination = "/topic/group/" + groupId;
            System.out.println("📢 Broadcasting to: " + destination);
            messagingTemplate.convertAndSend(destination, messageMap);
            
            try {
                System.out.println("🔔 Calling notification service...");
                notificationService.createGroupMessageNotifications(groupId, principal.getName(), messageMap);
                System.out.println("🔔 Notification service call completed");
            } catch (Exception e) {
                System.err.println("❌ Failed to create notifications: " + e.getMessage());
                e.printStackTrace();
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error processing group chat message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/chat/direct/{receiverEmail}/sendMessage")
    public void sendDirectMessage(@DestinationVariable String receiverEmail, Principal principal, Map<String, String> payload) {
        try {
            String content = payload.get("content");
            String fileUrl = payload.getOrDefault("fileUrl", null);
            String fileName = payload.getOrDefault("fileName", null);
            
            System.out.println("📨 Processing direct message from " + principal.getName() + " to " + receiverEmail);
            
            if ((content == null || content.trim().isEmpty()) && fileUrl == null) {
                System.out.println("❌ Empty message, ignoring");
                return;
            }
            
            Map<String, Object> messageMap = chatService.saveMessage(null, receiverEmail, principal.getName(), content, fileUrl, fileName);
            System.out.println("✅ Direct message saved with ID: " + messageMap.get("id"));
            
            messagingTemplate.convertAndSendToUser(receiverEmail, "/queue/messages", messageMap);
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/messages", messageMap);
            
            try {
                System.out.println("🔔 Calling notification service for direct message...");
                notificationService.createDirectMessageNotification(principal.getName(), receiverEmail, messageMap);
                System.out.println("🔔 Direct message notification created");
            } catch (Exception e) {
                System.err.println("❌ Failed to create direct message notification: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error processing direct chat message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @GetMapping("/group/{groupId}/messages")
    public ResponseEntity<?> getGroupMessages(@PathVariable Long groupId, Principal principal) {
        try {
            System.out.println("📥 Fetching messages for group: " + groupId);
            return ResponseEntity.ok(chatService.getGroupMessages(groupId, principal.getName()));
        } catch (Exception e) {
            System.err.println("❌ Error fetching group messages: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/direct/{otherUserEmail}/messages")
    public ResponseEntity<?> getDirectMessages(@PathVariable String otherUserEmail, Principal principal) {
        try {
            System.out.println("📥 Fetching direct messages between " + principal.getName() + " and " + otherUserEmail);
            return ResponseEntity.ok(chatService.getDirectMessages(principal.getName(), otherUserEmail));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/{messageId}/react")
    public ResponseEntity<?> addReaction(@PathVariable Long messageId, @RequestBody Map<String, String> payload, Principal principal) {
        try {
            String reaction = payload.get("reaction");
            Map<String, Object> updatedMessage = chatService.addReaction(messageId, reaction, principal.getName());
            
            if (updatedMessage.get("groupId") != null) {
                messagingTemplate.convertAndSend("/topic/group/" + updatedMessage.get("groupId"), updatedMessage);
            } else {
                String receiverEmail = (String) updatedMessage.get("receiverEmail");
                if (receiverEmail != null) {
                    messagingTemplate.convertAndSendToUser(receiverEmail, "/queue/messages", updatedMessage);
                }
                messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/messages", updatedMessage);
            }
            
            return ResponseEntity.ok(updatedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsersForChat(Principal principal) {
        try {
            return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> !u.getEmail().equals(principal.getName()))
                .map(u -> Map.of(
                    "id", u.getId(),
                    "name", u.getName(),
                    "email", u.getEmail()
                ))
                .toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}