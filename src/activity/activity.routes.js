const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.middleware");
const { getActivityLogs } = require("./activity.controller");

// GET /activity?page=1&limit=20
router.get("/", auth, getActivityLogs);

module.exports = router;
