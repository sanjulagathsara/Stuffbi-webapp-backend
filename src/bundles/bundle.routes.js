// src/bundles/bundle.routes.js
const express = require("express");
const pool = require("../config/db");
const auth = require("../auth/auth.middleware");

const router = express.Router();

// GET /bundles
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { rows } = await pool.query(
      "SELECT id, title, subtitle, image_url FROM bundles WHERE user_id = $1",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("BUNDLES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /bundles
router.post("/", auth, async (req, res) => {
  const { title, subtitle } = req.body;

  if (!title) return res.status(400).json({ message: "Title is required" });

  try {
    const userId = req.user.sub;
    const { rows } = await pool.query(
      "INSERT INTO bundles (user_id, title, subtitle) VALUES ($1, $2, $3) RETURNING *",
      [userId, title, subtitle || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("ITEM CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
