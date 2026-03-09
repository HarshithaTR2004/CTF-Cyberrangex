const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { generateVerificationToken } = require("../utils/challengeVerification");

// Forensics Hard - Memory Dump Investigation
// Simulated memory dump with encoded/obfuscated flag
const flag = "FLAG{memory_advanced_071}";
const encodedFlag = Buffer.from(flag).toString("base64");
const hexFlag = Buffer.from(flag).toString("hex");

// Simulated memory dump data
const memoryDump = {
  processes: [
    { pid: 1001, name: "web_server", memory: "0x7f8a1c000000-0x7f8a1c100000" },
    { pid: 1002, name: "database", memory: "0x7f8b2d000000-0x7f8b2d200000" },
    { pid: 1003, name: "secret_process", memory: "0x7f8c3e000000-0x7f8c3e100000", data: hexFlag }
  ],
  strings: [
    "password=secret123",
    "FLAG{forensics_hard_memory_dump_cde}",
    `base64_data=${encodedFlag}`,
    "api_key=sk_test_abc123",
    `hex_string=${hexFlag}`
  ],
  network: [
    { connection: "192.168.1.100:443", data: `GET /api/flag HTTP/1.1\nAuthorization: Bearer ${encodedFlag}` }
  ]
};

router.get("/", (req, res) => {
  const section = req.query.section || "overview";
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  
  // Generate verification token when user accesses sections containing the flag
  let verificationToken = null;
  const flagSections = ["processes", "strings", "network"];
  if (flagSections.includes(section) && userId && challengeId) {
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
      <title>Forensics Hard</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 1200px; margin: 0 auto; }
        .nav { margin: 20px 0; }
        .nav a { padding: 10px 15px; margin: 5px; background: #0f3460; color: #eee; text-decoration: none; display: inline-block; }
        .nav a.active { background: #16213e; }
        pre { background: #16213e; padding: 15px; border-radius: 5px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; border: 1px solid #0f3460; text-align: left; }
        th { background: #0f3460; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Forensics Hard - Memory Dump Investigation</h2>
        <p>Goal: Analyze a memory dump to find encoded/obfuscated flags and sensitive data.</p>
        
        <div class="nav">
          <a href="/lab/forensics-hard?section=overview&challengeId=${challengeId}&userId=${userId}" class="${section === 'overview' ? 'active' : ''}">Overview</a>
          <a href="/lab/forensics-hard?section=processes&challengeId=${challengeId}&userId=${userId}" class="${section === 'processes' ? 'active' : ''}">Processes</a>
          <a href="/lab/forensics-hard?section=strings&challengeId=${challengeId}&userId=${userId}" class="${section === 'strings' ? 'active' : ''}">Strings</a>
          <a href="/lab/forensics-hard?section=network&challengeId=${challengeId}&userId=${userId}" class="${section === 'network' ? 'active' : ''}">Network</a>
        </div>
        ${flagSections.includes(section) ? `
          <p style="color:#44ff44;margin-top:12px;">Flag found in this section: ${flag}</p>
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
        
        ${section === 'overview' ? `
          <p>Memory dump collected at: 2024-01-01 12:00:00</p>
          <p>Total processes: ${memoryDump.processes.length}</p>
          <p>Total strings: ${memoryDump.strings.length}</p>
          <p>Network connections: ${memoryDump.network.length}</p>
          <p>Hint: Look for base64, hex encoded data, and unusual process names.</p>
        ` : ''}
        
        ${section === 'processes' ? `
          <table>
            <tr><th>PID</th><th>Name</th><th>Memory Range</th><th>Data</th></tr>
            ${memoryDump.processes.map(p => `
              <tr>
                <td>${p.pid}</td>
                <td>${p.name}</td>
                <td>${p.memory}</td>
                <td>${p.data || 'N/A'}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}
        
        ${section === 'strings' ? `
          <pre>${memoryDump.strings.join('\n')}</pre>
        ` : ''}
        
        ${section === 'network' ? `
          <pre>${memoryDump.network.map(n => `${n.connection}\n${n.data}`).join('\n\n')}</pre>
        ` : ''}
      </div>
    </body>
    </html>
  `);
});

module.exports = router;

