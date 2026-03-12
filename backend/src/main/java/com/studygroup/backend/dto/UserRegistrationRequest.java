package com.studygroup.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class UserRegistrationRequest {
    private String name;
    private String email;
    private String password;
    private String universityName;
    private String universityPassingYear;
    private String secondarySchool;
    private Integer secondarySchoolPassingYear;
    private String higherSecondarySchool;
    private Integer higherSecondaryPassingYear;
    private Double universityPassingGPA;
    private String bio;
    private String profileImageUrl;
    private String otp;

    // Constructors
    

    public UserRegistrationRequest(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }

    public String getUniversityPassingYear() { return universityPassingYear; }
    public void setUniversityPassingYear(String universityPassingYear) { this.universityPassingYear = universityPassingYear; }

    public String getSecondarySchool() { return secondarySchool; }
    public void setSecondarySchool(String secondarySchool) { this.secondarySchool = secondarySchool; }

    public Integer getSecondarySchoolPassingYear() { return secondarySchoolPassingYear; }
    public void setSecondarySchoolPassingYear(Integer secondarySchoolPassingYear) { this.secondarySchoolPassingYear = secondarySchoolPassingYear; }

    public String getHigherSecondarySchool() { return higherSecondarySchool; }
    public void setHigherSecondarySchool(String higherSecondarySchool) { this.higherSecondarySchool = higherSecondarySchool; }

    public Integer getHigherSecondaryPassingYear() { return higherSecondaryPassingYear; }
    public void setHigherSecondaryPassingYear(Integer higherSecondaryPassingYear) { this.higherSecondaryPassingYear = higherSecondaryPassingYear; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}