const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get leaderboard
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find()
      .select("username xp completedChallenges createdAt")
      .sort({ xp: -1 })
      .limit(100);

    res.json(users);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ msg: "Failed to fetch leaderboard" });
  }
});

module.exports = router;

