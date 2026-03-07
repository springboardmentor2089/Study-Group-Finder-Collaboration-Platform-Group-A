package com.studygroup.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.studygroup.backend.entity.Notification;
import com.studygroup.backend.entity.Notification.NotificationStatus;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.repository.NotificationRepository;
import com.studygroup.backend.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toNotifMap).collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserIdAndStatus(user.getId(), NotificationStatus.UNREAD);
    }

    public void markAllRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(n -> n.getStatus() == NotificationStatus.UNREAD)
                .collect(Collectors.toList());

        unread.forEach(n -> n.setStatus(NotificationStatus.READ));
        notificationRepository.saveAll(unread);
    }

    public void markRead(Long notifId, String userEmail) {
        Notification n = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!n.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Not authorized.");

        n.setStatus(NotificationStatus.READ);
        notificationRepository.save(n);
    }

    private Map<String, Object> toNotifMap(Notification n) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", n.getId());
        m.put("type", n.getType());
        m.put("message", n.getMessage());
        m.put("status", n.getStatus());
        m.put("createdAt", n.getCreatedAt());
        return m;
    }
}
