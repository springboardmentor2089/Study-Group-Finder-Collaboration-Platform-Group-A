import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    universityName: "",
    universityPassingYear: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "universityPassingYear") {
      if (value && !/^\d*$/.test(value)) {
        return;
      }
      if (value.length > 4) {
        return;
      }
      if (value.length === 4) {
        const year = parseInt(value);
        if (year < 1980 || year > 2040) {
          setError("Passing year must be between 1980 and 2040");
          setTimeout(() => setError(""), 3000);
          return;
        }
      }
    }

    setForm({ ...form, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.universityPassingYear) {
      if (form.universityPassingYear.length !== 4) {
        setError("Passing year must be exactly 4 digits");
        return;
      }
      const year = parseInt(form.universityPassingYear);
      if (year < 1980 || year > 2040) {
        setError("Passing year must be between 1980 and 2040");
        return;
      }
    }

    setLoading(true);

    try {
      await api.post("/auth/send-otp", {
        email: form.email
      });

      setUserEmail(form.email);
      setShowOtpModal(true);
      setOtpResendTimer(60);
      setLoading(false);

      const timer = setInterval(() => {
        setOtpResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to send OTP. Please try again.";
      setError(errorMsg);
      console.error(error);
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setOtpLoading(true);

    try {
      const { confirmPassword, ...userData } = form;

      await api.post("/auth/register", {
        ...userData,
        otp: otp,
        email: userEmail
      });

      setError("");
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "OTP verification failed. Please try again.";
      setError(errorMsg);
      console.error(error);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setOtpLoading(true);

    try {
      await api.post("/auth/send-otp", {
        email: userEmail
      });
      setSuccess("OTP sent successfully! Check your email.");
      setOtp("");
      setOtpResendTimer(60);

      const timer = setInterval(() => {
        setOtpResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to resend OTP.";
      setError(errorMsg);
      console.error(error);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setShowOtpModal(false);
    setOtp("");
    setError("");
    setSuccess("");
  };

  if (showOtpModal) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <i className="bi bi-shield-check" />
            </div>
            <h1>StudyGroup</h1>
            <p>Verify your email</p>
          </div>
          <h2>Email Verification</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <p className="otp-info">
            We've sent a 6-digit OTP to <strong>{userEmail}</strong>
          </p>

          <form onSubmit={handleOtpVerification}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP *</label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                maxLength="6"
                required
                autoFocus
                className="otp-input"
              />
              <small className="otp-help">
                {otp.length}/6 digits entered
              </small>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={otpLoading || otp.length !== 6}
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="otp-resend">
            {otpResendTimer > 0 ? (
              <p>
                Resend OTP in <strong>{otpResendTimer}s</strong>
              </p>
            ) : (
              <p>
                Didn't receive OTP?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="btn-link"
                >
                  Resend OTP
                </button>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleBackToRegister}
            className="btn-back"
          >
            ← Back to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <i className="bi bi-mortarboard-fill" />
          </div>
          <h1>StudyGroup</h1>
          <p>Join your study community</p>
        </div>
        <h2>Create Account</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="university">University</label>
            <input
              id="university"
              type="text"
              name="universityName"
              placeholder="Your university name"
              value={form.universityName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passingYear">
              Passing Year <span className="text-muted">(1980-2040)</span>
            </label>
            <input
              id="passingYear"
              type="text"
              name="universityPassingYear"
              placeholder="e.g., 2024"
              value={form.universityPassingYear}
              onChange={handleChange}
              maxLength="4"
            />
            {form.universityPassingYear && (
              <small className="form-help">
                {form.universityPassingYear.length < 4
                  ? `${4 - form.universityPassingYear.length} more digit(s) needed`
                  : "✓ Valid year"}
              </small>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending OTP..." : "Register"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;