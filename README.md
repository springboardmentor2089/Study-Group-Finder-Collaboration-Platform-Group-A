# Study Group Finder & Collaboration Platform – Complete Implementation

## Implementation Status: Milestone 1 & Milestone 2 Completed

This project is a **web-based collaboration platform for students** that allows them to connect with peers studying the same subjects, form study groups, and collaborate effectively through shared tools.

The platform improves **academic networking, group coordination, and study productivity**.



# Tech Stack

* Frontend: React.js +vite+ CSS
* Backend: Spring Boot (Java) + Node.js
* Database: MySQL
* Authentication: JWT Authentication
* API Communication: REST APIs



# Project Requirements

### Student Study Group Platform

The system allows students to:

* Create profiles with academic information
* Manage enrolled courses
* Discover students studying the same course
* Create and join study groups
* Collaborate using group communication tools
* Schedule study sessions
* Receive notifications for upcoming sessions

These functionalities improve **study efficiency and academic collaboration.** 




# Implemented Features

## Authentication & Profile Management

* User Registration
* User Login
* JWT Authentication
* Secure password storage
* Profile editing
* Academic details management

## Course Management

* Add enrolled courses
* Remove courses
* View course list
* Discover students enrolled in the same course

## Study Group Management

* Create study groups
* Join public groups
* Request to join private groups
* View group member list

## User Dashboard

* View joined groups
* Discover suggested peers
* Access study groups


# System Modules

### Module A: User Authentication & Course Management

* User registration and login
* Profile creation with academic details
* Avatar upload support
* Course enrollment management

### Module B: Group Creation, Discovery & Membership Management

* Create study groups
* Search study groups
* Filter groups by course
* Join public groups
* Request to join private groups
* Manage group members



# Milestone Implementation

## Milestone 1 – Authentication & Course Management (Week 1–2)

### Features Implemented

User Authentication System

* User registration
* User login
* JWT-based authentication

Profile Management

* Profile setup
* Academic details input
* Profile editing

Course Management

* Add enrolled courses
* Remove courses
* Maintain course list

Dashboard

* Display joined groups
* Show suggested peers

### Milestone 1 Deliverables

* Login Page
* Registration Page
* Profile Editing Page
* Dashboard Page 


# Milestone 2 – Group Creation & Discovery (Week 3–4)

### Features Implemented

Study Group Creation

* Create groups with

  * Group name
  * Description
  * Course association
  * Privacy settings

Group Discovery

* Search study groups
* Filter groups by course
* Filter by group size or activity

Membership Management

* Join public groups instantly
* Request access to private groups
* View group members

Notifications

* Email reminders
* Session notifications
* Group invite alerts

### Milestone 2 Deliverables

* Create Study Group Form
* Group Search with Filters
* Notifications




# Project File Structure

StudyGroupFinderAndCollaborationPlatform

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



# Database Schema

## User Table

* id
* name
* email
* password
* secondarySchool
* secondarySchoolPassingYear
* secondarySchoolPercentage
* higherSecondarySchool
* higherSecondaryPassingYear
* higherSecondaryPercentage
* universityName
* universityPassingYear
* universityPassingGPA

## Course Table

* id
* courseCode
* courseName
* description

## Group Table

* id
* name
* description
* courseId
* createdBy

## GroupMember Table

* groupId
* userId
* role (Admin / Member)

## Notification Table

* id
* userId
* type (Reminder / Invitation)
* status (Read / Unread) 


# System Workflow

### Registration Flow

User Registration
↓
Enter personal details
↓
Submit registration form
↓
Backend validation
↓
Store user in database
↓
Account created successfully


### Study Group Creation Flow

User logs in
↓
Navigates to Create Group
↓
Enter group details
↓
Select course and privacy option
↓
Group saved in database
↓
Members can join group


# Security Features

* JWT Authentication
* Secure REST APIs
* Password encryption
* Server-side validation
* Protected endpoints




# Commands to Execute the Project

## Backend

* cd backend
* .\mvnw.cmd clean install
* .\mvnw.cmd spring-boot:run


## Frontend

* cd frontend
* npm install
* npm run dev


## Database Setup

* Create MySQL database

* CREATE DATABASE studygroup;

* Tables will be created automatically using **Hibernate (JPA).**




# Project Status

* Milestone 1 – Completed
* Milestone 2 – Completed
* Milestone 3 – Planned
* Milestone 4 – Planned



# Contributors

* Poudala Lavanya
* Khursheed Iram
* Teja Senapathi
* Sreerangapuram Harsha Vardhan
* Preethi S
* Muga rohith krishna



# License

This project is developed as part of the **Infosys Springboard Internship Program**.
