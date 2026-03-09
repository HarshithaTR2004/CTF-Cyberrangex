const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// IDOR Hard - Privilege Escalation via IDOR
const users = {
  1: { id: 1, username: "alice", role: "admin", permissions: ["read", "write", "admin"], flag: "FLAG{idor_chain_hard_017}" },
  2: { id: 2, username: "bob", role: "user", permissions: ["read"] },
  3: { id: 3, username: "charlie", role: "user", permissions: ["read"] }
};

router.get("/", (req, res) => {
  const userId = req.query.userId || "2"; // Current user
  const action = req.query.action || "view";
  const challengeId = req.query.challengeId || "";
  const userIdForToken = req.query.userIdForToken || "";
  
  const user = users[userId];
  const currentUser = users[2]; // Currently logged in as bob (user 2)
  
  // Check if IDOR was exploited (editing user 1's role)
  const isExploited = action === "edit" && userId === "1" && user && user.flag;
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (isExploited && userIdForToken && challengeId) {
    try {
      verificationToken = generateVerificationToken(userIdForToken, challengeId);
    } catch (err) {
      console.error("Error generating verification token:", err);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>IDOR Hard</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input, select { padding: 10px; width: 300px; background: #16213e; color: #eee; border: 2px solid #0f3460; margin: 5px 0; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .user-info { padding: 15px; background: #16213e; margin: 20px 0; }
        .success { color: #44ff44; }
        .error { color: #ff4444; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>IDOR Hard - Privilege Escalation via IDOR</h2>
        <p>Goal: Escalate privileges by modifying your own user profile via IDOR.</p>
        <p>You are currently logged in as: ${currentUser.username} (${currentUser.role})</p>
        <form method="GET">
          <input name="userId" placeholder="User ID" value="${userId}" />
          <select name="action">
            <option value="view" ${action === "view" ? "selected" : ""}>View</option>
            <option value="edit" ${action === "edit" ? "selected" : ""}>Edit Role</option>
          </select>
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userIdForToken" value="${userIdForToken}" />
          <button>Submit</button>
        </form>
        ${user ? `
          <div class="user-info">
            <h3>User #${user.id}: ${user.username}</h3>
            <p>Role: ${user.role}</p>
            <p>Permissions: ${user.permissions.join(", ")}</p>
            ${isExploited ? `
              <p class="success">Role updated to admin! Flag: ${user.flag}</p>
              <script>
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ 
                    type: 'CHALLENGE_SOLVED', 
                    challengeId: '${challengeId}',
                    flag: '${user.flag}', 
                    answer: '${user.flag}',
                    verificationToken: '${verificationToken || ''}'
                  }, '*');
                }
              </script>
            ` : ''}
          </div>
        ` : '<p>User not found</p>'}
        ${req.query.error ? `<p class="error">${req.query.error}</p>` : ''}
      </div>
    </body>
    </html>
  `);
});

module.exports = router;

