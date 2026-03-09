const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const { generateVerificationToken } = require("../utils/challengeVerification");

// Command Injection Basic - OS Command Injection
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
      <title>Command Injection Basic</title>
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
        <h2>Command Injection Basic - OS Command Injection</h2>
        <p>Goal: Execute arbitrary OS commands through the ping functionality.</p>
        <form method="POST">
          <input name="host" placeholder="Enter host to ping (e.g., 8.8.8.8)" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Ping Host</button>
        </form>
        ${req.query.output ? `<pre>${req.query.output}</pre>` : ''}
        ${hasFlag ? `
          <p style="color:#44ff44;margin-top:10px;">Flag: FLAG{cmd_injection_basic_006}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: 'FLAG{cmd_injection_basic_006}', 
                answer: 'FLAG{cmd_injection_basic_006}',
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
  const host = req.body.host || "";
  const challengeId = req.body.challengeId || "";
  const userId = req.body.userId || "";
  
  // Vulnerable: Direct command execution
  const command = `ping -c 3 ${host}`;
  
  exec(command, (error, stdout, stderr) => {
    let output = stdout || stderr || error?.message || "";
    let flag = null;
    
    // Check if command injection was attempted
    if (host.includes(";") || host.includes("|") || host.includes("&") || host.includes("`")) {
      flag = "FLAG{cmd_injection_basic_006}";
      // Simulate additional command execution
      if (host.includes("cat") || host.includes("ls") || host.includes("whoami")) {
        output += "\n[Command executed successfully]";
      }
    }
    
    res.redirect(`/lab/command-injection-basic?output=${encodeURIComponent(output)}${flag ? '&flag=1' : ''}&challengeId=${challengeId}&userId=${userId}`);
  });
});

module.exports = router;

