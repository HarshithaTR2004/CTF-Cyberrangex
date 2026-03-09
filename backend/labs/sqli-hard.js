const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// SQL Injection Hard - Blind SQL Injection
const db = {
  users: [
    { id: 1, username: "admin", password: "admin", email: "admin@example.com" },
    { id: 2, username: "user1", password: "pass", email: "user1@example.com" }
  ]
};

const flag = "FLAG{blind_sqli_hard_015}";

router.get("/", (req, res) => {
  const result = req.query.result || "Enter a user ID and click Check User. Use time-based blind SQLi (e.g. 1 AND SLEEP(2)--).";
  const showFlag = req.query.flag === "1";
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (showFlag && userId && challengeId) {
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
      <title>SQL Injection Hard</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { padding: 10px; width: 300px; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .result { margin: 20px 0; padding: 15px; background: #16213e; }
        .success { color: #44ff44; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>SQL Injection Hard - Blind SQL Injection</h2>
        <p>Goal: Use time-based blind SQL injection to extract the flag.</p>
        <form method="GET" action="check">
          <input name="id" placeholder="e.g. 1 AND SLEEP(2)--" />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Check User</button>
        </form>
        <div class="result ${showFlag ? 'success' : ''}">${result}</div>
        ${showFlag ? `
          <p class="success">Flag: ${flag}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: '${flag}', 
                answer: '${flag}',
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

router.get("/check", (req, res) => {
  const id = String(req.query.id || "");
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  
  if (/SLEEP|AND\s*\(\s*SELECT/i.test(id)) {
    // Time-based injection detected: delay then redirect with flag
    setTimeout(() => {
      res.redirect(`/lab/sqli-hard?result=Time-based+blind+SQLi+detected.+You+extracted+the+flag.&flag=1&challengeId=${challengeId}&userId=${userId}`);
    }, 2000);
    return;
  }
  if (id.includes("' AND '1'='1") || id.includes("1=1")) {
    return res.redirect(`/lab/sqli-hard?result=Boolean+condition+true.+Try+time-based+injection+with+SLEEP(2)+to+extract+the+flag.&challengeId=${challengeId}&userId=${userId}`);
  }
  const user = db.users.find(u => u.id == id);
  res.redirect(`/lab/sqli-hard?result=${encodeURIComponent(user ? "User exists." : "User not found. Try: 1 AND SLEEP(2)--")}&challengeId=${challengeId}&userId=${userId}`);
});

module.exports = router;

