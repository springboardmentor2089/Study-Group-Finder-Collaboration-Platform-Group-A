package com.studygroup.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studygroup.backend.entity.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
