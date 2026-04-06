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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setProfileOpen(true)}>
              <i className="bi bi-list"></i>
            </button>
            <div className="header-brand">
              <div className="header-brand-icon">
                <i className="bi bi-mortarboard-fill" />
              </div>
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
            <NotificationBell /> {/* Only this, no extra bell icon */}
          </div>
        </div>
      </header>

      {/* PROFILE SIDEBAR */}
      <div className={`profile-sidebar ${profileOpen ? "open" : ""}`}>
        <div className="profile-sidebar-header">
          <button className="close-btn" onClick={() => setProfileOpen(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
          <h3>Your Profile</h3>
        </div>

        <div className="profile-sidebar-content">
          <div className="sidebar-avatar">
            {userInfo?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="sidebar-info">
            <h2>{userInfo?.name || "User"}</h2>
            <p className="email">{userInfo?.email}</p>
            {userInfo?.universityName && (
              <p className="university">
                <i className="bi bi-building" /> {userInfo.universityName}
              </p>
            )}
          </div>

          {userInfo?.bio && (
            <div className="sidebar-bio">
              <p>{userInfo.bio}</p>
            </div>
          )}

          {userInfo?.enrolledCourses?.length > 0 && (
            <div className="sidebar-courses">
              <h4>My Enrolled Courses</h4>
              <div className="sidebar-courses-list">
                {userInfo.enrolledCourses.map((course) => (
                  <span key={course.id} className="course-tag">
                    {course.courseName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-actions">
            <button
              className="sidebar-btn"
              onClick={() => navigate("/profile-edit")}
            >
              <i className="bi bi-pencil-fill" /> Edit Profile
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigate("/courses")}
            >
              <i className="bi bi-book-fill" /> Manage Courses
            </button>
            <button className="sidebar-btn logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" /> Logout
            </button>
          </div>
        </div>
      </div>

      {profileOpen && (
        <div className="overlay" onClick={() => setProfileOpen(false)}></div>
      )}

      {/* MAIN */}
      <div className="main-container">

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
              alt="Students studying"
              className="hero-image"
            />
            <div className="hero-overlay-text">
              <h1 className="hero-title">
                Together we can learn anything.
              </h1>
            </div>
          </div>
        </section>

        {/* GROUPS */}
        <section className="groups-section">
          <div className="section-header">
            <h2>My Study Groups</h2>
            <p className="section-subtitle">
              Groups you've joined or created
            </p>
          </div>

          <div className="browse-wrapper">
            <button
              className="browse-btn"
              onClick={() => navigate("/groups")}
            >
              <i className="bi bi-search"></i>
              Browse All Groups
            </button>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <div className="groups-grid">
            {myGroups.map((group) => (
              <div
                key={group.id}
                className="group-card"
                onClick={() =>
                  navigate("/chat", {
                    state: {
                      groupChat: {
                        id: group.id,
                        name: group.name,
                      },
                    },
                  })
                }
              >
                <div className="group-card-accent"></div>

                <div className="group-card-content">
                  <div className="group-icon">
                    {group.name?.charAt(0)?.toUpperCase() || "📚"}
                  </div>

                  <h3>{group.name}</h3>
                  <p className="group-description">
                    {group.description}
                  </p>

                  <div className="group-meta">
                    <span>
                      <i className="bi bi-people"></i>{" "}
                      {group.memberCount || 0} members
                    </span>
                    {group.isCreator && (
                      <span className="creator-badge">Admin</span>
                    )}
                  </div>

                  <button
                    className="group-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/chat", {
                        state: {
                          groupChat: {
                            id: group.id,
                            name: group.name,
                          },
                        },
                      });
                    }}
                  >
                    Open Chat →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;