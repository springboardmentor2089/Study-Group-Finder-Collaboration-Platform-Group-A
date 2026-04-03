package com.studygroup.backend.service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OtpService {
    
    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    
    private static class OtpDetails {
        String otp;
        LocalDateTime expiryTime;
        
        OtpDetails(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
    
    private ConcurrentHashMap<String, OtpDetails> otpMap = new ConcurrentHashMap<>();

    /**
     * Generate and store OTP for email (valid for 5 minutes)
     */
    public String generateAndStoreOtp(String email) {
        String otp = String.valueOf((int) ((Math.random() * 900000) + 100000)); // 6-digit
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);
        otpMap.put(email, new OtpDetails(otp, expiry));
        logger.info("OTP generated for email: {}", email);
        return otp;
    }

    /**
     * Get OTP if valid and not expired
     */
    public String getOtp(String email) {
        OtpDetails details = otpMap.get(email);
        if (details == null || details.expiryTime.isBefore(LocalDateTime.now())) {
            otpMap.remove(email);
            return null;
        }
        return details.otp;
    }

    /**
     * Verify OTP and remove it if valid
     */
    public boolean verifyOtp(String email, String otp) {
        OtpDetails details = otpMap.get(email);
        boolean valid = details != null 
                && details.otp.equals(otp)
                && details.expiryTime.isAfter(LocalDateTime.now());
        
        if (valid) {
            otpMap.remove(email); // Remove after verification
            logger.info("OTP verified successfully for email: {}", email);
        } else {
            logger.warn("OTP verification failed for email: {}", email);
        }
        return valid;
    }

    /**
     * Clear OTP for email
     */
    public void clearOtp(String email) {
        otpMap.remove(email);
        logger.info("OTP cleared for email: {}", email);
    }
}