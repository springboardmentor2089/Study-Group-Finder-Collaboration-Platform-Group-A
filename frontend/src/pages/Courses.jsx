import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import api from "../api";
import "./Courses.css";

function Courses() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get user info
        const parts = token.split(".");
        const decoded = JSON.parse(atob(parts[1]));
        const email = decoded.sub;

        const userResponse = await api.get("/user/profile", {
          params: { email }
        });

        setUserId(userResponse.data.id);
        setEnrolledCourses(userResponse.data.enrolledCourses || []);

        // Get all courses
        const coursesResponse = await api.get("/user/courses");
        setAllCourses(coursesResponse.data);
        setError("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  const handleEnroll = async (courseId) => {
    try {
      const response = await api.post("/user/enroll", null, {
        params: {
          userId,
          courseId
        }
      });

      setEnrolledCourses(response.data.enrolledCourses);
      setError("");
    } catch (err) {
      console.error("Error enrolling course:", err);
      setError("Failed to enroll course");
    }
  };

  const handleRemove = async (courseId) => {
    try {
      const response = await api.delete("/user/remove", {
        params: {
          userId,
          courseId
        }
      });

      setEnrolledCourses(response.data.enrolledCourses);
      setError("");
    } catch (err) {
      console.error("Error removing course:", err);
      setError("Failed to remove course");
    }
  };

  const filteredCourses = allCourses.filter(course =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <div className="header-content">
          <h1>Course Management</h1>
          <button className="btn-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="courses-wrapper">
        {error && <div className="error-message">{error}</div>}

        {/* Enrolled Courses Section */}
        <section className="enrolled-section">
          <h2>My Enrolled Courses ({enrolledCourses.length})</h2>
          {enrolledCourses.length === 0 ? (
            <p className="no-courses">You haven't enrolled in any courses yet. Browse courses below to get started!</p>
          ) : (
            <div className="courses-list">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="course-item enrolled">
                  <div className="course-content">
                    <div className="course-code">{course.courseCode}</div>
                    <h3>{course.courseName}</h3>
                    {course.description && (
                      <p className="course-description">{course.description}</p>
                    )}
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => handleRemove(course.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Courses Section */}
        <section className="available-section">
          <h2>Available Courses</h2>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by course name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredCourses.length === 0 ? (
            <p className="no-courses">No courses found matching your search.</p>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => {
                const enrolled = isEnrolled(course.id);
                return (
                  <div
                    key={course.id}
                    className={`course-card ${enrolled ? "enrolled-badge" : ""}`}
                  >
                    <div className="course-header">
                      <span className="course-code">{course.courseCode}</span>
                      {enrolled && <span className="enrolled-label">✓ Enrolled</span>}
                    </div>
                    <h3>{course.courseName}</h3>
                    {course.description && (
                      <p className="description">{course.description}</p>
                    )}
                    <button
                      className={enrolled ? "btn-enrolled" : "btn-enroll"}
                      onClick={() => {
                        if (enrolled) {
                          handleRemove(course.id);
                        } else {
                          handleEnroll(course.id);
                        }
                      }}
                    >
                      {enrolled ? "Remove" : "Enroll"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Courses;
