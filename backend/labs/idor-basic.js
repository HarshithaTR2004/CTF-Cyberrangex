const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// IDOR Basic - Unauthorized Profile Access
const profiles = {
  1: { id: 1, username: "alice", email: "alice@example.com", role: "admin", flag: "FLAG{idor_basic_004}" },
  2: { id: 2, username: "bob", email: "bob@example.com", role: "user" },
  3: { id: 3, username: "charlie", email: "charlie@example.com", role: "user" }
};

router.get("/", (req, res) => {
  const profileUserId = req.query.profileUserId || req.query.userId || "2"; // Profile ID to access
  const challengeId = req.query.challengeId || ""; // Challenge ID from frontend
  const userId = req.query.userId || ""; // User ID from frontend (for token generation)
  
  const profile = profiles[profileUserId];
  
  // Check if IDOR was exploited (accessing profile 1 which has the flag)
  const isExploited = profileUserId === "1" && profile && profile.flag;
  
  // Generate verification token only if challenge was solved
  let verificationToken = null;
  if (isExploited && userId && challengeId) {
    try {
      verificationToken = generateVerificationToken(userId, challengeId);
    } catch (err) {
      console.error("Error generating verification token:", err);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>IDOR Basic</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { padding: 10px; width: 300px; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .profile { padding: 15px; background: #16213e; margin: 20px 0; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>IDOR Basic - Unauthorized Profile Access</h2>
        <p>Goal: Access another user's profile by manipulating the userId parameter.</p>
        <form method="GET">
          <input name="profileUserId" placeholder="User ID" value="${profileUserId}" />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>View Profile</button>
        </form>
        ${profile ? `
          <div class="profile">
            <h3>Profile #${profile.id}</h3>
            <p>Username: ${profile.username}</p>
            <p>Email: ${profile.email}</p>
            <p>Role: ${profile.role}</p>
            ${profile.flag && isExploited ? `
              <p class="success" style="color:#44ff44;margin-top:10px;">Flag: ${profile.flag}</p>
              <script>
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ 
                    type: 'CHALLENGE_SOLVED', 
                    challengeId: '${challengeId}',
                    flag: '${profile.flag}', 
                    answer: '${profile.flag}',
                    verificationToken: '${verificationToken || ''}'
                  }, '*');
                }
              </script>
            ` : ''}
          </div>
        ` : '<p>Profile not found</p>'}
        <p>Hint: You are currently logged in as user 2 (bob). Try accessing other user IDs.</p>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;

