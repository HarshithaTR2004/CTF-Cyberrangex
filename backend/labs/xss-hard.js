const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// XSS Hard - Filter Bypass
router.get("/", (req, res) => {
  let input = req.query.input || "";
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  
  // Weak filter - can be bypassed
  const originalInput = input;
  input = input.replace(/script/gi, "");
  input = input.replace(/onerror/gi, "");
  input = input.replace(/onload/gi, "");
  
  // Check if XSS was bypassed (input changed but still contains XSS patterns)
  const hasXSS = originalInput !== input && (originalInput.includes("<") || originalInput.includes("on") || originalInput.includes("javascript:"));
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (hasXSS && userId && challengeId) {
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
      <title>XSS Hard Challenge</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { width: 400px; padding: 10px; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .output { margin: 20px 0; padding: 10px; background: #16213e; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>XSS Hard Challenge - Filter Bypass XSS</h2>
        <p>Goal: Bypass the filter and execute XSS.</p>
        <form method="GET">
          <input name="input" placeholder="Your payload" value="${originalInput.replace(/"/g, "&quot;")}" />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Submit</button>
        </form>
        <div class="output">Output: <span>${input}</span></div>
        ${hasXSS ? `
          <div style="color:#44ff44;margin-top:12px;">
            <p>XSS Filter Bypassed! Flag: FLAG{dom_xss_hard_014}</p>
            <script>
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({ 
                  type: 'CHALLENGE_SOLVED', 
                  challengeId: '${challengeId}',
                  flag: 'FLAG{dom_xss_hard_014}', 
                  answer: 'FLAG{dom_xss_hard_014}',
                  verificationToken: '${verificationToken || ''}'
                }, '*');
              }
            </script>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
