package com.studygroup.backend.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studygroup.backend.service.SessionService;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/group/{groupId}")
    public ResponseEntity<?> createSession(@PathVariable Long groupId,
                                           @RequestBody Map<String, Object> body,
                                           Principal principal) {
        try {
            return ResponseEntity.ok(sessionService.createSession(groupId, principal.getName(), body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupSessions(@PathVariable Long groupId) {
        try {
            return ResponseEntity.ok(sessionService.getGroupSessions(groupId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable Long sessionId, Principal principal) {
        try {
            sessionService.deleteSession(sessionId, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Session deleted."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
