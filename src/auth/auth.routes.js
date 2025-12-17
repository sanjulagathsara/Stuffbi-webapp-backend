// src/auth/auth.routes.js
// Routes for authentication: login and registration

const express = require("express");
const { login, register } = require("./auth.controller");

const router = express.Router();

// POST /auth/login
router.post("/login", login);
router.post("/register", register);

module.exports = router;
