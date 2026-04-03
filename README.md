# Study Group Finder & Collaboration Platform

## Implementation Status
Milestone 1, Milestone 2, Milestone 3 & Milestone 4 Completed

---

# Project Overview

The Study Group Finder & Collaboration Platform is a web application designed to help students connect with peers studying the same subjects and form effective study groups.

Users can create profiles, manage enrolled courses, discover other students studying similar subjects, and collaborate using built-in communication and productivity tools.

The platform promotes academic networking, improves study efficiency, and simplifies study group coordination.

---

# Project Statement

The Study Group Finder & Collaboration Platform helps students connect with peers in the same courses to form effective study groups.

Users can create profiles, list their enrolled courses, discover others taking the same subjects, and collaborate using built-in communication and productivity tools.

The system promotes academic networking, improves study efficiency, and makes group work coordination seamless.

---

# Tech Stack

Frontend  
React.js + Vite + CSS

Backend  
Spring Boot (Java)

Database  
MySQL

Authentication  
JWT Authentication

Communication  
REST APIs + WebSockets

---

# System Outcomes

• User authentication and profile creation with academic details  
• Add and manage a list of enrolled courses  
• Search and discover other students in the same course  
• Create and join study groups with privacy settings  
• Real-time group chat for communication  
• Integrated calendar for scheduling study sessions  
• Notifications for group invites and session reminders  

---

# System Architecture

Frontend (React)  
↓  
REST APIs & WebSockets  
↓  
Spring Boot Backend  
↓  
MySQL Database

---

# Project Modules

Module A – User Authentication & Course Management

Module B – Group Creation, Discovery & Membership Management

Module C – Group Chat & Collaboration

Module D – Calendar Scheduling & Notifications

---

# Implemented Features

## Authentication & Profile Management

• User Registration  
• User Login  
• JWT Authentication  
• Secure password storage  
• Profile editing  
• Academic details management  

---

## Course Management

• Add enrolled courses  
• Remove courses  
• Maintain course list  
• Discover students enrolled in the same course  

---

## Study Group Management

• Create study groups  
• Join public groups  
• Request to join private groups  
• View group member list  

---

## Dashboard

• View joined groups  
• Suggested peers based on enrolled courses  

---

## Communication

• Real-time group chat using WebSockets  
• Instant messaging updates  
• Messaging widget for group collaboration  

---

## Scheduling & Notifications

• Study session scheduling using calendar  
• Session creation with title, description, date and time  
• Session reminders for users  
• Notifications for group invitations and session updates  

---

# Milestone Implementation

---

# Milestone 1 – Authentication & Course Management (Week 1–2)

### Features Implemented

User Authentication System

• User registration  
• User login  
• JWT-based authentication  

Profile Management

• Profile setup  
• Academic details input  
• Profile editing  

Course Management

• Add enrolled courses  
• Remove courses  
• Maintain course list  

Dashboard

• Display joined groups  
• Show suggested peers  

### Deliverables

• Login Page  
• Registration Page  
• Profile Editing Page  
• Dashboard Page  

---

# Milestone 2 – Group Creation & Discovery (Week 3–4)

### Features Implemented

Study Group Creation

Create groups with:

• Group name  
• Description  
• Course association  
• Privacy settings  

Group Discovery

• Search study groups  
• Filter groups by course  
• Filter groups by group size or activity  

Membership Management

• Join public groups instantly  
• Request to join private groups  
• View group members  

### Deliverables

• Create Study Group Form  
• Group Search with Filters  
• Group Member List  

---

# Milestone 3 – Communication & Collaboration (Week 5–6)

### Features Implemented

Real-time communication between study group members.

• Real-time group chat using WebSockets  
• Instant message updates  
• Communication between group members  

### Deliverables

• Chat Page  
• Messaging Widget  

---

# Milestone 4 – Scheduling & Notifications (Week 7–8)

### Features Implemented

Study Session Scheduling

• Group calendar for scheduling study sessions  
• Session creation with title, description, date and time  
• Session management for groups  

Notifications

• Notifications for upcoming study sessions  
• Group invitation alerts  
• Reminder notifications for scheduled sessions  

### Deliverables

• Calendar Widget  
• Event Creation Form  
• Notification System  

---

# Project File Structure

Study-Group-Finder-Collaboration-Platform

backend  
├── controller  
├── entity  
├── repository  
├── service  
├── config  
└── resources  

frontend  
├── pages  
├── components  
├── context  
├── styles  
└── api  

---

# Database Schema

## User

id – Unique identifier for the user  
name – Name of the user  
email – Email of the user  
password – Password  

secondarySchool  
secondarySchoolPassingYear  
secondarySchoolPercentage  

higherSecondarySchool  
higherSecondaryPassingYear  
higherSecondaryPercentage  

universityName  
universityPassingYear  
universityPassingGPA  

---

## Course

id – Course ID  
courseCode – Unique identifier for course  
courseName – Name of the course  
description – Course description  

---

## Group

id – Unique identifier of group  
name – Group name  
description – Group description  
courseId – Course associated with group  
createdBy – User who created the group  

---

## GroupMember

groupId – ID of group  
userId – ID of user  
role – Admin / Member  

---

## Session

id – Unique identifier of session  
groupId – Group to which session belongs  
title – Session title  
description – Session description  
date – Session date  
createdBy – User who created the session  

---

## Notification

id – Notification ID  
userId – User receiving notification  
type – Reminder / Invitation  
status – Read / Unread  

---

# System Workflow

## Registration Flow

User Registration  
↓  
Enter personal details  
↓  
Backend validation  
↓  
Store user in database  
↓  
Account created successfully  

---

## Study Group Creation Flow

User logs in  
↓  
Navigate to Create Group  
↓  
Enter group details  
↓  
Select course and privacy option  
↓  
Group saved in database  
↓  
Members can join the group  

---

# Running the Project

## Backend

cd backend

./mvnw clean install  
./mvnw spring-boot:run

---

## Frontend

cd frontend

npm install  
npm run dev

---

# Database Setup

Create MySQL database:

CREATE DATABASE studygroup;

Tables will be created automatically using Hibernate (JPA).

---

# Project Status

Milestone 1 – Completed  
Milestone 2 – Completed  
Milestone 3 – Completed  
Milestone 4 – Completed  

---

# Contributors

Poudala Lavanya  
Khursheed Iram  
Teja Senapathi  
Sreerangapuram Harsha Vardhan  
Preethi S  
Muga Rohith Krishna
