const express = require("express");
const router = express.Router();
const { generateVerificationToken } = require("../utils/challengeVerification");

// IDOR Medium - Invoice Data Exposure
const invoices = {
  1001: { id: 1001, userId: 1, amount: 1000, items: ["Product A"], flag: "FLAG{idor_api_medium_011}" },
  1002: { id: 1002, userId: 2, amount: 500, items: ["Product B"] },
  1003: { id: 1003, userId: 3, amount: 750, items: ["Product C"] },
  1004: { id: 1004, userId: 1, amount: 2000, items: ["Product D", "Product E"] }
};

router.get("/", (req, res) => {
  const invoiceId = req.query.invoiceId || "1002"; // Default to current user's invoice
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  
  const invoice = invoices[invoiceId];
  
  // Check if IDOR was exploited (accessing invoice 1001 or 1004 which have flags)
  const isExploited = invoice && invoice.flag && (invoiceId === "1001" || invoiceId === "1004");
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (isExploited && userId && challengeId) {
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
      <title>IDOR Medium</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input { padding: 10px; width: 300px; background: #16213e; color: #eee; border: 2px solid #0f3460; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .invoice { padding: 15px; background: #16213e; margin: 20px 0; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>IDOR Medium - Invoice Data Exposure</h2>
        <p>Goal: Access invoices belonging to other users by manipulating invoice IDs.</p>
        <p>You are logged in as user 2. Your invoice ID is 1002.</p>
        <form method="GET">
          <input name="invoiceId" placeholder="Invoice ID" value="${invoiceId}" />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>View Invoice</button>
        </form>
        ${invoice ? `
          <div class="invoice">
            <h3>Invoice #${invoice.id}</h3>
            <p>User ID: ${invoice.userId}</p>
            <p>Amount: $${invoice.amount}</p>
            <p>Items: ${invoice.items.join(", ")}</p>
            ${isExploited ? `
              <p style="color:#44ff44;margin-top:12px;">Flag: ${invoice.flag}</p>
              <script>
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ 
                    type: 'CHALLENGE_SOLVED', 
                    challengeId: '${challengeId}',
                    flag: '${invoice.flag}', 
                    answer: '${invoice.flag}',
                    verificationToken: '${verificationToken || ''}'
                  }, '*');
                }
              </script>
            ` : ''}
          </div>
        ` : '<p>Invoice not found</p>'}
      </div>
    </body>
    </html>
  `);
});

module.exports = router;

