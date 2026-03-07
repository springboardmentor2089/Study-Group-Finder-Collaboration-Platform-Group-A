import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../api";
import useAuth from "../context/useAuth";
import "./GroupDetail.css";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Group info
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({ title: "", description: "", sessionDate: "" });

  // Active tab
  const [activeTab, setActiveTab] = useState("members");

  // Current user email (from JWT sub claim)
  const [myEmail, setMyEmail] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const parts = token.split(".");
        const decoded = JSON.parse(atob(parts[1]));
        // JWT sub is the user's email
        setMyEmail(decoded.sub || decoded.email);
      } catch {}
    }
  }, [token]);

  const fetchGroup = useCallback(async () => {
    try {
      const [groupRes, sessionsRes] = await Promise.all([
        api.get(`/api/groups/${id}`),
        api.get(`/api/sessions/group/${id}`),
      ]);
      setGroup(groupRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      setError("Failed to load group details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await api.get(`/api/groups/${id}/members`);
      setMembers(res.data);
    } catch {
      // silently fail — members may not be accessible
    }
  }, [id]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get(`/api/groups/${id}/requests`);
      setRequests(res.data);
    } catch {
      // Not creator — silently skip
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
    fetchMembers();
  }, [fetchGroup, fetchMembers]);

  useEffect(() => {
    if (group?.isCreator) fetchRequests();
  }, [group, fetchRequests]);

  // ── Join requests ──
  const handleAccept = async (requestId) => {
    try {
      await api.post(`/api/groups/requests/${requestId}/accept`);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      fetchGroup();
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept request.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/api/groups/requests/${requestId}/reject`);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request.");
    }
  };

  // ── Remove member ──
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      await api.delete(`/api/groups/${id}/members/${memberId}`);
      fetchMembers();
      fetchGroup();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  };

  // ── Sessions ──
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/sessions/group/${id}`, sessionForm);
      setSessions((prev) => [...prev, res.data]);
      setSessionForm({ title: "", description: "", sessionDate: "" });
      setShowSessionForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create session.");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await api.delete(`/api/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete session.");
    }
  };

  if (loading) {
    return (
      <div className="gd-loading">
        <div className="gd-spinner" />
        <p>Loading group…</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="gd-error">
        <p>⚠️ {error || "Group not found."}</p>
        <button onClick={() => navigate("/groups")}>← Back to Groups</button>
      </div>
    );
  }

  return (
    <div className="gd-page">
      {/* Header */}
      <div className="gd-header">
        <div className="gd-header-inner">
          <div className="gd-header-left">
            <button className="gd-back-btn" onClick={() => navigate("/groups")}>
              <i className="bi bi-arrow-left" /> Back
            </button>
            <div>
              <h1>{group.name}</h1>
              <p className="gd-desc">{group.description}</p>
            </div>
          </div>
          <div className="gd-header-meta">
            <span className={`gd-badge ${group.privacy === "PUBLIC" ? "gd-badge-public" : "gd-badge-private"}`}>
              {group.privacy === "PUBLIC"
                ? <><i className="bi bi-globe2" /> Public</>
                : <><i className="bi bi-lock-fill" /> Private</>}
            </span>
            {group.isCreator && (
              <span className="gd-creator-tag"><i className="bi bi-shield-check" /> Admin</span>
            )}
            <span className="gd-member-count">
              <i className="bi bi-people-fill" /> {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="gd-tabs">
        {["members", "sessions", ...(group.isCreator ? ["requests"] : [])].map((tab) => (
          <button
            key={tab}
            className={`gd-tab ${activeTab === tab ? "gd-tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "members" && <><i className="bi bi-people-fill" /> Members <span className="badge bg-primary ms-1">{members.length}</span></>}
            {tab === "sessions" && <><i className="bi bi-calendar-event-fill" /> Sessions <span className="badge bg-primary ms-1">{sessions.length}</span></>}
            {tab === "requests" && <><i className="bi bi-person-plus-fill" /> Requests{requests.length > 0 && <span className="badge bg-danger ms-1">{requests.length}</span>}</>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="gd-content">

        {/* ── MEMBERS TAB ── */}
        {activeTab === "members" && (
          <div className="gd-members">
            {members.map((member) => (
              <div key={member.id} className="gd-member-card">
                <div className="gd-member-avatar">{member.name?.charAt(0)?.toUpperCase()}</div>
                <div className="gd-member-info">
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                </div>
                <span className={`gd-role-badge ${member.role === "Admin" ? "gd-role-admin" : "gd-role-member"}`}>
                  {member.role === "Admin"
                    ? <><i className="bi bi-shield-check" /> Admin</>
                    : <><i className="bi bi-person" /> Member</>}
                </span>
                {group.isCreator && member.role !== "Admin" && (
                  <button
                    className="gd-remove-btn"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <i className="bi bi-person-x" /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── SESSIONS TAB ── */}
        {activeTab === "sessions" && (
          <div className="gd-sessions">
            {group.isMember && (
              <div className="gd-sessions-toolbar">
                <button
                  className="gd-create-session-btn"
                  onClick={() => setShowSessionForm(!showSessionForm)}
                >
                  {showSessionForm
                    ? <><i className="bi bi-x-lg" /> Cancel</>
                    : <><i className="bi bi-calendar-plus" /> Schedule Session</>}
                </button>
              </div>
            )}

            {showSessionForm && (
              <form className="gd-session-form" onSubmit={handleCreateSession}>
                <h3><i className="bi bi-calendar-event me-2" />New Study Session</h3>
                <input
                  type="text"
                  placeholder="Session title"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                />
                <input
                  type="datetime-local"
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                  required
                />
                <button type="submit" className="gd-submit-btn">Create Session</button>
              </form>
            )}

            {sessions.length === 0 && (
              <div className="gd-empty-msg">
                <i className="bi bi-calendar-x gd-empty-msg-icon" />
                <p>No sessions scheduled yet.</p>
              </div>
            )}

            {sessions.map((session) => (
              <div key={session.id} className="gd-session-card">
                <div className="gd-session-icon-wrap"><i className="bi bi-calendar-event-fill" /></div>
                <div className="gd-session-info">
                  <h4>{session.title}</h4>
                  {session.description && <p>{session.description}</p>}
                  <span className="gd-session-date">
                    <i className="bi bi-clock me-1" />
                    {session.sessionDate
                      ? new Date(session.sessionDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                      : "TBD"}
                  </span>
                  <span className="gd-session-creator">
                    <i className="bi bi-person me-1" />by {session.createdByName}
                  </span>
                </div>
                {(group.isCreator || session.createdByEmail === myEmail) && (
                  <button
                    className="gd-delete-session-btn"
                    onClick={() => handleDeleteSession(session.id)}
                    title="Delete session"
                  >
                    <i className="bi bi-trash3-fill" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── JOIN REQUESTS TAB (creator only) ── */}
        {activeTab === "requests" && group.isCreator && (
          <div className="gd-requests">
            {requests.length === 0 && (
              <div className="gd-empty-msg">
                <i className="bi bi-emoji-smile gd-empty-msg-icon" />
                <p>No pending join requests.</p>
              </div>
            )}
            {requests.map((req) => (
              <div key={req.requestId} className="gd-request-card">
                <div className="gd-request-avatar">{req.userName?.charAt(0)?.toUpperCase()}</div>
                <div className="gd-request-info">
                  <strong>{req.userName}</strong>
                  <span>{req.userEmail}</span>
                  <span className="gd-request-time">
                    <i className="bi bi-clock-history me-1" />
                    Requested: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <div className="gd-request-actions">
                  <button
                    className="gd-accept-btn"
                    onClick={() => handleAccept(req.requestId)}
                  >
                    <i className="bi bi-check-circle-fill" /> Accept
                  </button>
                  <button
                    className="gd-reject-btn"
                    onClick={() => handleReject(req.requestId)}
                  >
                    <i className="bi bi-x-circle-fill" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}