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

    let logsQuery;
    let logsParams;
    let countQuery;
    let countParams;

    // -------------------------------------
    // ADMIN → return ALL activity logs
    // -------------------------------------
    if (role === "admin") {
      logsQuery = `
        SELECT 
          a.*,
          CASE 
            WHEN a.entity_type = 'bundle' THEN b.title
            WHEN a.entity_type = 'item' THEN i.name
            WHEN a.entity_type = 'profile' THEN 'User Profile'
            ELSE NULL
          END AS entity_name
        FROM activity_log a
        LEFT JOIN bundles b ON a.entity_type = 'bundle' AND a.entity_id = b.id
        LEFT JOIN items i ON a.entity_type = 'item' AND a.entity_id = i.id
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      logsParams = [limit, offset];

      countQuery = `SELECT COUNT(*) FROM activity_log`;
      countParams = [];

    } else {
      // -------------------------------------
      // NORMAL USER → only see their logs
      // -------------------------------------
      logsQuery = `
        SELECT 
          a.*,
          CASE 
            WHEN a.entity_type = 'bundle' THEN b.title
            WHEN a.entity_type = 'item' THEN i.name
            WHEN a.entity_type = 'profile' THEN 'User Profile'
            ELSE NULL
          END AS entity_name
        FROM activity_log a
        LEFT JOIN bundles b ON a.entity_type = 'bundle' AND a.entity_id = b.id
        LEFT JOIN items i ON a.entity_type = 'item' AND a.entity_id = i.id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      logsParams = [userId, limit, offset];

      countQuery = `
        SELECT COUNT(*) 
        FROM activity_log 
        WHERE user_id = $1
      `;
      countParams = [userId];
    }

    // Execute
    const logsResult = await pool.query(logsQuery, logsParams);
    const countResult = await pool.query(countQuery, countParams);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: logsResult.rows,
    });

  } catch (err) {
    console.error("ACTIVITY FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to load activity logs" });
  }
};
