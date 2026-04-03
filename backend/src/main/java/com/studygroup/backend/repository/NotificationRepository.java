package com.studygroup.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studygroup.backend.entity.Notification;
import com.studygroup.backend.entity.Notification.NotificationStatus;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndStatus(Long userId, NotificationStatus status);
}
