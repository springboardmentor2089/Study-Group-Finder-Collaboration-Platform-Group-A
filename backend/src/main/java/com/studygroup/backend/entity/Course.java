package com.studygroup.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String courseCode;

    private String courseName;

    private String description;

    // Constructor for initialization
    public Course(String courseCode, String courseName, String description) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.description = description;
    }
}
