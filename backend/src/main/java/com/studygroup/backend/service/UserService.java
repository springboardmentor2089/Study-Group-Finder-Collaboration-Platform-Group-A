package com.studygroup.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.studygroup.backend.entity.Course;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    // Register User
    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Get Profile
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Get Profile by ID
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Update Profile
    public User updateProfile(Long userId, User updatedUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedUser.getName() != null) {
            user.setName(updatedUser.getName());
        }
        if (updatedUser.getBio() != null) {
            user.setBio(updatedUser.getBio());
        }
        if (updatedUser.getUniversityName() != null) {
            user.setUniversityName(updatedUser.getUniversityName());
        }
        if (updatedUser.getUniversityPassingYear() != null) {
            user.setUniversityPassingYear(updatedUser.getUniversityPassingYear());
        }
        if (updatedUser.getUniversityPassingGPA() != null) {
            user.setUniversityPassingGPA(updatedUser.getUniversityPassingGPA());
        }
        if (updatedUser.getSecondarySchool() != null) {
            user.setSecondarySchool(updatedUser.getSecondarySchool());
        }
        if (updatedUser.getSecondarySchoolPassingYear() != null) {
            user.setSecondarySchoolPassingYear(updatedUser.getSecondarySchoolPassingYear());
        }
        if (updatedUser.getSecondarySchoolPercentage() != null) {
            user.setSecondarySchoolPercentage(updatedUser.getSecondarySchoolPercentage());
        }
        if (updatedUser.getHigherSecondarySchool() != null) {
            user.setHigherSecondarySchool(updatedUser.getHigherSecondarySchool());
        }
        if (updatedUser.getHigherSecondaryPassingYear() != null) {
            user.setHigherSecondaryPassingYear(updatedUser.getHigherSecondaryPassingYear());
        }
        if (updatedUser.getHigherSecondaryPercentage() != null) {
            user.setHigherSecondaryPercentage(updatedUser.getHigherSecondaryPercentage());
        }
        if (updatedUser.getProfileImageUrl() != null) {
            user.setProfileImageUrl(updatedUser.getProfileImageUrl());
        }

        return userRepository.save(user);
    }

    // Enroll Course
    public User enrollCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!user.getEnrolledCourses().contains(course)) {
            user.getEnrolledCourses().add(course);
        }
        return userRepository.save(user);
    }

    // Remove Course
    public User removeCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        user.getEnrolledCourses().remove(course);
        return userRepository.save(user);
    }
}
