const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// SQL Injection Medium - Database Enumeration
const db = {
  users: [
    { id: 1, username: "admin", password: "secret123", role: "admin" },
    { id: 2, username: "alice", password: "pass123", role: "user" },
    { id: 3, username: "bob", password: "password", role: "user" }
  ],
  secrets: [
    { id: 1, name: "database_password", value: "FLAG{union_sqli_medium_009}" },
    { id: 2, name: "api_key", value: "sk_test_123456" }
  ]
};

router.get("/", (req, res) => {
  const id = req.query.id || "1";
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  
  // Vulnerable: Direct query construction
  let result;
  const isExploited = id.includes("UNION") || id.includes("union");
  if (isExploited) {
    // Simulate UNION-based injection
    result = {
      ...db.users[0],
      flag: db.secrets[0].value
    };
  } else {
    result = db.users.find(u => u.id == id) || { error: "User not found" };
  }
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (isExploited && result.flag && userId && challengeId) {
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
      <title>SQL Injection Medium</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { padding: 10px; width: 300px; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        pre { background: #16213e; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>SQL Injection Medium - Database Enumeration</h2>
        <p>Goal: Use UNION injection to enumerate database and find the flag.</p>
        <form method="GET">
          <input name="id" placeholder="User ID (try: 1 UNION SELECT 1,2,3,4)" value="${id.replace(/"/g, "&quot;")}" />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Get User</button>
        </form>
        <h3>Result:</h3>
        <pre>${JSON.stringify(result, null, 2)}</pre>
        ${result && result.flag ? `
          <p style="color:#44ff44;margin-top:12px;">Flag: ${result.flag}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: '${result.flag}', 
                answer: '${result.flag}',
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

module.exports = router;

