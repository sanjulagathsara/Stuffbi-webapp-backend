const pool = require("../config/db");

async function logActivity(userId, entityType, entityId, action, oldValue = null, newValue = null) {
  try {
    await pool.query(
      `INSERT INTO activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, entityType, entityId, action, oldValue, newValue]
    );
  } catch (err) {
    console.error("ACTIVITY LOG ERROR:", err);
  }
}

module.exports = { logActivity };
