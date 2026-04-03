package com.studygroup.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.studygroup.backend.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByGroupIdOrderBySentAtAsc(Long groupId);
    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessage m WHERE m.group.id = :groupId")
    void deleteByGroupId(Long groupId);
    List<ChatMessage> findBySenderIdAndReceiverIdOrderBySentAtAsc(Long senderId, Long receiverId);
}
