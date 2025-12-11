// src/profile/profile.controller.js
const pool = require("../config/db");

// GET /profile/me
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware

    const { rows } = await pool.query(
      `SELECT user_id, display_name, email, avatar_url, phone, created_at, updated_at
       FROM profiles
       WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error getting profile:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /profile/me
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { display_name, avatar_url, phone } = req.body;

    const { rows } = await pool.query(
      `UPDATE profiles
         SET display_name = COALESCE($1, display_name),
             avatar_url   = COALESCE($2, avatar_url),
             phone        = COALESCE($3, phone),
             updated_at   = NOW()
       WHERE user_id = $4
       RETURNING user_id, display_name, email, avatar_url, phone, created_at, updated_at`,
      [display_name, avatar_url, phone, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /profile/:userId
exports.getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const { rows } = await pool.query(
      `SELECT user_id, display_name, email, avatar_url, phone, created_at, updated_at
       FROM profiles
       WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error getting profile by id:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
