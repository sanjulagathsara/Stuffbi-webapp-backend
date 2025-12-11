const pool = require("../config/db");

// GET /activity?page=1&limit=20
exports.getActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // --------------------------------------------
    // QUERY: Activity logs + JOIN entity names
    // --------------------------------------------
    const logsQuery = `
      SELECT 
        a.*,
        CASE 
          WHEN a.entity_type = 'bundle' THEN b.title
          WHEN a.entity_type = 'item' THEN i.name
          WHEN a.entity_type = 'profile' THEN 'User Profile'
          ELSE NULL
        END AS entity_name
      FROM activity_log a
      LEFT JOIN bundles b 
        ON a.entity_type = 'bundle' AND a.entity_id = b.id
      LEFT JOIN items i 
        ON a.entity_type = 'item' AND a.entity_id = i.id
      WHERE ${role === "admin" ? "TRUE" : "a.user_id = $1"}
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const logsParams =
      role === "admin" ? [limit, offset] : [userId, limit, offset];

    // --------------------------------------------
    // COUNT QUERY
    // --------------------------------------------
    const countQuery = role === "admin"
      ? `SELECT COUNT(*) FROM activity_log`
      : `SELECT COUNT(*) FROM activity_log WHERE user_id = $1`;

    const countParams = role === "admin" ? [] : [userId];

    // --------------------------------------------
    // EXECUTE QUERIES
    // --------------------------------------------
    const logsResult = await pool.query(logsQuery, logsParams);
    const countResult = await pool.query(countQuery, countParams);

    const total = parseInt(countResult.rows[0].count);

    // --------------------------------------------
    // RESPONSE
    // --------------------------------------------
    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: logsResult.rows, // now includes entity_name
    });

  } catch (err) {
    console.error("ACTIVITY FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to load activity logs" });
  }
};
