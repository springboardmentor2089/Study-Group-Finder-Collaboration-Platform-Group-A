package com.studygroup.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.studygroup.backend.entity.StudySession;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByGroupIdOrderBySessionDateAsc(Long groupId);
    @Modifying
    @Transactional
    @Query("DELETE FROM StudySession s WHERE s.group.id = :groupId")
    void deleteByGroupId(Long groupId);
}
