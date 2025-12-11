// src/profile/profile.service.js
const pool = require("../config/db");

/**
 * Get profile for a specific userId
 */
async function getProfileByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT user_id, display_name, avatar_url, phone, created_at, updated_at
     FROM profiles
     WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * Update profile for a specific userId
 * Returns { old, new } or null if not found
 */
async function updateProfile(userId, data) {
  const existing = await getProfileByUserId(userId);
  if (!existing) return null;

  const { display_name, avatar_url, phone } = data;

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

  return { old: existing, new: rows[0] };
}

/**
 * Delete user (cascades to profile, bundles, items, activity_log)
 */
async function deleteUser(userId) {
  // fetch for logging
  const { rows } = await pool.query(
    `SELECT id, email, role, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );
  const user = rows[0];
  if (!user) return null;

  await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

  return user;
}

module.exports = {
  getProfileByUserId,
  updateProfile,
  deleteUser,
};
