package com.studygroup.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studygroup.backend.entity.StudyGroup;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    List<StudyGroup> findAllByOrderByCreatedAtDesc();

    @Query("SELECT g FROM StudyGroup g WHERE " +
           "(:search IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:courseId IS NULL OR g.course.id = :courseId)")
    List<StudyGroup> searchGroups(@Param("search") String search, @Param("courseId") Long courseId);

    List<StudyGroup> findByMembersId(Long userId);
    List<StudyGroup> findByCreatorId(Long userId);
}
