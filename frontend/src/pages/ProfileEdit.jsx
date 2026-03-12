import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import api from "../api";
import "./ProfileEdit.css";

function ProfileEdit() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    universityName: "",
    universityPassingYear: "",
    universityPassingGPA: "",
    secondarySchool: "",
    secondarySchoolPassingYear: "",
    secondarySchoolPercentage: "",
    higherSecondarySchool: "",
    higherSecondaryPassingYear: "",
    higherSecondaryPercentage: ""
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const parts = token.split(".");
        const decoded = JSON.parse(atob(parts[1]));
        const email = decoded.sub;

        const response = await api.get("/user/profile", {
          params: { email }
        });

        setUserId(response.data.id);
        setFormData({
          name: response.data.name || "",
          email: response.data.email || "",
          bio: response.data.bio || "",
          universityName: response.data.universityName || "",
          universityPassingYear: response.data.universityPassingYear || "",
          universityPassingGPA: response.data.universityPassingGPA || "",
          secondarySchool: response.data.secondarySchool || "",
          secondarySchoolPassingYear: response.data.secondarySchoolPassingYear || "",
          secondarySchoolPercentage: response.data.secondarySchoolPercentage || "",
          higherSecondarySchool: response.data.higherSecondarySchool || "",
          higherSecondaryPassingYear: response.data.higherSecondaryPassingYear || "",
          higherSecondaryPercentage: response.data.higherSecondaryPercentage || ""
        });
        setError("");
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserInfo();
    }
  }, [token]);

  // Validate year (1980-2040, 4 digits)
  const validateYear = (year) => {
    if (!year) return true; // Allow empty
    const yearStr = year.toString();
    
    if (yearStr.length !== 4) {
      return false;
    }
    
    const yearInt = parseInt(yearStr);
    return yearInt >= 1980 && yearInt <= 2040;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Year validation for all year fields
    if (name === "universityPassingYear" || 
        name === "secondarySchoolPassingYear" || 
        name === "higherSecondaryPassingYear") {
      
      // Allow only numeric input
      if (value && !/^\d*$/.test(value)) {
        return;
      }
      
      // Limit to 4 digits
      if (value.length > 4) {
        return;
      }

      // Validate range if 4 digits are entered
      if (value.length === 4) {
        if (!validateYear(value)) {
          setError("Passing year must be between 1980 and 2040");
          setTimeout(() => setError(""), 3000);
          return;
        }
      }
    }

    // CGPA validation (only positive floats 0.0-10.0)
    if (name === "universityPassingGPA") {
      // Allow only digits and one decimal point
      if (value && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
      
      // Prevent multiple decimal points
      if (value && value.split('.').length > 2) {
        return;
      }

      // If user enters value, validate range
      if (value) {
        const gpaValue = parseFloat(value);
        if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 10) {
          // Don't show error for incomplete input like "10."
          if (!value.endsWith('.')) {
            setError("CGPA must be between 0.0 and 10.0");
            setTimeout(() => setError(""), 3000);
            return;
          }
        }
      }
    }

    // Percentage validation (only positive floats 0-100)
    if (name === "secondarySchoolPercentage" || 
        name === "higherSecondaryPercentage") {
      
      // Allow only digits and one decimal point
      if (value && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
      
      // Prevent multiple decimal points
      if (value && value.split('.').length > 2) {
        return;
      }

      // If user enters value, validate range
      if (value) {
        const percentValue = parseFloat(value);
        if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
          // Don't show error for incomplete input like "100."
          if (!value.endsWith('.')) {
            setError("Percentage must be between 0 and 100");
            setTimeout(() => setError(""), 3000);
            return;
          }
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setError("User ID not found");
      return;
    }

    // Validate all years before submission
    const yearsToValidate = [
      { field: "universityPassingYear", value: formData.universityPassingYear },
      { field: "secondarySchoolPassingYear", value: formData.secondarySchoolPassingYear },
      { field: "higherSecondaryPassingYear", value: formData.higherSecondaryPassingYear }
    ];

    for (let item of yearsToValidate) {
      if (item.value) {
        if (item.value.toString().length !== 4) {
          setError(`${item.field.replace(/([A-Z])/g, ' $1').toLowerCase()} must be exactly 4 digits`);
          return;
        }
        if (!validateYear(item.value)) {
          setError("All passing years must be between 1980 and 2040");
          return;
        }
      }
    }

    // Validate CGPA
    if (formData.universityPassingGPA) {
      const gpa = parseFloat(formData.universityPassingGPA);
      if (isNaN(gpa) || gpa < 0 || gpa > 10) {
        setError("CGPA must be a number between 0.0 and 10.0");
        return;
      }
    }

    // Validate percentages
    if (formData.secondarySchoolPercentage) {
      const percent = parseFloat(formData.secondarySchoolPercentage);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        setError("Secondary school percentage must be between 0 and 100");
        return;
      }
    }

    if (formData.higherSecondaryPercentage) {
      const percent = parseFloat(formData.higherSecondaryPercentage);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        setError("Higher secondary percentage must be between 0 and 100");
        return;
      }
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.put(`/user/profile/${userId}`, formData);
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      setError(errorMsg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="profile-edit-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-edit-page">
      <div className="profile-edit-card">
        {/* Header */}
        <div className="pe-header">
          <h1>Edit Profile</h1>
          <p>Update your personal information and academic details</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="pe-alert error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="pe-alert success">
            <i className="bi bi-check-circle-fill"></i>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="pe-form">
          {/* Basic Information */}
          <div className="pe-section">
            <div className="pe-section-title">
              <i className="bi bi-person-badge"></i>
              <h2>Basic Information</h2>
            </div>
            
            <div className="pe-grid-2">
              <div className="pe-field">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="pe-field">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="disabled-field"
                />
              </div>
            </div>

            <div className="pe-field">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself, your interests, and what you're studying..."
                rows="4"
              />
            </div>
          </div>

          {/* University Details */}
          <div className="pe-section">
            <div className="pe-section-title">
              <i className="bi bi-building"></i>
              <h2>University Details</h2>
            </div>
            
            <div className="pe-grid-3">
              <div className="pe-field">
                <label htmlFor="universityName">University Name</label>
                <input
                  id="universityName"
                  type="text"
                  name="universityName"
                  value={formData.universityName}
                  onChange={handleChange}
                  placeholder="e.g. Stanford University"
                />
              </div>

              <div className="pe-field">
                <label htmlFor="universityPassingYear">
                  Graduation Year <span className="text-muted">(1980-2040)</span>
                </label>
                <input
                  id="universityPassingYear"
                  type="text"
                  name="universityPassingYear"
                  value={formData.universityPassingYear}
                  onChange={handleChange}
                  placeholder="YYYY"
                  maxLength="4"
                />
                {formData.universityPassingYear && (
                  <small className="form-help">
                    {formData.universityPassingYear.length < 4
                      ? `${4 - formData.universityPassingYear.length} more digit(s) needed`
                      : validateYear(formData.universityPassingYear)
                      ? "✓ Valid year"
                      : "✗ Year out of range"}
                  </small>
                )}
              </div>

              <div className="pe-field">
                <label htmlFor="universityPassingGPA">CGPA</label>
                <input
                  id="universityPassingGPA"
                  type="text"
                  name="universityPassingGPA"
                  value={formData.universityPassingGPA}
                  onChange={handleChange}
                  placeholder="0.0 - 10.0"
                  inputMode="decimal"
                />
                {formData.universityPassingGPA && (
                  <small className="form-help">
                    {formData.universityPassingGPA && 
                     !/^\d*\.?\d*$/.test(formData.universityPassingGPA)
                      ? "✗ Only numbers and decimal allowed"
                      : parseFloat(formData.universityPassingGPA) >= 0 && 
                        parseFloat(formData.universityPassingGPA) <= 10
                      ? "✓ Valid CGPA"
                      : "✗ CGPA out of range (0.0-10.0)"}
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Secondary School Details */}
          <div className="pe-section">
            <div className="pe-section-title">
              <i className="bi bi-book"></i>
              <h2>Secondary School (10th)</h2>
            </div>
            
            <div className="pe-grid-3">
              <div className="pe-field">
                <label htmlFor="secondarySchool">School Name</label>
                <input
                  id="secondarySchool"
                  type="text"
                  name="secondarySchool"
                  value={formData.secondarySchool}
                  onChange={handleChange}
                  placeholder="School name"
                />
              </div>

              <div className="pe-field">
                <label htmlFor="secondarySchoolPassingYear">
                  Passing Year <span className="text-muted">(1980-2040)</span>
                </label>
                <input
                  id="secondarySchoolPassingYear"
                  type="text"
                  name="secondarySchoolPassingYear"
                  value={formData.secondarySchoolPassingYear}
                  onChange={handleChange}
                  placeholder="YYYY"
                  maxLength="4"
                />
                {formData.secondarySchoolPassingYear && (
                  <small className="form-help">
                    {formData.secondarySchoolPassingYear.length < 4
                      ? `${4 - formData.secondarySchoolPassingYear.length} more digit(s) needed`
                      : validateYear(formData.secondarySchoolPassingYear)
                      ? "✓ Valid year"
                      : "✗ Year out of range"}
                  </small>
                )}
              </div>

              <div className="pe-field">
                <label htmlFor="secondarySchoolPercentage">Percentage</label>
                <input
                  id="secondarySchoolPercentage"
                  type="text"
                  name="secondarySchoolPercentage"
                  value={formData.secondarySchoolPercentage}
                  onChange={handleChange}
                  placeholder="0 - 100%"
                  inputMode="decimal"
                />
                {formData.secondarySchoolPercentage && (
                  <small className="form-help">
                    {formData.secondarySchoolPercentage && 
                     !/^\d*\.?\d*$/.test(formData.secondarySchoolPercentage)
                      ? "✗ Only numbers and decimal allowed"
                      : parseFloat(formData.secondarySchoolPercentage) >= 0 && 
                        parseFloat(formData.secondarySchoolPercentage) <= 100
                      ? "✓ Valid percentage"
                      : "✗ Percentage out of range (0-100)"}
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Higher Secondary School Details */}
          <div className="pe-section">
            <div className="pe-section-title">
              <i className="bi bi-journal-bookmark-fill"></i>
              <h2>Higher Secondary (12th)</h2>
            </div>
            
            <div className="pe-grid-3">
              <div className="pe-field">
                <label htmlFor="higherSecondarySchool">School Name</label>
                <input
                  id="higherSecondarySchool"
                  type="text"
                  name="higherSecondarySchool"
                  value={formData.higherSecondarySchool}
                  onChange={handleChange}
                  placeholder="School name"
                />
              </div>

              <div className="pe-field">
                <label htmlFor="higherSecondaryPassingYear">
                  Passing Year <span className="text-muted">(1980-2040)</span>
                </label>
                <input
                  id="higherSecondaryPassingYear"
                  type="text"
                  name="higherSecondaryPassingYear"
                  value={formData.higherSecondaryPassingYear}
                  onChange={handleChange}
                  placeholder="YYYY"
                  maxLength="4"
                />
                {formData.higherSecondaryPassingYear && (
                  <small className="form-help">
                    {formData.higherSecondaryPassingYear.length < 4
                      ? `${4 - formData.higherSecondaryPassingYear.length} more digit(s) needed`
                      : validateYear(formData.higherSecondaryPassingYear)
                      ? "✓ Valid year"
                      : "✗ Year out of range"}
                  </small>
                )}
              </div>

              <div className="pe-field">
                <label htmlFor="higherSecondaryPercentage">Percentage</label>
                <input
                  id="higherSecondaryPercentage"
                  type="text"
                  name="higherSecondaryPercentage"
                  value={formData.higherSecondaryPercentage}
                  onChange={handleChange}
                  placeholder="0 - 100%"
                  inputMode="decimal"
                />
                {formData.higherSecondaryPercentage && (
                  <small className="form-help">
                    {formData.higherSecondaryPercentage && 
                     !/^\d*\.?\d*$/.test(formData.higherSecondaryPercentage)
                      ? "✗ Only numbers and decimal allowed"
                      : parseFloat(formData.higherSecondaryPercentage) >= 0 && 
                        parseFloat(formData.higherSecondaryPercentage) <= 100
                      ? "✓ Valid percentage"
                      : "✗ Percentage out of range (0-100)"}
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pe-actions">
            <button
              type="submit"
              className="pe-btn pe-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              className="pe-btn pe-btn-secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              <i className="bi bi-x-lg"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEdit;