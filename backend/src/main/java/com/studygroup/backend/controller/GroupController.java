package com.studygroup.backend.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studygroup.backend.service.GroupService;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            return ResponseEntity.ok(groupService.createGroup(principal.getName(), body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllGroups(Principal principal,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(required = false) Long courseId) {
        if (principal != null) {
            return ResponseEntity.ok(groupService.getAllGroupsForUser(principal.getName(), search, courseId));
        }
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyGroups(Principal principal) {
        try {
            return ResponseEntity.ok(groupService.getMyGroups(principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(groupService.getGroupById(id, principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/join/{id}")
    public ResponseEntity<?> joinGroup(@PathVariable Long id, Principal principal) {
        try {
            groupService.joinGroup(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "You have joined the group!", "isMember", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/request/{id}")
    public ResponseEntity<?> requestJoin(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(groupService.requestJoin(id, principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/requests")
    public ResponseEntity<?> getPendingRequests(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(groupService.getPendingRequests(id, principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long requestId, Principal principal) {
        try {
            return ResponseEntity.ok(groupService.acceptRequest(requestId, principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId, Principal principal) {
        try {
            return ResponseEntity.ok(groupService.rejectRequest(requestId, principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(groupService.getGroupMembers(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id,
                                           @PathVariable Long memberId,
                                           Principal principal) {
        try {
            groupService.removeMember(id, memberId, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Member removed."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id, Principal principal) {
        try {
            groupService.deleteGroup(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Group deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
