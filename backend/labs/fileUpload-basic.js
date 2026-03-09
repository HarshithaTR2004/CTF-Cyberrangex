const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { generateVerificationToken } = require("../utils/challengeVerification");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Basic file upload - no validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  const challengeId = req.query.challengeId || "";
  const userId = req.query.userId || "";
  const isSuccess = req.query.success === "1" || req.query.success === "true";
  
  // Generate verification token if challenge was solved
  let verificationToken = null;
  if (isSuccess && userId && challengeId) {
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
      <title>File Upload Basic</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input[type="file"] { margin: 10px 0; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .success { color: #44ff44; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>File Upload Basic - Malicious File Upload</h2>
        <p>Goal: Upload a malicious file (e.g., PHP shell) and execute it.</p>
        <form method="POST" enctype="multipart/form-data">
          <input type="file" name="file" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Upload File</button>
        </form>
        ${isSuccess ? `
          <p class="success">File uploaded successfully! Flag: FLAG{file_upload_basic_005}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: 'FLAG{file_upload_basic_005}', 
                answer: 'FLAG{file_upload_basic_005}',
                verificationToken: '${verificationToken || ''}'
              }, '*');
            }
          </script>
        ` : ''}
        <p>Hint: No file type validation. Try uploading a web shell.</p>
      </div>
    </body>
    </html>
  `);
});

router.post("/", upload.single("file"), (req, res) => {
  const challengeId = req.body.challengeId || "";
  const userId = req.body.userId || "";
  if (req.file) {
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (fileExt === ".php" || fileExt === ".jsp" || fileExt === ".asp" || req.file.originalname.includes("shell")) {
      return res.redirect(`/lab/file-upload-basic?success=1&challengeId=${challengeId}&userId=${userId}`);
    }
    return res.redirect(`/lab/file-upload-basic?success=1&challengeId=${challengeId}&userId=${userId}`);
  }
  res.redirect(`/lab/file-upload-basic?challengeId=${challengeId}&userId=${userId}`);
});

module.exports = router;

