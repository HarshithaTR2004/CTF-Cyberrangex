const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// CSRF Hard - Token Bypass CSRF
let csrfToken = "random_token_" + Math.random().toString(36);

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
      <title>CSRF Hard</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .success { color: #44ff44; }
        .error { color: #ff4444; }
        .flag { display: none; }
        .token { color: #ffaa00; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>CSRF Hard - Token Bypass CSRF</h2>
        <p>Goal: Bypass CSRF token validation to perform unauthorized action.</p>
        <p class="token">CSRF Token: ${csrfToken}</p>
        <form method="POST" action="/lab/csrf-hard/transfer">
          <input type="hidden" name="csrfToken" value="${csrfToken}" />
          <input name="amount" placeholder="Amount" required />
          <input name="recipient" placeholder="Recipient" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Transfer Money</button>
        </form>
        ${isSuccess ? `
          <p class="success">Transfer successful! Flag: FLAG{csrf_samesite_hard_016}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: 'FLAG{csrf_samesite_hard_016}', 
                answer: 'FLAG{csrf_samesite_hard_016}',
                verificationToken: '${verificationToken || ''}'
              }, '*');
            }
          </script>
        ` : ''}
        ${req.query.error ? `<p class="error">${req.query.error}</p>` : ''}
        <p>Hint: The CSRF token validation might have a flaw. Investigate how tokens are validated.</p>
      </div>
    </body>
    </html>
  `);
});

router.post("/transfer", (req, res) => {
  const { csrfToken: token, amount, recipient, challengeId, userId } = req.body;
  
  // Vulnerable: Token can be bypassed with certain patterns
  if (!token || (token !== csrfToken && !token.includes("random_token"))) {
    return res.redirect(`/lab/csrf-hard?error=Invalid+CSRF+token&challengeId=${challengeId || ''}&userId=${userId || ''}`);
  }
  
  if (amount && recipient) {
    res.redirect(`/lab/csrf-hard?success=1&challengeId=${challengeId || ''}&userId=${userId || ''}`);
  } else {
    res.redirect(`/lab/csrf-hard?error=Missing+fields&challengeId=${challengeId || ''}&userId=${userId || ''}`);
  }
});

module.exports = router;

