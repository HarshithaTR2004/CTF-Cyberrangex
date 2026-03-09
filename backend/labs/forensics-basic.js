const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// Forensics Basic - Hidden Flag Discovery
router.get("/", (req, res) => {
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  
  // Generate verification token when user accesses the lab (required to find flag)
  let verificationToken = null;
  if (userId && challengeId) {
    try {
      verificationToken = generateVerificationToken(userId, challengeId);
    } catch (err) {
      console.error("Error generating verification token:", err);
    }
  }
  
  const flag = "FLAG{log_analysis_basic_058}";
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Forensics Basic</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        .flag { color: #1a1a2e; background: #1a1a2e; position: absolute; left: -9999px; }
        .hidden { opacity: 0.01; font-size: 1px; }
        .comment { /* FLAG{forensics_basic_hidden_flag_wxy} */ }
        pre { background: #16213e; padding: 15px; border-radius: 5px; }
      </style>
      <!-- FLAG{forensics_basic_hidden_flag_wxy} -->
    </head>
    <body>
      <div class="container">
        <h2>Forensics Basic - Hidden Flag Discovery</h2>
        <p>Goal: Find the hidden flag in this page's source code, comments, or metadata.</p>
        <div class="flag">${flag}</div>
        <p>Inspect the page source, network requests, cookies, and metadata to find the flag.</p>
        <div class="hidden">${flag}</div>
        <pre>View page source (Ctrl+U) or inspect element to find hidden clues.</pre>
      </div>
      <script>
        // ${flag}
        console.log("Flag found in source:", "${flag}");
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
    </body>
    </html>
  `);
});

module.exports = router;

