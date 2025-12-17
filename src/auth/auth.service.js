// src/auth/auth.service.js
// Service functions for authentication: user lookup, password validation, token generation

require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;

// Find user by email
async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return rows[0];
}

// Create user
async function createUser(email, hashedPassword) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, role`,
    [email, hashedPassword]
  );
  return rows[0];
}

// Validate password
async function validatePassword(inputPassword, hashedPassword) {
  return bcrypt.compare(inputPassword, hashedPassword);
}

// Generate JWT token
function generateToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

module.exports = {
  findUserByEmail,
  validatePassword,
  generateToken,
  createUser,
};
