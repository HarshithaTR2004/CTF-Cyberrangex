const express = require("express");
const Challenge = require("../models/Challenge");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Log that routes are being loaded
console.log("[ChallengeRoutes] ========================================");
console.log("[ChallengeRoutes] Loading challenge routes...");
console.log("[ChallengeRoutes] ========================================");

/* ================= CREATE CHALLENGE (generic, not admin-specific) ================= */
router.post("/", auth, async (req, res) => {
  try {
    const challenge = new Challenge(req.body);
    await challenge.save();
    res.status(201).json(challenge);
  } catch (err) {
    console.error("Failed to create challenge:", err);
    res.status(400).json({ msg: "Failed to create challenge", error: err.message });
  }
});

/* ================= GET ALL CHALLENGES ================= */
router.get("/", auth, async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .select("title category difficulty description points domain vmConfig labPath _id")
      .sort({ domain: 1, difficulty: 1, title: 1 });

    console.log(`[Challenges API] Fetched ${challenges.length} challenges for user ${req.user.id}`);

    return res.json(challenges);
  } catch (err) {
    console.error("[Challenges API] Error fetching challenges:", err);
    res.status(500).json({ msg: "Failed to fetch challenges", error: err.message });
  }
});

/* ================= GET CHALLENGES BY DOMAIN ================= */
// CRITICAL: This route MUST come before /:id route to avoid conflicts
console.log("[ChallengeRoutes] ✅ Registering GET /domain/:domain route");
router.get("/domain/:domain", auth, async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    console.log(`[Challenges API] GET /domain/${req.params.domain} -> decoded: "${domain}"`);
    console.log(`[Challenges API] User ID: ${req.user?.id}`);
    
    // Try exact match first
    let challenges = await Challenge.find({ domain })
      .select("title category difficulty description points domain vmConfig labPath _id")
      .sort({ difficulty: 1, title: 1 });

    console.log(`[Challenges API] Found ${challenges.length} challenges for domain: "${domain}"`);
    
    if (challenges.length === 0) {
      // Log available domains for debugging
      const allDomains = await Challenge.distinct("domain");
      console.log(`[Challenges API] Available domains in database:`, allDomains);
      console.log(`[Challenges API] Requested domain "${domain}" not found. Available:`, allDomains);
      
      // Try case-insensitive match
      const caseInsensitiveMatch = allDomains.find(d => 
        d.toLowerCase() === domain.toLowerCase()
      );
      
      if (caseInsensitiveMatch) {
        console.log(`[Challenges API] Found case-insensitive match: "${caseInsensitiveMatch}"`);
        challenges = await Challenge.find({ domain: caseInsensitiveMatch })
          .select("title category difficulty description points domain vmConfig labPath _id")
          .sort({ difficulty: 1, title: 1 });
      }
    }

    return res.json(challenges);
  } catch (err) {
    console.error("[Challenges API] Error fetching challenges by domain:", err);
    res.status(500).json({ msg: "Failed to fetch challenges", error: err.message });
  }
});

/* ================= GET SINGLE CHALLENGE ================= */
router.get("/:id", auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).select(
      "title category difficulty description points hints correctAnswer labPath domain vmConfig vmFlag"
    );

    if (!challenge) return res.status(404).json({ msg: "Challenge not found" });

    // For non-lab challenges, generate verification token when user accesses the challenge
    // This ensures they've at least viewed the challenge before submitting
    // Return the token to the frontend so it can be included in submissions
    let verificationToken = null;
    if (!challenge.labPath && req.user && req.user.id) {
      const { generateVerificationToken } = require("../utils/challengeVerification");
      try {
        verificationToken = generateVerificationToken(req.user.id, challenge._id.toString());
      } catch (err) {
        console.error("Error generating verification token for non-lab challenge:", err);
      }
    }

    const isPrivileged =
      req.user && (req.user.role === "admin" || req.user.role === "instructor");

    const response = {
      _id: challenge._id,
      title: challenge.title,
      category: challenge.category,
      domain: challenge.domain,
      difficulty: challenge.difficulty,
      description: challenge.description,
      points: challenge.points,
      hints: challenge.hints,
      labPath: challenge.labPath || null,
      vmConfig: challenge.vmConfig || null,
      vmFlag: challenge.vmFlag || null,
    };

    // For non-lab challenges, include verification token (user must access challenge page first)
    if (verificationToken) {
      response.verificationToken = verificationToken;
    }

    // Only admins/instructors can see the correct answer from the API
    if (isPrivileged) {
      response.correctAnswer = challenge.correctAnswer;
    }

    res.json(response);
  } catch (err) {
    console.error("Error fetching challenge:", err);
    res.status(500).json({ msg: "Invalid challenge ID" });
  }
});

/* ================= SUBMIT ANSWER ================= */
router.post("/:id/submit", auth, async (req, res) => {
  try {
    const { answer, verificationToken } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ msg: "Please provide an answer.", status: "invalid" });
    }

    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ msg: "Challenge not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Prevent double reward for same challenge
    if (user.completedChallenges.includes(challenge._id)) {
      return res.json({ msg: "Challenge already completed", status: "completed" });
    }

    // IMPORTANT: Require verification token for ALL challenges
    // For lab challenges: token is generated when challenge is solved in lab
    // For non-lab challenges: token is generated when user accesses the challenge page
    const { verifyAndConsumeToken } = require("../utils/challengeVerification");
    
    if (!verificationToken) {
      if (challenge.labPath) {
        return res.status(400).json({
          msg: "This challenge requires solving it in the lab environment first. Please complete the challenge in the lab to get a verification token.",
          status: "verification_required",
        });
      } else {
        return res.status(400).json({
          msg: "Please access the challenge page first before submitting an answer.",
          status: "verification_required",
        });
      }
    }

    const isValidToken = verifyAndConsumeToken(
      verificationToken,
      req.user.id,
      challenge._id.toString()
    );

    if (!isValidToken) {
      if (challenge.labPath) {
        return res.status(400).json({
          msg: "Invalid or expired verification token. Please solve the challenge in the lab environment first.",
          status: "invalid_token",
        });
      } else {
        return res.status(400).json({
          msg: "Invalid or expired verification token. Please access the challenge page again.",
          status: "invalid_token",
        });
      }
    }

    const normalizedSubmitted = answer.trim().toLowerCase();
    const normalizedCorrect = (challenge.correctAnswer || "").trim().toLowerCase();

    const isCorrect = normalizedSubmitted === normalizedCorrect;

    if (!isCorrect) {
      return res.status(400).json({
        msg: "Incorrect answer, try again.",
        status: "incorrect",
      });
    }

    // IMPORTANT: Points are ONLY awarded here, after:
    // 1. Verification token is validated (user solved challenge in lab or accessed challenge page)
    // 2. Flag is validated as correct
    // 3. User hasn't already completed the challenge
    // This is the ONLY place in the codebase where points are awarded for challenges
    const reward = challenge.points || 0;
    user.points = (user.points || 0) + reward;
    user.xp = (user.xp || 0) + reward;
    user.completedChallenges.push(challenge._id);
    await user.save();

    return res.json({
      msg: "Correct answer! Reward granted.",
      status: "correct",
      xpAwarded: reward,
      totalPoints: user.points,
      totalXp: user.xp,
    });
  } catch (err) {
    console.error("Error during answer submission:", err);
    res.status(500).json({ msg: "Server error during answer submission" });
  }
});

console.log("[ChallengeRoutes] ✅ Challenge routes loaded successfully");
console.log("[ChallengeRoutes] ========================================");
module.exports = router;
