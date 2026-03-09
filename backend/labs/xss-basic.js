const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// Basic Reflected XSS vulnerability
router.get("/", (req, res) => {
  const name = req.query.name || "";
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || ""; // Get userId from query parameter (passed by frontend)
  const flag = "FLAG{reflected_xss_basic_001}";
  
  // Check if XSS was successfully executed (simple check - if script tags are present)
  const hasXSS = name.includes("<script>") || name.includes("</script>") || name.includes("javascript:");
  
  // Generate verification token only if challenge was solved AND we have user/challenge IDs
  let verificationToken = null;
  if (hasXSS) {
    if (userId && challengeId) {
      try {
        verificationToken = generateVerificationToken(userId, challengeId);
        console.log(`[XSS Basic] Generated verification token for user ${userId}, challenge ${challengeId}`);
      } catch (err) {
        console.error("[XSS Basic] Error generating verification token:", err);
      }
    } else {
      console.warn(`[XSS Basic] Cannot generate token - userId: ${userId}, challengeId: ${challengeId}`);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>XSS Basic Challenge</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #1a1a1a;
          color: #fff;
        }
        .container {
          background: #2a2a2a;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #444;
        }
        input {
          padding: 10px;
          width: 300px;
          font-size: 16px;
          border-radius: 5px;
          border: 1px solid #555;
          background: #333;
          color: #fff;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-left: 10px;
        }
        button:hover {
          background: #5568d3;
        }
        .result {
          margin-top: 20px;
          padding: 15px;
          background: #333;
          border-radius: 5px;
          min-height: 50px;
        }
        .success {
          color: #10b981;
          font-weight: bold;
          margin-top: 20px;
        }
        .info {
          background: #1e3a5f;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          border-left: 4px solid #667eea;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>XSS Basic Challenge - Reflected XSS</h1>
        <div class="info">
          <strong>Objective:</strong> Exploit a reflected XSS vulnerability. Inject a script payload in the name parameter to execute JavaScript and retrieve the flag.
        </div>
        
        <form method="GET" action="/lab/xss-basic">
          <label for="name">Enter your name:</label><br>
          <input type="text" id="name" name="name" placeholder="Try: &lt;script&gt;alert('XSS')&lt;/script&gt;" value="${name.replace(/"/g, "&quot;")}">
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button type="submit">Submit</button>
        </form>
        
        <div class="result">
          <h3>Result:</h3>
          <p>Hello ${name}</p>
        </div>
        
        ${hasXSS ? `
          <div class="success">
            <p>✓ XSS Detected! Flag: ${flag}</p>
            <p>Flag found! Submit the flag above to receive points.</p>
          </div>
          <script>
            // Send completion message to parent window
            if (window.parent && window.parent !== window) {
              const message = {
                type: 'CHALLENGE_SOLVED',
                challengeId: '${req.query.challengeId || ''}',
                flag: '${flag}',
                answer: '${flag}',
                verificationToken: '${verificationToken || ''}'
              };
              console.log('[XSS Basic Lab] Sending postMessage:', message);
              window.parent.postMessage(message, '*');
            } else {
              console.warn('[XSS Basic Lab] No parent window found, cannot send postMessage');
            }
          </script>
        ` : ''}
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
