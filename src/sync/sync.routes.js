// src/sync/sync.routes.js
// Routes for synchronization endpoints

const express = require("express");
const router = express.Router();
const syncController = require("./sync.controller");
const authMiddleware = require("../auth/auth.middleware");

// All sync routes require authentication
router.use(authMiddleware);

// POST /sync - Push local changes and pull server changes
router.post("/", syncController.sync);

// GET /sync/pull - Pull changes since a specific timestamp
router.get("/pull", syncController.pullChanges);

module.exports = router;
