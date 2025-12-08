// src/items/item.routes.js
const express = require("express");
const pool = require("../config/db");
const auth = require("../auth/auth.middleware");

const router = express.Router();

// GET /items
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { rows } = await pool.query(
      "SELECT id, title, subtitle, image_url, bundle_id FROM items WHERE user_id = $1",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("ITEMS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /items
router.post("/", auth, async (req, res) => {
  const { name, subtitle } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const userId = req.user.sub;
    const { rows } = await pool.query(
      "INSERT INTO items (user_id, name, subtitle) VALUES ($1, $2, $3) RETURNING *",
      [userId, name, subtitle || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("ITEM CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
