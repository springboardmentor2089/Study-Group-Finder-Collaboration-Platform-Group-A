import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./GroupList.css";

export default function GroupList() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [actionState, setActionState] = useState({});

  const fetchGroups = useCallback(async (s, c) => {
    setLoading(true);
    try {
      const params = {};
      if (s) params.search = s;
      if (c) params.courseId = c;
      const res = await api.get("/api/groups", { params });
      setGroups(res.data);
      setFetchError("");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to load groups.";
      setFetchError(typeof msg === "string" ? msg : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups("", "");
    api.get("/user/courses").then(r => setCourses(r.data)).catch(() => {});
  }, [fetchGroups]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGroups(search, courseId);
  };

  const handleAction = async (e, group) => {
    e.stopPropagation();
    const isPublic = group.privacy === "PUBLIC";
    const endpoint = isPublic ? `/api/groups/join/${group.id}` : `/api/groups/request/${group.id}`;

    setActionState(prev => ({ ...prev, [group.id]: { processing: true, message: "", isError: false } }));

    try {
      await api.post(endpoint);
      setGroups(prev => prev.map(g =>
        g.id === group.id
          ? { ...g, isMember: isPublic ? true : g.isMember, isPending: isPublic ? false : true }
          : g
      ));
      setActionState(prev => ({ ...prev, [group.id]: { processing: false, message: "", isError: false } }));
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Action failed.";
      setActionState(prev => ({
        ...prev,
        [group.id]: { processing: false, message: typeof msg === "string" ? msg : "Error", isError: true },
      }));
    }
  };

  return (
    <div className="gl-page">
      <div className="gl-header">
        <div className="gl-header-inner">
          <h1><i className="bi bi-collection-fill me-2" />Study Group Finder</h1>
          <div className="gl-header-actions">
            <button className="gl-create-btn" onClick={() => navigate("/create-group")}>
              <i className="bi bi-plus-circle-fill me-1" />Create Group
            </button>
            <button className="gl-back-btn" onClick={() => navigate("/dashboard")}>
              <i className="bi bi-house-door-fill me-1" />Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="gl-container">
        {/* Search bar */}
        <form className="gl-search-row" onSubmit={handleSearch}>
          <input
            className="gl-search-input"
            type="text"
            placeholder="Search groups by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="gl-course-select"
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.courseName}</option>
            ))}
          </select>
          <button type="submit" className="gl-search-btn">
            <i className="bi bi-search me-1" />Search
          </button>
        </form>

        <div className="gl-title-row">
          <h2>Browse Study Groups</h2>
          <span className="gl-count">
            {!loading && !fetchError ? `${groups.length} group${groups.length !== 1 ? "s" : ""} found` : ""}
          </span>
        </div>

        {loading && (
          <div className="gl-loader-wrapper">
            <div className="gl-spinner" />
            <p>Loading groups...</p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="gl-fetch-error">
            <i className="bi bi-exclamation-triangle-fill me-2" />{fetchError}
          </div>
        )}

        {!loading && !fetchError && groups.length === 0 && (
          <div className="gl-empty">
            <i className="bi bi-search gl-empty-icon" />
            <p>No study groups found.</p>
            <button className="gl-create-btn" onClick={() => navigate("/create-group")}>
              <i className="bi bi-plus-circle-fill me-1" />Create the first one!
            </button>
          </div>
        )}

        {!loading && !fetchError && groups.length > 0 && (
          <div className="gl-grid">
            {groups.map((group) => {
              const state = actionState[group.id] || {};
              const isPublic = group.privacy === "PUBLIC";

              let btnClass = isPublic ? "gl-btn-join" : "gl-btn-request";
              let btnLabel = isPublic
                ? <><i className="bi bi-person-plus-fill me-1" />Join Group</>
                : <><i className="bi bi-send me-1" />Request to Join</>;
              let btnDisabled = state.processing;

              if (group.isMember) {
                btnClass = "gl-btn-joined";
                btnLabel = <><i className="bi bi-check-circle-fill me-1" />Joined</>;
                btnDisabled = true;
              } else if (group.isPending) {
                btnClass = "gl-btn-pending";
                btnLabel = <><i className="bi bi-hourglass-split me-1" />Pending</>;
                btnDisabled = true;
              } else if (group.isCreator) {
                btnClass = "gl-btn-joined";
                btnLabel = <><i className="bi bi-shield-check me-1" />Your Group</>;
                btnDisabled = true;
              }

              return (
                <div
                  key={group.id}
                  className="gl-card gl-card-clickable"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="gl-card-top">
                    <div className="gl-card-avatar">{group.name?.charAt(0)?.toUpperCase() || "G"}</div>
                    <span className={`gl-badge ${isPublic ? "gl-badge-public" : "gl-badge-private"}`}>
                      {isPublic
                        ? <><i className="bi bi-globe2 me-1" />Public</>
                        : <><i className="bi bi-lock-fill me-1" />Private</>}
                    </span>
                  </div>

                  <div className="gl-card-body">
                    <h3 className="gl-group-name">{group.name}</h3>
                    <p className="gl-group-desc">{group.description}</p>
                    {group.courseName && (
                      <span className="gl-course-tag">
                        <i className="bi bi-book-fill me-1" />{group.courseName}
                      </span>
                    )}
                    <span className="gl-member-count-tag">
                      <i className="bi bi-people-fill me-1" />{group.memberCount || 0} members
                    </span>
                  </div>

                  <div className="gl-card-footer">
                    <button
                      className={`gl-action-btn ${btnClass}`}
                      onClick={(e) => {
                        if (!group.isMember && !group.isPending && !group.isCreator) handleAction(e, group);
                        else e.stopPropagation();
                      }}
                      disabled={btnDisabled}
                    >
                      {state.processing ? (
                        <span className="gl-loading">
                          <span className="gl-spinner-sm" /> Processing...
                        </span>
                      ) : btnLabel}
                    </button>
                    {(group.isMember || group.isCreator) && (
                      <button
                        className="gl-open-btn"
                        onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}
                      >
                        <i className="bi bi-arrow-right-circle-fill me-1" />Open
                      </button>
                    )}
                    {state.message && state.isError && (
                      <p className="gl-action-msg gl-action-error">{state.message}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
