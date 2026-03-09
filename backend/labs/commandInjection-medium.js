const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const { generateVerificationToken } = require("../utils/challengeVerification");

// Command Injection Medium - Chained Command Execution
router.get("/", (req, res) => {
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  const hasFlag = req.query.flag === "1" || req.query.flag === "true";
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (hasFlag && userId && challengeId) {
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
      <title>Command Injection Medium</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        pre { background: #16213e; padding: 15px; border-radius: 5px; white-space: pre-wrap; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Command Injection Medium - Chained Command Execution</h2>
        <p>Goal: Chain multiple commands to read system files and extract the flag.</p>
        <form method="POST">
          <input name="filename" placeholder="Enter filename to read" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Read File</button>
        </form>
        ${req.query.output ? `<pre>${req.query.output}</pre>` : ''}
        ${hasFlag ? `
          <p style="color:#44ff44;margin-top:12px;">Flag: FLAG{cmd_injection_medium_013}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: 'FLAG{cmd_injection_medium_013}', 
                answer: 'FLAG{cmd_injection_medium_013}',
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

router.post("/", (req, res) => {
  const filename = req.body.filename || "";
  const challengeId = req.body.challengeId || "";
  const userId = req.body.userId || "";
  
  // Vulnerable: Command chaining possible
  const command = `cat ${filename}`;
  
  exec(command, (error, stdout, stderr) => {
    let output = stdout || stderr || error?.message || "";
    let flag = null;
    
    // Check for command chaining
    if (filename.includes(";") || filename.includes("&&") || filename.includes("||")) {
      flag = "FLAG{cmd_injection_medium_013}";
      // Simulate file reading
      if (filename.includes("/etc/passwd") || filename.includes("flag")) {
        output += "\n[File contents retrieved]";
      }
    }
    
    res.redirect(`/lab/command-injection-medium?output=${encodeURIComponent(output)}${flag ? '&flag=1' : ''}&challengeId=${challengeId}&userId=${userId}`);
  });
});

module.exports = router;

