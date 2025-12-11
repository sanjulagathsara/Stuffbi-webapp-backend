// src/items/item.controller.js
const pool = require("../config/db");

// GET /items
async function getItems(req, res) {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      "SELECT id, name, subtitle, image_url, bundle_id FROM items WHERE user_id = $1",
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("ITEMS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /items
async function createItem(req, res) {
  const { name, subtitle, bundle_id, image_url } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `INSERT INTO items (user_id, name, subtitle, bundle_id, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, subtitle || null, bundle_id || null, image_url || null]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("ITEM CREATE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getItems,
  createItem,
};
