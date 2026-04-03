package com.studygroup.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.studygroup.backend.entity.Notification;
import com.studygroup.backend.entity.Notification.NotificationStatus;
import com.studygroup.backend.entity.Notification.NotificationType;
import com.studygroup.backend.entity.StudyGroup;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.repository.NotificationRepository;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final StudyGroupRepository studyGroupRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               StudyGroupRepository studyGroupRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.studyGroupRepository = studyGroupRepository;
    }

    public List<Map<String, Object>> getNotifications(String userEmail) {
        System.out.println("🔔 Fetching notifications for user: " + userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        System.out.println("📋 Found " + notifications.size() + " notifications");
        
        return notifications.stream()
                .map(this::toNotifMap)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        System.out.println("🔔 Fetching unread count for user: " + userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        long count = notificationRepository.countByUserIdAndStatus(user.getId(), NotificationStatus.UNREAD);
        System.out.println("📊 Unread count: " + count);
        return count;
    }

    public void markAllRead(String userEmail) {
        System.out.println("🔔 Marking all notifications as read for user: " + userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(n -> n.getStatus() == NotificationStatus.UNREAD)
                .collect(Collectors.toList());

        System.out.println("📋 Marking " + unread.size() + " notifications as read");
        
        unread.forEach(n -> n.setStatus(NotificationStatus.READ));
        notificationRepository.saveAll(unread);
    }

    public void markRead(Long notifId, String userEmail) {
        System.out.println("🔔 Marking notification " + notifId + " as read for user: " + userEmail);
        Notification n = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!n.getUser().getId().equals(user.getId())) {
            System.out.println("❌ User not authorized to mark this notification as read");
            throw new RuntimeException("Not authorized.");
        }

        n.setStatus(NotificationStatus.READ);
        notificationRepository.save(n);
        System.out.println("✅ Notification marked as read");
    }

    @org.springframework.transaction.annotation.Transactional
    public void createGroupMessageNotifications(Long groupId, String senderEmail, Map<String, Object> message) {
        System.out.println("🔔 Creating group message notifications for group: " + groupId + " from sender: " + senderEmail);
        
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        System.out.println("📚 Group found: " + group.getName());
        System.out.println("👥 Group members count from DB: " + group.getMembers().size());
        
        // Debug: Print all member emails
        System.out.println("📋 All group members:");
        for (User member : group.getMembers()) {
            System.out.println("   - " + member.getEmail() + " (" + member.getName() + ")");
        }
        
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        System.out.println("👤 Sender: " + sender.getEmail() + " (" + sender.getName() + ")");
        
        // Get all group members except sender
        List<User> members = group.getMembers().stream()
                .filter(m -> !m.getEmail().equals(senderEmail))
                .collect(Collectors.toList());
        
        System.out.println("👥 Found " + members.size() + " other members in group (excluding sender)");
        
        String content = (String) message.get("content");
        String fileName = (String) message.get("fileName");
        
        String messagePreview;
        if (fileName != null && !fileName.isEmpty()) {
            messagePreview = "📎 " + (content != null && !content.isEmpty() ? content : "sent a file: " + fileName);
        } else {
            messagePreview = content != null ? content : "sent a message";
        }
        
        String notificationMessage = String.format("📱 %s in %s: %s", 
                sender.getName(), 
                group.getName(), 
                messagePreview.length() > 50 ? messagePreview.substring(0, 50) + "..." : messagePreview);
        
        System.out.println("📝 Notification message: " + notificationMessage);
        
        int createdCount = 0;
        for (User member : members) {
            Notification notif = new Notification();
            notif.setUser(member);
            notif.setType(NotificationType.MESSAGE);
            notif.setMessage(notificationMessage);
            notif.setStatus(NotificationStatus.UNREAD);
            notificationRepository.save(notif);
            createdCount++;
            System.out.println("   ✅ Created notification for: " + member.getEmail());
        }
        
        System.out.println("✅ Created " + createdCount + " notifications for group members");
    }

    @org.springframework.transaction.annotation.Transactional
    public void createDirectMessageNotification(String senderEmail, String receiverEmail, Map<String, Object> message) {
        System.out.println("🔔 Creating direct message notification from " + senderEmail + " to " + receiverEmail);
        
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        String content = (String) message.get("content");
        String fileName = (String) message.get("fileName");
        
        String messagePreview;
        if (fileName != null && !fileName.isEmpty()) {
            messagePreview = "📎 " + (content != null && !content.isEmpty() ? content : "sent you a file: " + fileName);
        } else {
            messagePreview = content != null ? content : "sent you a message";
        }
        
        String notificationMessage = String.format("💬 %s: %s", 
                sender.getName(), 
                messagePreview.length() > 50 ? messagePreview.substring(0, 50) + "..." : messagePreview);
        
        System.out.println("📝 Notification message: " + notificationMessage);
        
        Notification notif = new Notification();
        notif.setUser(receiver);
        notif.setType(NotificationType.MESSAGE);
        notif.setMessage(notificationMessage);
        notif.setStatus(NotificationStatus.UNREAD);
        notificationRepository.save(notif);
        
        System.out.println("✅ Created notification for receiver: " + receiverEmail);
    }

    private Map<String, Object> toNotifMap(Notification n) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", n.getId());
        m.put("type", n.getType().toString());
        m.put("message", n.getMessage());
        m.put("status", n.getStatus().toString());
        m.put("createdAt", n.getCreatedAt());
        return m;
    }
}