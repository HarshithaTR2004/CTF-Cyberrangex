const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// CSRF Medium - Account Takeover CSRF
const accounts = {
  victim: { email: "victim@example.com", role: "user", token: null },
  attacker: { email: "attacker@example.com", role: "user", token: null }
};

router.get("/", (req, res) => {
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  const isSuccess = req.query.success === "1" || req.query.success === "true";
  const isExploited = isSuccess && req.query.email === "attacker@example.com";
  
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
      <title>CSRF Medium</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .success { color: #44ff44; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>CSRF Medium - Account Takeover CSRF</h2>
        <p>Goal: Use CSRF to change victim's email to attacker's email, gaining account access.</p>
        <p>Victim account: victim@example.com</p>
        <form method="POST" action="/lab/csrf-medium/update">
          <input name="email" placeholder="New Email" value="${req.query.email || ''}" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Update Email</button>
        </form>
        ${isExploited ? `
          <p class="success">Email updated! Flag: FLAG{csrf_advanced_010}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: 'FLAG{csrf_advanced_010}', 
                answer: 'FLAG{csrf_advanced_010}',
                verificationToken: '${verificationToken || ''}'
              }, '*');
            }
          </script>
        ` : isSuccess ? `<p class="success">Email updated!</p>` : ''}
      </div>
    </body>
    </html>
  `);
});

router.post("/update", (req, res) => {
  const { email, challengeId, userId } = req.body;
  if (email) {
    accounts.victim.email = email;
    res.redirect(`/lab/csrf-medium?success=1&email=${encodeURIComponent(email)}&challengeId=${challengeId || ''}&userId=${userId || ''}`);
  } else {
    res.redirect(`/lab/csrf-medium?challengeId=${challengeId || ''}&userId=${userId || ''}`);
  }
});

module.exports = router;

