// src/bundles/bundle.service.js
// Service functions for bundle data operations

const pool = require("../config/db");

async function getBundles(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM bundles WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

async function createBundle(userId, title, subtitle) {
  const { rows } = await pool.query(
    `INSERT INTO bundles (user_id, title, subtitle)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, title, subtitle || null]
  );
  return rows[0];
}

async function updateBundle(userId, bundleId, fields) {
  const oldBundle = await pool.query(
    "SELECT * FROM bundles WHERE id = $1 AND user_id = $2",
    [bundleId, userId]
  );

  if (oldBundle.rows.length === 0) return null;

  const { title, subtitle, image_url } = fields;

  const { rows } = await pool.query(
    `UPDATE bundles
     SET title = COALESCE($1, title),
         subtitle = COALESCE($2, subtitle),
         image_url = COALESCE($3, image_url),
         updated_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [title, subtitle, image_url, bundleId, userId]
  );

  return { old: oldBundle.rows[0], new: rows[0] };
}

async function deleteBundle(userId, bundleId) {
  const { rows } = await pool.query(
    "DELETE FROM bundles WHERE id = $1 AND user_id = $2 RETURNING *",
    [bundleId, userId]
  );
  return rows[0];
}

module.exports = {
  getBundles,
  createBundle,
  updateBundle,
  deleteBundle,
};
