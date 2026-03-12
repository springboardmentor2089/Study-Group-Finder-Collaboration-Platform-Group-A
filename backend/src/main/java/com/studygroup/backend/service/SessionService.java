package com.studygroup.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.studygroup.backend.entity.Notification;
import com.studygroup.backend.entity.Notification.NotificationType;
import com.studygroup.backend.entity.StudyGroup;
import com.studygroup.backend.entity.StudySession;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.repository.NotificationRepository;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.StudySessionRepository;
import com.studygroup.backend.repository.UserRepository;

@Service
public class SessionService {

    private final StudySessionRepository sessionRepository;
    private final StudyGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public SessionService(StudySessionRepository sessionRepository,
                          StudyGroupRepository groupRepository,
                          UserRepository userRepository,
                          NotificationRepository notificationRepository) {
        this.sessionRepository = sessionRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    public Map<String, Object> createSession(Long groupId, String creatorEmail, Map<String, Object> body) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getId().equals(creator.getId()));
        if (!isMember) throw new RuntimeException("You must be a member to create sessions.");

        StudySession session = new StudySession();
        session.setGroup(group);
        session.setTitle((String) body.get("title"));
        session.setDescription((String) body.get("description"));
        session.setCreatedBy(creator);

        String dateStr = (String) body.get("sessionDate");
        if (dateStr != null) {
            session.setSessionDate(LocalDateTime.parse(dateStr));
        }

        sessionRepository.save(session);

        // Notify all group members
        String notifMsg = "New session \"" + session.getTitle() + "\" scheduled in group \"" + group.getName() + "\"";
        for (User member : group.getMembers()) {
            if (!member.getId().equals(creator.getId())) {
                Notification n = new Notification();
                n.setUser(member);
                n.setType(NotificationType.REMINDER);
                n.setMessage(notifMsg);
                notificationRepository.save(n);
            }
        }

        return toSessionMap(session);
    }

    public List<Map<String, Object>> getGroupSessions(Long groupId) {
        return sessionRepository.findByGroupIdOrderBySessionDateAsc(groupId)
                .stream().map(this::toSessionMap).collect(Collectors.toList());
    }

    public void deleteSession(Long sessionId, String userEmail) {
        StudySession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isCreator = session.getCreatedBy() != null && session.getCreatedBy().getId().equals(user.getId());
        boolean isGroupCreator = session.getGroup().getCreator() != null &&
                session.getGroup().getCreator().getId().equals(user.getId());

        if (!isCreator && !isGroupCreator) {
            throw new RuntimeException("Only the session creator or group admin can delete sessions.");
        }

        sessionRepository.deleteById(sessionId);
    }

    private Map<String, Object> toSessionMap(StudySession session) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", session.getId());
        m.put("title", session.getTitle());
        m.put("description", session.getDescription());
        m.put("sessionDate", session.getSessionDate());
        m.put("createdAt", session.getCreatedAt());
        m.put("groupId", session.getGroup().getId());
        m.put("groupName", session.getGroup().getName());
        if (session.getCreatedBy() != null) {
            m.put("createdById", session.getCreatedBy().getId());
            m.put("createdByName", session.getCreatedBy().getName());
            m.put("createdByEmail", session.getCreatedBy().getEmail());
        }
        return m;
    }
}
