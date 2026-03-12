import { useState, useEffect } from "react";
import useAuth from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../api";
import NotificationBell from "../components/NotificationBell";
import "./Dashboard.css";

function Dashboard() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const parts = token.split(".");
        const decoded = JSON.parse(atob(parts[1]));
        const email = decoded.sub;

        const [profileRes, groupsRes] = await Promise.all([
          api.get("/user/profile", { params: { email } }),
          api.get("/api/groups/my"),
        ]);

        setUserInfo(profileRes.data);
        setMyGroups(groupsRes.data || []);
        setError("");
      } catch (err) {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => { logout(); navigate("/login"); };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading your dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header - Keeping your original content */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setProfileOpen(true)}>
              <i className="bi bi-list"></i>
            </button>
            <div className="header-brand">
              <div className="header-brand-icon"><i className="bi bi-mortarboard-fill" /></div>
              <h1>StudyGroup <span>Finder</span></h1>
            </div>
          </div>
          <div className="header-nav">
            <button className="btn-nav" onClick={() => navigate("/groups")}>
              <i className="bi bi-search" /> Browse Groups
            </button>
            <button className="btn-nav" onClick={() => navigate("/create-group")}>
              <i className="bi bi-plus-circle-fill" /> Create Group
            </button>
            <button className="btn-nav" onClick={() => navigate("/courses")}>
              <i className="bi bi-book-fill" /> My Courses
            </button>
            <button className="btn-nav notification-btn">
        <i className="bi bi-bell-fill"></i>
        <NotificationBell />
      </button>
            
          </div>
        </div>
      </header>

      {/* Slide-out Profile Panel */}
      <div className={`profile-sidebar ${profileOpen ? 'open' : ''}`}>
        <div className="profile-sidebar-header">
          <button className="close-btn" onClick={() => setProfileOpen(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
          <h3>Your Profile</h3>
        </div>
        
        <div className="profile-sidebar-content">
          {/* Profile Avatar */}
          <div className="sidebar-avatar">
            {userInfo?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          
          {/* Profile Info */}
          <div className="sidebar-info">
            <h2>{userInfo?.name || "User"}</h2>
            <p className="email">{userInfo?.email}</p>
            {userInfo?.universityName && (
              <p className="university">
                <i className="bi bi-building" /> {userInfo.universityName}
              </p>
            )}
          </div>

          {/* Profile Bio */}
          {userInfo?.bio && (
            <div className="sidebar-bio">
              <p>{userInfo.bio}</p>
            </div>
          )}

          {/* Enrolled Courses in Sidebar */}
          {userInfo?.enrolledCourses && userInfo.enrolledCourses.length > 0 && (
            <div className="sidebar-courses">
              <h4>My Enrolled Courses</h4>
              <div className="sidebar-courses-list">
                {userInfo.enrolledCourses.map((course) => (
                  <span key={course.id} className="course-tag">{course.courseName}</span>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar Actions */}
          <div className="sidebar-actions">
            <button className="sidebar-btn" onClick={() => navigate("/profile-edit")}>
              <i className="bi bi-pencil-fill" /> Edit Profile
            </button>
            <button className="sidebar-btn" onClick={() => navigate("/courses")}>
              <i className="bi bi-book-fill" /> Manage Courses
            </button>
            <button className="sidebar-btn logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay when profile is open */}
      {profileOpen && <div className="overlay" onClick={() => setProfileOpen(false)}></div>}

      {/* Main Content */}
      <div className="main-container">
        {/* SECTION 1: Hero Image - Wide with rounded bottom corners only */}
        <section className="hero-section">
          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
              alt="Students studying together online on laptops"
              className="hero-image"
            />
            <div className="hero-overlay-text">
              <h1 className="hero-title">Together we can learn anything.</h1>
              <p className="hero-login-text">
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Sign in</a>
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: My Study Groups */}
        <section className="groups-section">
          <div className="section-header">
            <h2>My Study Groups</h2>
            <p className="section-subtitle">Groups you've joined or created</p>
          </div>

          <div className="browse-wrapper">
            <button className="browse-btn" onClick={() => navigate("/groups")}>
              <i className="bi bi-search"></i>
              Browse All Groups
            </button>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          {myGroups.length === 0 && !error ? (
            <div className="empty-state">
              <i className="bi bi-collection"></i>
              <p>No groups joined yet</p>
            </div>
          ) : (
            <div className="groups-grid">
              {myGroups.map((group) => (
                <div
                  key={group.id}
                  className="group-card"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="group-card-accent"></div>
                  <div className="group-card-content">
                    <div className="group-icon">
                      {group.name?.charAt(0)?.toUpperCase() || '📚'}
                    </div>
                    <h3>{group.name}</h3>
                    <p className="group-description">{group.description}</p>
                    <div className="group-meta">
                      <span><i className="bi bi-people"></i> {group.memberCount || 0} members</span>
                      {group.isCreator && (
                        <span className="creator-badge">
                          <i className="bi bi-shield-check"></i> Admin
                        </span>
                      )}
                    </div>
                    <button className="group-link" onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}>
                      View Group <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Group Card - Inside Groups Section */}
          <div className="create-card" onClick={() => navigate("/create-group")}>
            <div className="create-card-content">
              <div className="create-icon">
                <i className="bi bi-plus-circle-fill"></i>
              </div>
              <div className="create-text">
                <h3>Create New Study Group</h3>
                <p>Start your own learning community</p>
              </div>
              <button className="create-link">
                Create <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: My Courses */}
        <section className="courses-main-section">
          <div className="section-header">
            <h2>My Courses</h2>
            <p className="section-subtitle">Your enrolled subjects</p>
          </div>

          {userInfo?.enrolledCourses && userInfo.enrolledCourses.length > 0 ? (
            <div className="courses-grid">
              {userInfo.enrolledCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-card-content">
                    <div className="course-icon">
                      <i className="bi bi-book"></i>
                    </div>
                    <h3>{course.courseName}</h3>
                    <p className="course-code">{course.courseCode || 'Active Course'}</p>
                    <button className="course-link" onClick={() => navigate("/courses")}>
                      View Course <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-courses">
              <i className="bi bi-journal-bookmark"></i>
              <p>No courses enrolled yet</p>
              <button className="secondary-btn" onClick={() => navigate("/courses")}>
                Browse Courses
              </button>
            </div>
          )}
        </section>
      </div>

      {/* SECTION 4: Footer - Light Grey */}
      <footer className="dashboard-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <i className="bi bi-mortarboard-fill"></i>
            <span>StudyGroup Finder</span>
          </div>
          <div className="footer-links">
            <a href="#" onClick={(e) => e.preventDefault()}>About</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} StudyGroup Finder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;