import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./CreateGroup.css";

export default function CreateGroup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    courseId: "",
    privacy: "PUBLIC",
  });

  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api.get("/user/courses")
      .then(r => setCourses(r.data || []))
      .catch(() => {});
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Group name is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await api.post("/api/groups", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        courseId: formData.courseId || null,
        privacy: formData.privacy,
      });
      setSuccessMessage("Group created successfully!");
      setFormData({ name: "", description: "", courseId: "", privacy: "PUBLIC" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to create group. Please try again.";
      setErrorMessage(typeof msg === "string" ? msg : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-group-page">
      {/* Header */}
      <div className="cg-header">
        <div className="cg-header-inner">
          <h1><i className="bi bi-collection-fill me-2" />Study Group Finder</h1>
          <button className="cg-back-btn" onClick={() => navigate("/dashboard")}>
            <i className="bi bi-arrow-left me-1" />Back to Dashboard
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="cg-container">
        <div className="cg-card">
          <div className="cg-card-header">
            <h2>Create a Study Group</h2>
            <p>Fill in the details below to start a new group</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="cg-form">
            {/* Group Name */}
            <div className="cg-field">
              <label htmlFor="name">
                Group Name <span className="cg-required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. DSA Cracker Squad"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "cg-input cg-input-error" : "cg-input"}
                disabled={submitting}
              />
              {errors.name && <span className="cg-field-error">{errors.name}</span>}
            </div>

            {/* Description */}
            <div className="cg-field">
              <label htmlFor="description">
                Description <span className="cg-required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="What will this group study? What are your goals?"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={
                  errors.description ? "cg-textarea cg-input-error" : "cg-textarea"
                }
                disabled={submitting}
              />
              {errors.description && (
                <span className="cg-field-error">{errors.description}</span>
              )}
            </div>

            {/* Course Dropdown */}
            <div className="cg-field">
              <label htmlFor="courseId">Course (optional)</label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="cg-select"
                disabled={submitting}
              >
                <option value="">-- Select a course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName || course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Privacy Toggle */}
            <div className="cg-field">
              <label>Privacy</label>

              {/* Pill toggle */}
              <div className={`cg-toggle-wrap${submitting ? " cg-toggle-disabled" : ""}`}>
                <div className="cg-toggle-track">
                  {/* sliding pill */}
                  <span
                    className={`cg-toggle-pill ${
                      formData.privacy === "PRIVATE" ? "cg-pill-right" : "cg-pill-left"
                    }`}
                  />

                  {/* PUBLIC option */}
                  <button
                    type="button"
                    className={`cg-toggle-btn ${
                      formData.privacy === "PUBLIC" ? "cg-toggle-btn-active" : ""
                    }`}
                    onClick={() =>
                      !submitting &&
                      handleChange({ target: { name: "privacy", value: "PUBLIC" } })
                    }
                    disabled={submitting}
                    aria-pressed={formData.privacy === "PUBLIC"}
                  >
                    <span className="cg-toggle-icon"><i className="bi bi-globe2" /></span>
                    <span className="cg-toggle-label">Public</span>
                  </button>

                  {/* PRIVATE option */}
                  <button
                    type="button"
                    className={`cg-toggle-btn ${
                      formData.privacy === "PRIVATE" ? "cg-toggle-btn-active" : ""
                    }`}
                    onClick={() =>
                      !submitting &&
                      handleChange({ target: { name: "privacy", value: "PRIVATE" } })
                    }
                    disabled={submitting}
                    aria-pressed={formData.privacy === "PRIVATE"}
                  >
                    <span className="cg-toggle-icon"><i className="bi bi-lock-fill" /></span>
                    <span className="cg-toggle-label">Private</span>
                  </button>
                </div>

                {/* Description beneath toggle */}
                <p className="cg-toggle-hint">
                  {formData.privacy === "PUBLIC"
                    ? <><i className="bi bi-globe2 me-1" />Anyone can discover and join this group</>
                    : <><i className="bi bi-lock-fill me-1" />Members must request to join this group</>}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="cg-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <span className="cg-loading">
                  <span className="cg-spinner" /> Creating…
                </span>
              ) : (
                "Create Group"
              )}
            </button>

            {/* Feedback Messages */}
            {successMessage && (
              <div className="cg-message cg-success">{successMessage}</div>
            )}
            {errorMessage && (
              <div className="cg-message cg-error">{errorMessage}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
