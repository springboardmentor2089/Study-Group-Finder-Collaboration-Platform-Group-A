package com.studygroup.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studygroup.backend.dto.UserRegistrationRequest;
import com.studygroup.backend.entity.User;
import com.studygroup.backend.model.LoginRequest;
import com.studygroup.backend.model.LoginResponse;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.service.JwtService;
import com.studygroup.backend.service.OtpService;
import com.studygroup.backend.service.EmailService;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    /**
     * Send OTP to email
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Check if email already registered
            if (userRepository.findByEmail(email).isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Generate OTP
            String otp = otpService.generateAndStoreOtp(email);

            // Send email
            emailService.sendOtpEmail(email, otp);

            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Register with OTP verification and year validation
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest request) {
        try {
            // Validate OTP
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "OTP is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Invalid or expired OTP");
                return ResponseEntity.badRequest().body(response);
            }

            // Check if email already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate university year if provided
            if (request.getUniversityPassingYear() != null && 
                !request.getUniversityPassingYear().trim().isEmpty()) {
                
                String yearStr = request.getUniversityPassingYear().trim();
                
                // Check if 4 digits
                if (!yearStr.matches("\\d{4}")) {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "Passing year must be exactly 4 digits");
                    return ResponseEntity.badRequest().body(response);
                }
                
                // Check range
                int yearInt = Integer.parseInt(yearStr);
                if (yearInt < 1980 || yearInt > 2040) {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "Passing year must be between 1980 and 2040");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            // Create new user
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole("ROLE_USER");
            
            // Set optional academic details
            if (request.getUniversityName() != null && !request.getUniversityName().trim().isEmpty()) {
                user.setUniversityName(request.getUniversityName());
            }
            if (request.getUniversityPassingYear() != null && !request.getUniversityPassingYear().trim().isEmpty()) {
                user.setUniversityPassingYear(Integer.parseInt(request.getUniversityPassingYear()));
            }
            if (request.getSecondarySchool() != null && !request.getSecondarySchool().trim().isEmpty()) {
                user.setSecondarySchool(request.getSecondarySchool());
            }
            if (request.getSecondarySchoolPassingYear() != null) {
                user.setSecondarySchoolPassingYear(request.getSecondarySchoolPassingYear());
            }
            if (request.getHigherSecondarySchool() != null && !request.getHigherSecondarySchool().trim().isEmpty()) {
                user.setHigherSecondarySchool(request.getHigherSecondarySchool());
            }
            if (request.getHigherSecondaryPassingYear() != null) {
                user.setHigherSecondaryPassingYear(request.getHigherSecondaryPassingYear());
            }
            if (request.getBio() != null && !request.getBio().trim().isEmpty()) {
                user.setBio(request.getBio());
            }
            
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }

            String token = jwtService.generateToken(user.getEmail());

            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}