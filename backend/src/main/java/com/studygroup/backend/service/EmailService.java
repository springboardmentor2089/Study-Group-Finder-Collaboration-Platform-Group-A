package com.studygroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender javaMailSender;

    /**
     * Send OTP email to user
     */
    public void sendOtpEmail(String to, String otp) throws Exception {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject("Your StudyGroup Registration OTP Code");
            mail.setText("Hello,\n\n" +
                    "Your OTP code for StudyGroup registration is: " + otp + "\n\n" +
                    "This code will expire in 5 minutes.\n\n" +
                    "If you didn't request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "StudyGroup Team");
            
            javaMailSender.send(mail);
            logger.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to: {}", to, e);
            throw new Exception("Failed to send OTP email: " + e.getMessage());
        }
    }
}