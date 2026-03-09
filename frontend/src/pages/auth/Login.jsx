import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import { toast } from "react-toastify";
import "./auth.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success("Login successful. Welcome back.");
      navigate("/");
    } catch (err) {
      let errorMsg = "Invalid email or password";
      
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
      console.error("Login error:", err);
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
            <p className="auth-tagline">Train. Exploit. Learn. Compete.</p>
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
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue your cybersecurity journey</p>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
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
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
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

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>New to CyberRangeX?</span>
            </div>

            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
