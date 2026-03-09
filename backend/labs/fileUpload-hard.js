const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { generateVerificationToken } = require("../utils/challengeVerification");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Hard - Extension blacklist (can be bypassed with double extension)
const blacklistedExtensions = [".php", ".jsp", ".asp", ".exe", ".sh"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (blacklistedExtensions.includes(fileExt)) {
      cb(new Error("File type not allowed"));
    } else {
      cb(null, true);
    }
  }
});

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
      <title>File Upload Hard</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        input[type="file"] { margin: 10px 0; }
        button { padding: 10px 20px; background: #0f3460; color: #eee; border: none; cursor: pointer; }
        .success { color: #44ff44; }
        .error { color: #ff4444; }
        .flag { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>File Upload Hard - Web Shell Execution</h2>
        <p>Goal: Upload and execute a web shell despite extension blacklist.</p>
        <p>Blacklisted extensions: .php, .jsp, .asp, .exe, .sh</p>
        <form method="POST" enctype="multipart/form-data">
          <input type="file" name="file" required />
          <input type="hidden" name="challengeId" value="${challengeId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <button>Upload File</button>
        </form>
        ${isSuccess ? `
          <p class="success">File uploaded and executed! Flag: FLAG{polyglot_upload_hard_018}</p>
          <script>
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'CHALLENGE_SOLVED', 
                challengeId: '${challengeId}',
                flag: 'FLAG{polyglot_upload_hard_018}', 
                answer: 'FLAG{polyglot_upload_hard_018}',
                verificationToken: '${verificationToken || ''}'
              }, '*');
            }
          </script>
        ` : ''}
        ${req.query.error ? `<p class="error">${req.query.error}</p>` : ''}
        <p>Hint: Try double extensions or null bytes: shell.php.jpg or shell.php%00.jpg</p>
      </div>
    </body>
    </html>
  `);
});

router.post("/", (req, res) => {
  const challengeId = req.body.challengeId || "";
  const userId = req.body.userId || "";
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.redirect(`/lab/file-upload-hard?error=${encodeURIComponent(err.message)}&challengeId=${challengeId}&userId=${userId}`);
    }
    if (req.file) {
      const filename = req.file.filename.toLowerCase();
      // Check for bypass attempts
      if (filename.includes(".php") || filename.includes("shell") || 
          filename.includes("%00") || filename.includes("php.jpg") || 
          filename.includes("php.png")) {
        return res.redirect(`/lab/file-upload-hard?success=1&challengeId=${challengeId}&userId=${userId}`);
      }
      return res.redirect(`/lab/file-upload-hard?success=1&challengeId=${challengeId}&userId=${userId}`);
    }
    res.redirect(`/lab/file-upload-hard?challengeId=${challengeId}&userId=${userId}`);
  });
});

module.exports = router;

