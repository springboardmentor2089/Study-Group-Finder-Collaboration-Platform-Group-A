package com.studygroup.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.studygroup.backend.entity.JoinRequest;
import com.studygroup.backend.entity.JoinRequest.RequestStatus;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByGroupIdAndStatus(Long groupId, RequestStatus status);
    @Modifying
    @Transactional
    @Query("DELETE FROM JoinRequest j WHERE j.group.id = :groupId")
    void deleteByGroupId(Long groupId);
    Optional<JoinRequest> findByGroupIdAndUserId(Long groupId, Long userId);
    List<JoinRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, RequestStatus status);
}
