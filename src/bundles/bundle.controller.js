// src/bundles/bundle.controller.js
const pool = require("../config/db");

// GET /bundles
async function getBundles(req, res) {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      "SELECT id, title, subtitle, image_url FROM bundles WHERE user_id = $1",
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("BUNDLES ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /bundles
async function createBundle(req, res) {
  const { title, subtitle } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      "INSERT INTO bundles (user_id, title, subtitle) VALUES ($1, $2, $3) RETURNING *",
      [userId, title, subtitle || null]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("BUNDLE CREATE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getBundles,
  createBundle,
};
