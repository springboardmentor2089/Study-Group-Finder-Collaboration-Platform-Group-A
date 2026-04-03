package com.studygroup.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studygroup.backend.entity.JoinRequest;
import com.studygroup.backend.entity.JoinRequest.RequestStatus;
import com.studygroup.backend.entity.Notification;
import com.studygroup.backend.entity.Notification.NotificationType;
import com.studygroup.backend.entity.StudyGroup;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.repository.ChatMessageRepository;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.repository.JoinRequestRepository;
import com.studygroup.backend.repository.NotificationRepository;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.StudySessionRepository;
import com.studygroup.backend.repository.UserRepository;

@Service
public class GroupService {

    private final StudyGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final NotificationRepository notificationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final StudySessionRepository studySessionRepository;

    public GroupService(StudyGroupRepository groupRepository,
                        UserRepository userRepository,
                        CourseRepository courseRepository,
                        JoinRequestRepository joinRequestRepository,
                        NotificationRepository notificationRepository,
                        ChatMessageRepository chatMessageRepository,
                        StudySessionRepository studySessionRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.notificationRepository = notificationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.studySessionRepository = studySessionRepository;
    }

    public StudyGroup createGroup(String creatorEmail, Map<String, Object> body) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudyGroup group = new StudyGroup();
        group.setName((String) body.get("name"));
        group.setDescription((String) body.get("description"));

        String privacy = (String) body.getOrDefault("privacy", "PUBLIC");
        group.setPrivacy(privacy != null ? privacy : "PUBLIC");

        group.setCreator(creator);
        group.getMembers().add(creator);

        Object courseIdObj = body.get("courseId");
        if (courseIdObj != null && !courseIdObj.toString().isBlank()) {
            try {
                Long courseId = Long.valueOf(courseIdObj.toString());
                
                // Check if user is enrolled in this course
                boolean isEnrolled = creator.getEnrolledCourses().stream()
                        .anyMatch(c -> c.getId().equals(courseId));
                        
                if (!isEnrolled) {
                    throw new RuntimeException("You must be enrolled in the course to create a study group for it.");
                }
                
                courseRepository.findById(courseId).ifPresent(group::setCourse);
            } catch (NumberFormatException ignored) {}
        }

        return groupRepository.save(group);
    }

    public List<StudyGroup> getAllGroups() {
        return groupRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Map<String, Object>> getAllGroupsForUser(String userEmail, String search, Long courseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<StudyGroup> groups;
        if ((search != null && !search.isBlank()) || courseId != null) {
            groups = groupRepository.searchGroups(
                    (search != null && !search.isBlank()) ? search : null, courseId);
        } else {
            groups = groupRepository.findAllByOrderByCreatedAtDesc();
        }

        return groups.stream().map(g -> toGroupMap(g, user)).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMyGroups(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<StudyGroup> groups = groupRepository.findByMembersId(user.getId());
        return groups.stream().map(g -> toGroupMap(g, user)).collect(Collectors.toList());
    }

    @Transactional
    private Map<String, Object> toGroupMap(StudyGroup group, User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", group.getId());
        m.put("name", group.getName());
        m.put("description", group.getDescription());
        m.put("privacy", group.getPrivacy());
        m.put("createdAt", group.getCreatedAt());
        m.put("memberCount", group.getMembers().size());

        // Check if the current user is the creator
        boolean isCreator = group.getCreator() != null && group.getCreator().getId().equals(user.getId());
        
        boolean isAdmin = user.getRole() != null && user.getRole().equals("ROLE_ADMIN");
        m.put("isCreator", isCreator);
        m.put("isAdmin", isAdmin);

        // Creator is always considered a member
        boolean isMember = isCreator || group.getMembers().stream().anyMatch(mem -> mem.getId().equals(user.getId()));
        m.put("isMember", isMember);

        boolean isPending = joinRequestRepository.existsByGroupIdAndUserIdAndStatus(
                group.getId(), user.getId(), RequestStatus.PENDING);
        m.put("isPending", isPending);

        if (group.getCreator() != null) {
            m.put("creatorId", group.getCreator().getId());
            m.put("creatorName", group.getCreator().getName());
        }

        if (group.getCourse() != null) {
            m.put("courseId", group.getCourse().getId());
            m.put("courseName", group.getCourse().getCourseName());
        }

        return m;
    }

    public Map<String, Object> getGroupById(Long groupId, String userEmail) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toGroupMap(group, user);
    }

    public StudyGroup joinGroup(Long groupId, String userEmail) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!"PUBLIC".equals(group.getPrivacy())) {
            throw new RuntimeException("This group is private. Please send a join request.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean alreadyMember = group.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        if (!alreadyMember) {
            group.getMembers().add(user);
            groupRepository.save(group);
            sendNotification(group.getCreator(), NotificationType.INVITATION,
                    user.getName() + " joined your group \"" + group.getName() + "\"");
        }

        return group;
    }

    public Map<String, Object> requestJoin(Long groupId, String userEmail) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean alreadyMember = group.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        if (alreadyMember) throw new RuntimeException("You are already a member of this group.");

        boolean alreadyRequested = joinRequestRepository.existsByGroupIdAndUserIdAndStatus(
                groupId, user.getId(), RequestStatus.PENDING);
        if (alreadyRequested) throw new RuntimeException("You already have a pending request for this group.");

        JoinRequest request = new JoinRequest();
        request.setGroup(group);
        request.setUser(user);
        request.setStatus(RequestStatus.PENDING);
        joinRequestRepository.save(request);

        if (group.getCreator() != null) {
            sendNotification(group.getCreator(), NotificationType.JOIN_REQUEST,
                    user.getName() + " requested to join your group \"" + group.getName() + "\"");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Join request sent successfully!");
        result.put("isPending", true);
        return result;
    }

    public List<Map<String, Object>> getPendingRequests(Long groupId, String userEmail) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getCreator().getId().equals(user.getId())) {
            throw new RuntimeException("Only the group creator can view join requests.");
        }

        return joinRequestRepository.findByGroupIdAndStatus(groupId, RequestStatus.PENDING)
                .stream().map(req -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("requestId", req.getId());
                    m.put("userId", req.getUser().getId());
                    m.put("userName", req.getUser().getName());
                    m.put("userEmail", req.getUser().getEmail());
                    m.put("createdAt", req.getCreatedAt());
                    return m;
                }).collect(Collectors.toList());
    }

    public Map<String, Object> acceptRequest(Long requestId, String creatorEmail) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!request.getGroup().getCreator().getId().equals(creator.getId())) {
            throw new RuntimeException("Only the group creator can accept requests.");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        joinRequestRepository.save(request);

        StudyGroup group = request.getGroup();
        boolean alreadyMember = group.getMembers().stream().anyMatch(m -> m.getId().equals(request.getUser().getId()));
        if (!alreadyMember) {
            group.getMembers().add(request.getUser());
            groupRepository.save(group);
        }

        sendNotification(request.getUser(), NotificationType.JOIN_ACCEPTED,
                "Your request to join \"" + group.getName() + "\" was accepted!");

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Request accepted. User added to group.");
        return result;
    }

    public Map<String, Object> rejectRequest(Long requestId, String creatorEmail) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!request.getGroup().getCreator().getId().equals(creator.getId())) {
            throw new RuntimeException("Only the group creator can reject requests.");
        }

        request.setStatus(RequestStatus.REJECTED);
        joinRequestRepository.save(request);

        sendNotification(request.getUser(), NotificationType.JOIN_REJECTED,
                "Your request to join \"" + request.getGroup().getName() + "\" was declined.");

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Request rejected.");
        return result;
    }

    @Transactional
    public List<Map<String, Object>> getGroupMembers(Long groupId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        Long creatorId = group.getCreator() != null ? group.getCreator().getId() : null;

        List<Map<String, Object>> result = group.getMembers().stream().map(member -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", member.getId());
            m.put("name", member.getName());
            m.put("email", member.getEmail());
            m.put("role", member.getId().equals(creatorId) ? "Admin" : "Member");
            return m;
        }).collect(Collectors.toList());

        // Always ensure creator is in the list (handles old groups where creator wasn't added to members)
        if (group.getCreator() != null && result.stream().noneMatch(m -> group.getCreator().getId().equals(m.get("id")))) {
            Map<String, Object> creatorMap = new HashMap<>();
            creatorMap.put("id", group.getCreator().getId());
            creatorMap.put("name", group.getCreator().getName());
            creatorMap.put("email", group.getCreator().getEmail());
            creatorMap.put("role", "Admin");
            result.add(0, creatorMap);
        }

        return result;
    }

    public void removeMember(Long groupId, Long memberId, String creatorEmail) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getCreator().getId().equals(creator.getId())) {
            throw new RuntimeException("Only the group creator can remove members.");
        }
        if (group.getCreator().getId().equals(memberId)) {
            throw new RuntimeException("Cannot remove the group creator.");
        }

        group.getMembers().removeIf(m -> m.getId().equals(memberId));
        groupRepository.save(group);
    }

    private void sendNotification(User recipient, NotificationType type, String message) {
        if (recipient == null) return;
        Notification n = new Notification();
        n.setUser(recipient);
        n.setType(type);
        n.setMessage(message);
        notificationRepository.save(n);
    }

    @Transactional
    public void deleteGroup(Long groupId, String creatorEmail) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = creator.getRole() != null && creator.getRole().equals("ROLE_ADMIN");
        boolean isCreator = group.getCreator() != null && group.getCreator().getId().equals(creator.getId());

        if (!isAdmin && !isCreator) {
            throw new RuntimeException("Only the group creator or an admin can delete the group.");
        }

        // 1. Clear the members join table explicitly
        group.getMembers().clear();
        groupRepository.save(group);

        // 2. Manually delete associated records using bulk delete queries
        chatMessageRepository.deleteByGroupId(groupId);
        studySessionRepository.deleteByGroupId(groupId);
        joinRequestRepository.deleteByGroupId(groupId);

        // 3. Finally delete the group
        groupRepository.delete(group);
    }
}