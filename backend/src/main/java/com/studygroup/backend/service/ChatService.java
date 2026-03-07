package com.studygroup.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.studygroup.backend.entity.ChatMessage;
import com.studygroup.backend.entity.StudyGroup;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.repository.ChatMessageRepository;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.UserRepository;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;

    public ChatService(ChatMessageRepository chatMessageRepository,
                       StudyGroupRepository studyGroupRepository,
                       UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.studyGroupRepository = studyGroupRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> saveMessage(Long groupId, String senderEmail, String content) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only members OR the creator can chat
        boolean isCreator = group.getCreator() != null && group.getCreator().getId().equals(sender.getId());
        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getId().equals(sender.getId()));
        if (!isCreator && !isMember) throw new RuntimeException("You are not a member of this group.");

        ChatMessage msg = new ChatMessage();
        msg.setGroup(group);
        msg.setSender(sender);
        msg.setContent(content);
        chatMessageRepository.save(msg);

        return toMessageMap(msg);
    }

    public List<Map<String, Object>> getMessages(Long groupId) {
        return chatMessageRepository.findByGroupIdOrderBySentAtAsc(groupId)
                .stream().map(this::toMessageMap).collect(Collectors.toList());
    }

    private Map<String, Object> toMessageMap(ChatMessage msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", msg.getId());
        m.put("content", msg.getContent());
        m.put("sentAt", msg.getSentAt());
        m.put("senderId", msg.getSender().getId());
        m.put("senderName", msg.getSender().getName());
        m.put("senderEmail", msg.getSender().getEmail());
        m.put("groupId", msg.getGroup().getId());
        return m;
    }
}
