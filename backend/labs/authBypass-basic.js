const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// Authentication Bypass Basic - Weak Login Validation
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user", password: "password", role: "user" }
];

router.get("/", (req, res) => {
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  const isSuccess = req.query.success === "1" || req.query.success === "true";
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (isSuccess && userId && challengeId) {
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
      <title>Auth Bypass Basic</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 500px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { width: 100%; padding: 10px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .success { color: #44ff44; }
        .error { color: #ff4444; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Auth Bypass Basic - Weak Login Validation</h2>
        <p>Goal: Bypass authentication using weak validation logic.</p>
        <form method="POST">
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Login</button>
        </form>
        ${req.query.error ? `<p class="error">${req.query.error}</p>` : ''}
        ${isSuccess ? `
          <p class="success">Logged in as admin! Flag: FLAG{jwt_bypass_007}</p>
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
    </body>
    </html>
  `);
});

router.post("/", (req, res) => {
  const { username, password, challengeId, userId } = req.body;
  
  // Vulnerable: Weak comparison
  const user = users.find(u => {
    // Type coercion vulnerability
    return u.username == username && u.password == password;
  });
  
  if (user && user.role === "admin") {
    return res.redirect(`/lab/auth-bypass-basic?success=1&challengeId=${challengeId || ''}&userId=${userId || ''}`);
  }
  
  if (user) {
    return res.redirect(`/lab/auth-bypass-basic?error=User+logged+in+but+not+admin&challengeId=${challengeId || ''}&userId=${userId || ''}`);
  }
  
  res.redirect(`/lab/auth-bypass-basic?error=Invalid+credentials&challengeId=${challengeId || ''}&userId=${userId || ''}`);
});

module.exports = router;

