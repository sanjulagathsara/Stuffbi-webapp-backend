// src/profile/profile.routes.js
const express = require("express");
const router = express.Router();

const profileController = require("./profile.controller");
const requireAuth = require("../auth/auth.middleware");

// Get current user's profile
// GET /profile/me
router.get("/me", requireAuth, profileController.getMyProfile);

// Update current user's profile
// PUT /profile/me
router.put("/me", requireAuth, profileController.updateMyProfile);

// (Optional) Admin endpoints
// GET /profile/:userId
router.get("/:userId", requireAuth, profileController.getProfileByUserId);
// You can also add admin updates later

module.exports = router;
