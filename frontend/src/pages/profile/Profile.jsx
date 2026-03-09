import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { toast } from "react-toastify";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedChallenges, setCompletedChallenges] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile");
      setProfile(res.data);
      
      // Fetch completed challenges details
      if (res.data.completedChallenges?.length > 0) {
        try {
          const challengesRes = await api.get("/challenges");
          const allChallenges = challengesRes.data || [];
          const completed = allChallenges.filter(c => 
            res.data.completedChallenges.includes(c._id)
          );
          setCompletedChallenges(completed);
        } catch (err) {
          console.error("Failed to fetch challenges:", err);
        }
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile");
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const level = profile ? Math.floor((profile.points || 0) / 500) + 1 : 1;
  const currentLevelPoints = profile ? (profile.points || 0) % 500 : 0;
  const progress = (currentLevelPoints / 500) * 100;

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-container">
        <div className="error-message">{error || "Profile not found"}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="level-badge-large">Lv.{level}</div>
        </div>
        <div className="profile-info">
          <h1>{profile.username}</h1>
          <p className="profile-email">{profile.email}</p>
          <span className={`role-badge role-${profile.role}`}>
            {profile.role || "student"}
          </span>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card">
          <div className="stat-details">
            <h3>{profile.points || 0}</h3>
            <p>Total Points</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-details">
            <h3>{profile.completedChallenges?.length || 0}</h3>
            <p>Challenges Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-details">
            <h3>{profile.streak || 0}</h3>
            <p>Day Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-details">
            <h3>{new Date(profile.createdAt).toLocaleDateString()}</h3>
            <p>Member Since</p>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <h2>Level Progress</h2>
          <div className="level-progress-card">
            <div className="level-info-row">
              <span className="level-text">Level {level}</span>
              <span className="points-text">{currentLevelPoints} / 500 Points</span>
            </div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="next-level-text">
              {500 - currentLevelPoints} Points until Level {level + 1}
            </p>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Completed Challenges</h2>
            <button
              onClick={() => navigate("/challenges")}
              className="view-all-btn"
            >
              View All
            </button>
          </div>
          {completedChallenges.length > 0 ? (
            <div className="challenges-grid">
              {completedChallenges.slice(0, 6).map((challenge) => (
                <div key={challenge._id} className="challenge-card-mini">
                  <div className="challenge-mini-header">
                    <span className="challenge-mini-title">{challenge.title}</span>
                    <span className="challenge-mini-points">+{challenge.points} Points</span>
                  </div>
                  <div className="challenge-mini-footer">
                    <span className={`difficulty-badge-mini difficulty-${challenge.difficulty}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="category-badge-mini">{challenge.category}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No challenges completed yet</p>
              <button
                onClick={() => navigate("/challenges")}
                className="start-challenge-btn"
              >
                Start Your First Challenge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
