package com.studygroup.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studygroup.backend.entity.StudySession;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByGroupIdOrderBySessionDateAsc(Long groupId);
}
