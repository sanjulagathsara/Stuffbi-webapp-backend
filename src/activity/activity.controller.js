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
    let countQuery;
    let params;

    // If admin → fetch all logs
    if (role === "admin") {
      logsQuery = `
        SELECT * FROM activity_log
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      countQuery = `SELECT COUNT(*) FROM activity_log`;
      params = [limit, offset];
    } 
    // Normal user → fetch only own logs
    else {
      logsQuery = `
        SELECT * FROM activity_log
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      countQuery = `SELECT COUNT(*) FROM activity_log WHERE user_id = $1`;
      params = [userId, limit, offset];
    }

    const logsResult = await pool.query(logsQuery, params);

    const countResult = await pool.query(countQuery, role === "admin" ? [] : [userId]);
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
