const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// SQL Injection Basic - Login Bypass
const users = [
  { username: "admin", password: "admin123" },
  { username: "user", password: "password" }
];

router.get("/", (req, res) => {
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SQL Injection Basic</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 500px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { width: 100%; padding: 10px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .error { color: #ff4444; }
        .success { color: #44ff44; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>SQL Injection Basic - Login Bypass</h2>
        <p>Goal: Bypass the login without knowing the password.</p>
        <form method="POST">
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Login</button>
        </form>
        ${req.query.error ? `<p class="error">${req.query.error}</p>` : ''}
        ${req.query.success ? `
          <p class="success">${req.query.success}</p>
          <p class="success">Flag: FLAG{sqli_login_bypass_002} — Copy this into Your Answer or it may be submitted automatically.</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${req.query.challengeId || ''}',
                flag: 'FLAG{sqli_login_bypass_002}', 
                answer: 'FLAG{sqli_login_bypass_002}',
                verificationToken: '${req.query.token || ''}'
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
  const { username, password } = req.body;
  const challengeId = req.query.challengeId || req.body.challengeId || "";
  const userId = req.query.userId || req.body.userId || "";
  
  // Vulnerable SQL-like query simulation
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  
  // Simple check for SQLi patterns
  const isExploited = query.includes("' OR '1'='1") || query.includes("'--") || query.includes("';--") || 
      username === "' OR '1'='1'--" || username === "admin'--";
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (isExploited && userId && challengeId) {
    try {
      verificationToken = generateVerificationToken(userId, challengeId);
    } catch (err) {
      console.error("Error generating verification token:", err);
    }
  }
  
  if (isExploited) {
    return res.redirect(`/lab/sqli-basic?success=Logged+in+successfully!&challengeId=${challengeId}&userId=${userId}&token=${verificationToken || ''}`);
  }
  
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return res.redirect("/lab/sqli-basic?success=Logged+in+successfully!");
  }
  
  res.redirect("/lab/sqli-basic?error=Invalid+credentials");
});

module.exports = router;

