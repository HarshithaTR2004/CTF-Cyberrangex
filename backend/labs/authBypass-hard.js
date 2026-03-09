const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// Authentication Bypass Hard - Session Fixation Attack
let sessions = {};
let sessionCounter = 0;

router.get("/", (req, res) => {
  const sessionId = req.query.sessionId || req.cookies?.sessionId || null;
  const action = req.query.action || "login";
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  
  if (action === "login" && req.query.username && req.query.password) {
    const { username, password } = req.query;
    if (username === "admin" && password === "admin123") {
      const newSessionId = sessionId || `session_${++sessionCounter}`;
      sessions[newSessionId] = { username: "admin", role: "admin", authenticated: true };
      res.cookie("sessionId", newSessionId);
      return res.redirect(`/lab/auth-bypass-hard?sessionId=${newSessionId}&action=view&challengeId=${challengeId}&userId=${userId}`);
    }
  }
  
  const session = sessionId ? sessions[sessionId] : null;
  
  // Check if challenge was solved (admin session accessed)
  const isExploited = session && session.role === "admin" && session.authenticated;
  
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
      <title>Auth Bypass Hard</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .session-info { padding: 15px; background: #16213e; margin: 20px 0; }
        .success { color: #44ff44; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Auth Bypass Hard - Session Fixation Attack</h2>
        <p>Goal: Fixate a session ID and hijack an admin session.</p>
        ${action === "login" ? `
          <form method="GET">
            <input name="username" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password" required />
            <input name="sessionId" placeholder="Session ID (optional)" />
            <input type="hidden" name="action" value="login" />
            <input type="hidden" name="challengeId" value="${challengeId}" />
            <input type="hidden" name="userId" value="${userId}" />
            <button>Login</button>
          </form>
        ` : `
          ${session ? `
            <div class="session-info">
              <h3>Session Information</h3>
              <p>Session ID: ${sessionId}</p>
              <p>Username: ${session.username}</p>
              <p>Role: ${session.role}</p>
              <p>Authenticated: ${session.authenticated}</p>
              ${isExploited ? `
                <p class="success">Admin session accessed! Flag: FLAG{jwt_bypass_007}</p>
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
          ` : '<p>No session found</p>'}
          <a href="/lab/auth-bypass-hard?action=login&challengeId=${challengeId}&userId=${userId}">Go to Login</a>
        `}
      </div>
    </body>
    </html>
  `);
});

module.exports = router;

