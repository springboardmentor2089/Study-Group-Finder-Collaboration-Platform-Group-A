package com.studygroup.backend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "study_groups")
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String privacy = "PUBLIC"; // PUBLIC or PRIVATE

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToMany
    @JoinTable(
            name = "group_members",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private List<StudySession> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private List<JoinRequest> joinRequests = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
