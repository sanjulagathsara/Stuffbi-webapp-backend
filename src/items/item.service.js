const pool = require("../config/db");

async function getItems(userId) {
  const { rows } = await pool.query(
    "SELECT items.*,bundles.title FROM items Inner Join bundles on items.bundle_id = bundles.id WHERE items.user_id = $1 ORDER BY items.created_at DESC",
    [userId]
  );
  return rows;
}


async function createItem(userId, data) {
  const { name, subtitle, bundle_id, image_url } = data;
  const { rows } = await pool.query(
    `INSERT INTO items (user_id, name, subtitle, bundle_id, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, name, subtitle || null, bundle_id || null, image_url || null]
  );
  return rows[0];
}

async function updateItem(userId, itemId, data) {
  const oldItem = await pool.query(
    "SELECT * FROM items WHERE id = $1 AND user_id = $2",
    [itemId, userId]
  );

  if (oldItem.rows.length === 0) return null;

  const { name, subtitle, image_url, bundle_id } = data;

  const { rows } = await pool.query(
    `UPDATE items
     SET name = COALESCE($1, name),
         subtitle = COALESCE($2, subtitle),
         image_url = COALESCE($3, image_url),
         bundle_id = COALESCE($4, bundle_id),
         updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [name, subtitle, image_url, bundle_id, itemId, userId]
  );

  return { old: oldItem.rows[0], new: rows[0] };
}

async function deleteItem(userId, itemId) {
  const { rows } = await pool.query(
    "DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING *",
    [itemId, userId]
  );
  return rows[0];
}

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
};
