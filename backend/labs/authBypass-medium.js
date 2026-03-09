const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { generateVerificationToken } = require("../utils/challengeVerification");

// Authentication Bypass Medium - Token Manipulation
const secret = "weak_secret_key_123";

router.get("/", (req, res) => {
  const token = req.query.token || "";
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  let userInfo = null;
  
  if (token) {
    try {
      userInfo = jwt.verify(token, secret);
    } catch (err) {
      // Try with 'none' algorithm or weak secret
      try {
        userInfo = jwt.decode(token, { complete: true });
        if (userInfo && userInfo.payload) {
          userInfo = userInfo.payload;
        }
      } catch (e) {
        userInfo = { error: "Invalid token" };
      }
    }
  }
  
  // Check if challenge was solved (admin access granted)
  const isExploited = userInfo && userInfo.role === "admin" && !userInfo.error;
  
  // Generate verification token if challenge was solved
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
      <title>Auth Bypass Medium</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .token-info { padding: 15px; background: #16213e; margin: 20px 0; }
        .success { color: #44ff44; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Auth Bypass Medium - Token Manipulation</h2>
        <p>Goal: Manipulate JWT token to gain admin access.</p>
        <form method="GET">
          <input name="token" placeholder="JWT Token" value="${token.replace(/"/g, "&quot;")}" />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Verify Token</button>
        </form>
        ${userInfo ? `
          <div class="token-info">
            <pre>${JSON.stringify(userInfo, null, 2)}</pre>
            ${isExploited ? `
              <p class="success">Admin access granted! Flag: FLAG{jwt_bypass_007}</p>
              <script>
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ 
                    type: 'CHALLENGE_SOLVED', 
                    challengeId: '${challengeId}',
                    flag: 'FLAG{jwt_bypass_007}', 
                    answer: 'FLAG{jwt_bypass_007}',
                    verificationToken: '${verificationToken || ''}'
                  }, '*');
                }
              </script>
            ` : ''}
          </div>
        ` : ''}
        <p>Hint: Try modifying the token algorithm or payload to change your role to admin.</p>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;

