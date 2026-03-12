package com.studygroup.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studygroup.backend.entity.JoinRequest;
import com.studygroup.backend.entity.JoinRequest.RequestStatus;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByGroupIdAndStatus(Long groupId, RequestStatus status);
    Optional<JoinRequest> findByGroupIdAndUserId(Long groupId, Long userId);
    List<JoinRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, RequestStatus status);
}
