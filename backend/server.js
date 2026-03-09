const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const Challenge = require("./models/Challenge");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const profileRoutes = require("./routes/profileRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const challengeGuideRoutes = require("./routes/challengeGuideRoutes");
const scenarioRoutes = require("./routes/scenarioRoutes"); // New scenario routes
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/challenge-guide", challengeGuideRoutes);
app.use("/api/scenarios", scenarioRoutes); // Use scenario routes
app.use("/api/admin", adminRoutes);

// Lab Routes - All 24 Challenges
// In some deployments the vulnerable lab apps may not be present.
// Wrap requires in a try/catch so the main API can still start.
try {
  const xssBasic = require("./labs/xss-basic");
  const xssMedium = require("./labs/xss-medium");
  const xssHard = require("./labs/xss-hard");
  const sqliBasic = require("./labs/sqli-basic");
  const sqliMedium = require("./labs/sqli-medium");
  const sqliHard = require("./labs/sqli-hard");
  const csrfBasic = require("./labs/csrf-basic");
  const csrfMedium = require("./labs/csrf-medium");
  const csrfHard = require("./labs/csrf-hard");
  const idorBasic = require("./labs/idor-basic");
  const idorMedium = require("./labs/idor-medium");
  const idorHard = require("./labs/idor-hard");
  const fileUploadBasic = require("./labs/fileUpload-basic");
  const fileUploadMedium = require("./labs/fileUpload-medium");
  const fileUploadHard = require("./labs/fileUpload-hard");
  const commandInjectionBasic = require("./labs/commandInjection-basic");
  const commandInjectionMedium = require("./labs/commandInjection-medium");
  const commandInjectionHard = require("./labs/commandInjection-hard");
  const authBypassBasic = require("./labs/authBypass-basic");
  const authBypassMedium = require("./labs/authBypass-medium");
  const authBypassHard = require("./labs/authBypass-hard");
  const forensicsBasic = require("./labs/forensics-basic");
  const forensicsMedium = require("./labs/forensics-medium");
  const forensicsHard = require("./labs/forensics-hard");

  // XSS Challenges
  app.use("/lab/xss-basic", xssBasic);
  app.use("/lab/xss-medium", xssMedium);
  app.use("/lab/xss-hard", xssHard);

  // SQL Injection Challenges
  app.use("/lab/sqli-basic", sqliBasic);
  app.use("/lab/sqli-medium", sqliMedium);
  app.use("/lab/sqli-hard", sqliHard);

  // CSRF Challenges
  app.use("/lab/csrf-basic", csrfBasic);
  app.use("/lab/csrf-medium", csrfMedium);
  app.use("/lab/csrf-hard", csrfHard);

  // IDOR Challenges
  app.use("/lab/idor-basic", idorBasic);
  app.use("/lab/idor-medium", idorMedium);
  app.use("/lab/idor-hard", idorHard);

  // File Upload Challenges
  app.use("/lab/file-upload-basic", fileUploadBasic);
  app.use("/lab/file-upload-medium", fileUploadMedium);
  app.use("/lab/file-upload-hard", fileUploadHard);

  // Command Injection Challenges
  app.use("/lab/command-injection-basic", commandInjectionBasic);
  app.use("/lab/command-injection-medium", commandInjectionMedium);
  app.use("/lab/command-injection-hard", commandInjectionHard);

  // Authentication Bypass Challenges
  app.use("/lab/auth-bypass-basic", authBypassBasic);
  app.use("/lab/auth-bypass-medium", authBypassMedium);
  app.use("/lab/auth-bypass-hard", authBypassHard);

  // Forensics Challenges
  app.use("/lab/forensics-basic", forensicsBasic);
  app.use("/lab/forensics-medium", forensicsMedium);
  app.use("/lab/forensics-hard", forensicsHard);
} catch (err) {
  console.warn("Lab routes disabled (missing lab modules):", err.message);
}

// Redirect /lab/:challengeId to the configured labPath for that challenge
app.get("/lab/:challengeId", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId).select("labPath");
    if (!challenge || !challenge.labPath) {
      return res.status(404).send("Lab not found for this challenge");
    }

    const labPath = challenge.labPath;
    const base = process.env.LAB_BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;
    const target =
      labPath.startsWith("http://") || labPath.startsWith("https://")
        ? labPath
        : `${base}${labPath.startsWith("/") ? "" : "/"}${labPath}`;

    return res.redirect(target);
  } catch (err) {
    console.error("Error resolving lab path:", err);
    return res.status(500).send("Server error resolving lab path");
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("CyberRangeX Backend is Running");
});

// Debug route to list all registered challenge routes
app.get("/debug/routes", (req, res) => {
  try {
    const routes = [];
    if (challengeRoutes && challengeRoutes.stack) {
      challengeRoutes.stack.forEach((middleware) => {
        if (middleware.route) {
          const methods = Object.keys(middleware.route.methods).join(", ").toUpperCase();
          routes.push({
            method: methods,
            path: `/api/challenges${middleware.route.path}`,
          });
        } else if (middleware.name === 'router') {
          // Handle nested routers
          middleware.handle.stack.forEach((nested) => {
            if (nested.route) {
              const methods = Object.keys(nested.route.methods).join(", ").toUpperCase();
              routes.push({
                method: methods,
                path: `/api/challenges${nested.route.path}`,
              });
            }
          });
        }
      });
    }
    res.json({ 
      routes, 
      totalRoutes: routes.length,
      message: "Available challenge routes",
      note: "If /domain/:domain is missing, the server needs to be restarted"
    });
  } catch (err) {
    res.json({ error: err.message, stack: err.stack });
  }
});

// New endpoint to serve code files
app.get("/code", async (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ msg: "File path is required" });
  }

  const baseDir = path.resolve(__dirname, ".."); // Project root: cyberrangex/backend
  const allowedDirs = [
    path.join(baseDir, "lab"),
    path.join(baseDir, "test"),
    path.join(baseDir, "solution"),
    path.join(baseDir, "exploit"),
  ];

  const fullPath = path.resolve(baseDir, filePath);

  // Security check: ensure the resolved path is within one of the allowed directories
  const isPathAllowed = allowedDirs.some(dir => fullPath.startsWith(dir));

  if (!isPathAllowed) {
    console.warn(`Unauthorized file access attempt: ${filePath}`);
    return res.status(403).json({ msg: "Unauthorized file access" });
  }

  try {
    const codeContent = await fs.promises.readFile(fullPath, "utf8");
    res.send(codeContent);
  } catch (err) {
    console.error("Error reading code file:", err);
    if (err.code === "ENOENT") {
      return res.status(404).json({ msg: "Code file not found" });
    }
    res.status(500).json({ msg: "Server error reading code file" });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cyberrangex")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
