// src/users/user.routes.js
const express = require("express");
const pool = require("../config/db");
const auth = require("../auth/auth.middleware");

const router = express.Router();

// GET /users/me  → return current user profile
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const { rows } = await pool.query(
      "SELECT id, email, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("USER ROUTE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
