// src/bundles/bundle.routes.js
const express = require("express");
const auth = require("../auth/auth.middleware");
const {
  getBundles,
  createBundle,
} = require("./bundle.controller");

const router = express.Router();

// GET /bundles
router.get("/", auth, getBundles);

// POST /bundles
router.post("/", auth, createBundle);

module.exports = router;
