// src/profile/profile.routes.js
const express = require("express");
const router = express.Router();

const profileController = require("./profile.controller");
const requireAuth = require("../auth/auth.middleware");

// Current user's profile
router.get("/me", requireAuth, profileController.getMyProfile);
router.put("/me", requireAuth, profileController.updateMyProfile);
router.delete("/me", requireAuth, profileController.deleteMyAccount);

// Admin / self by userId
router.get("/:userId", requireAuth, profileController.getProfileByUserId);

module.exports = router;
