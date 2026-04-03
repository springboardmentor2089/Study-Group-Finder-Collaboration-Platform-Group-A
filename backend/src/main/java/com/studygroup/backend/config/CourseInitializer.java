package com.studygroup.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.studygroup.backend.entity.Course;
import com.studygroup.backend.repository.CourseRepository;

@Component
public class CourseInitializer implements CommandLineRunner {

    private final CourseRepository courseRepository;

    public CourseInitializer(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if courses already exist
        if (courseRepository.count() == 0) {
            // Create sample courses
            Course[] courses = {
                new Course("CS101", "Data Structures", "Master fundamental data structures including arrays, linked lists, stacks, queues, and trees"),
                new Course("CS102", "Algorithms", "Learn algorithm design and analysis techniques"),
                new Course("CS103", "Database Management System", "SQL and NoSQL databases fundamentals"),
                new Course("CS104", "Operating Systems", "Process management, memory management, and scheduling"),
                new Course("CS105", "Web Development Basics", "HTML, CSS, and JavaScript fundamentals"),
                new Course("CS106", "Python Programming", "Learn Python programming from basics to advanced"),
                new Course("CS107", "Object Oriented Programming", "OOP concepts and design patterns"),
                new Course("CS108", "System Design", "Design scalable and distributed systems"),
                new Course("CS109", "Machine Learning 101", "Introduction to ML algorithms and applications"),
                new Course("CS110", "Cloud Computing", "AWS, Azure, and GCP basics"),
                new Course("CS111", "DevOps Essentials", "Docker, Kubernetes, and CI/CD pipelines"),
                new Course("CS112", "Competitive Programming", "Coding interview preparation and algorithms")
            };

            for (Course course : courses) {
                courseRepository.save(course);
            }
            
            System.out.println("✓ Sample courses initialized successfully!");
        }
    }
}
