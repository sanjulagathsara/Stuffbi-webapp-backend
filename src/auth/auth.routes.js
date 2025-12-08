// src/auth/auth.routes.js
const express = require("express");
const { login } = require("./auth.controller");

const router = express.Router();

// POST /auth/login
router.post("/login", login);

module.exports = router;
