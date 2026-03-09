const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// CSRF Basic - Password Change CSRF
let currentPassword = "changeme";

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
      <title>CSRF Basic</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 600px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .success { color: #44ff44; padding: 10px; background: #16213e; margin: 10px 0; }
        .flag { display: none; }
        .hint { color: #ffaa00; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>CSRF Basic - Password Change CSRF</h2>
        <p>Goal: Change the user's password via CSRF attack without their knowledge.</p>
        <p class="hint">Current password: ${currentPassword}</p>
        <form method="POST" action="/lab/csrf-basic/change">
          <input name="newPassword" placeholder="New Password" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Change Password</button>
        </form>
        ${isSuccess ? `
          <div class="success">Password changed successfully! Flag: FLAG{csrf_basic_003}</div>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: 'FLAG{csrf_basic_003}', 
                answer: 'FLAG{csrf_basic_003}',
                verificationToken: '${verificationToken || ''}'
              }, '*');
            }
          </script>
        ` : ''}
        <p>Hint: This form lacks CSRF protection. Create a malicious page that submits this form automatically.</p>
      </div>
    </body>
    </html>
  `);
});

router.post("/change", (req, res) => {
  const { newPassword, challengeId, userId } = req.body;
  if (newPassword) {
    currentPassword = newPassword;
    res.redirect(`/lab/csrf-basic?success=1&challengeId=${challengeId || ''}&userId=${userId || ''}`);
  } else {
    res.redirect(`/lab/csrf-basic?challengeId=${challengeId || ''}&userId=${userId || ''}`);
  }
});

module.exports = router;

