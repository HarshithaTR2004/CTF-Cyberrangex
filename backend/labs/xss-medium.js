const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// Stored XSS - Medium difficulty
const messages = [];

router.get("/", (req, res) => {
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>XSS Medium Challenge</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        textarea { width: 100%; padding: 10px; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; margin: 10px 0; }
        .message { padding: 10px; margin: 10px 0; background: #16213e; border-left: 4px solid #0f3460; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>XSS Medium Challenge - Stored XSS Exploitation</h2>
        <p>Goal: Inject a stored XSS payload that executes when viewed.</p>
        <form method="POST">
          <textarea name="message" placeholder="Leave a comment..." rows="4"></textarea>
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Post Comment</button>
        </form>
        <h3>Comments:</h3>
        ${messages.map(msg => `<div class="message">${msg}</div>`).join('')}
        ${(() => {
          const hasXSS = messages.some(m => /<script|javascript:|on\w+=/i.test(m));
          let verificationToken = null;
          if (hasXSS && userId && challengeId) {
            try {
              verificationToken = generateVerificationToken(userId, challengeId);
            } catch (err) {
              console.error("Error generating verification token:", err);
            }
          }
          return hasXSS ? `
          <p style="color:#44ff44;margin-top:12px;">Stored XSS triggered. Flag: FLAG{stored_xss_medium_008}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: 'FLAG{stored_xss_medium_008}', 
                answer: 'FLAG{stored_xss_medium_008}',
                verificationToken: '${verificationToken || ''}'
              }, '*');
            }
          </script>
        ` : '';
        })()}
      </div>
    </body>
    </html>
  `);
});

router.post("/", (req, res) => {
  const message = req.body.message || "";
  const challengeId = req.body.challengeId || req.query.challengeId || "";
  const userId = req.body.userId || req.query.userId || "";
  if (message) {
    messages.push(message); // Vulnerable: No sanitization
  }
  res.redirect(`/lab/xss-medium?challengeId=${challengeId}&userId=${userId}`);
});

module.exports = router;
