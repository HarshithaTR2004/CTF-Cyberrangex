const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// Forensics Medium - Log File Analysis
const flag = "FLAG{memory_basic_063}";
const logs = [
  { timestamp: "2024-01-01 10:00:00", ip: "192.168.1.100", action: "LOGIN", user: "admin", status: "SUCCESS" },
  { timestamp: "2024-01-01 10:05:00", ip: "192.168.1.101", action: "LOGIN", user: "admin", status: "FAILED" },
  { timestamp: "2024-01-01 10:10:00", ip: "10.0.0.50", action: "FILE_ACCESS", file: "secret.txt", status: "SUCCESS" },
  { timestamp: "2024-01-01 10:15:00", ip: "192.168.1.100", action: "DOWNLOAD", file: "flag.txt", status: "SUCCESS" },
  { timestamp: "2024-01-01 10:20:00", ip: "172.16.0.25", action: "LOGIN", user: "attacker", status: "FAILED" },
  { timestamp: "2024-01-01 10:25:00", ip: "192.168.1.100", action: "EXPORT", data: flag, status: "SUCCESS" }
];

router.get("/", (req, res) => {
  const filter = req.query.filter || "";
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  let filteredLogs = logs;
  
  // Generate verification token when user accesses the lab
  let verificationToken = null;
  if (userId && challengeId) {
    try {
      verificationToken = generateVerificationToken(userId, challengeId);
    } catch (err) {
      console.error("Error generating verification token:", err);
    }
  }
  
  // Check if user filtered to find the flag
  const foundFlag = filter && filteredLogs.some(log => log.data === flag);
  
  if (filter) {
    filteredLogs = logs.filter(log => 
      JSON.stringify(log).toLowerCase().includes(filter.toLowerCase())
    );
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Forensics Medium</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 1200px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; border: 1px solid #0f3460; text-align: left; }
        th { background: #0f3460; }
        tr:nth-child(even) { background: #16213e; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Forensics Medium - Log File Analysis</h2>
        <p>Goal: Analyze server logs to find suspicious activity and extract the flag.</p>
        <form method="GET">
          <input name="filter" placeholder="Filter logs (IP, user, action, etc.)" value="${filter}" />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Filter Logs</button>
        </form>
        ${foundFlag ? `
          <p style="color:#44ff44;margin-top:12px;">Flag found: ${flag}</p>
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
        <table>
          <tr>
            <th>Timestamp</th>
            <th>IP Address</th>
            <th>Action</th>
            <th>User/File/Data</th>
            <th>Status</th>
          </tr>
          ${filteredLogs.map(log => `
            <tr>
              <td>${log.timestamp}</td>
              <td>${log.ip}</td>
              <td>${log.action}</td>
              <td>${log.user || log.file || log.data || 'N/A'}</td>
              <td>${log.status}</td>
            </tr>
          `).join('')}
        </table>
        <p>Hint: Look for unusual activities, suspicious IPs, or data exports.</p>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;

