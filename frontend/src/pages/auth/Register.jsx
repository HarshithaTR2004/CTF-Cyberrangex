import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import { toast } from "react-toastify";
import "./auth.css";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  const validateForm = () => {
    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all fields");
      return false;
    }

    if (form.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password
      });
      toast.success("Account created successfully. Welcome to CyberRangeX.");
      navigate("/");
    } catch (err) {
      let errorMsg = "Registration failed";
      
      // Handle network errors specifically
      if (err.networkError || !err.response) {
        errorMsg = "Cannot connect to server. Please make sure the backend is running on port 5000.";
        toast.error("Backend server not running. Start it with: cd backend && npm run dev");
      } else if (err.response?.data?.msg) {
        errorMsg = err.response.data.msg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-branding">
            <h1 className="auth-logo">CyberRangeX</h1>
            <p className="auth-tagline">Start your cybersecurity journey today</p>
            <div className="auth-features">
              <div className="feature-item">
                <span>24 Real-World Challenges</span>
              </div>
              <div className="feature-item">
                <span>Compete on Leaderboards</span>
              </div>
              <div className="feature-item">
                <span>Learn by Exploiting</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-box">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join the cybersecurity community</p>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="auth-link">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
