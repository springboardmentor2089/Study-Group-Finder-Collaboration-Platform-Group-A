package com.studygroup.backend.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studygroup.backend.entity.Course;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CourseRepository courseRepository;

    // Get Profile by Email
    @GetMapping("/profile")
    public User getProfile(@RequestParam String email) {
        return userService.getUserByEmail(email);
    }

    // Get current logged-in user's basic info (id + email + name)
    @GetMapping("/me")
    public Map<String, Object> getMe(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("name", user.getName());
        return map;
    }

    // Get Profile by ID
    @GetMapping("/profile/{id}")
    public User getProfileById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Update Profile
    @PutMapping("/profile/{id}")
    public User updateProfile(@PathVariable Long id, @RequestBody User user) {
        return userService.updateProfile(id, user);
    }

    // Get All Courses
    @GetMapping("/courses")
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // Enroll Course
    @PostMapping("/enroll")
    public User enrollCourse(@RequestParam Long userId,
                             @RequestParam Long courseId) {
        return userService.enrollCourse(userId, courseId);
    }

    // Remove Course
    @DeleteMapping("/remove")
    public User removeCourse(@RequestParam Long userId,
                             @RequestParam Long courseId) {
        return userService.removeCourse(userId, courseId);
    }
}
