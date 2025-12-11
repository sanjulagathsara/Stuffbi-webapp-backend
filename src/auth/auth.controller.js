// src/auth/auth.controller.js
const {
  findUserByEmail,
  createUser,
  validatePassword,
  generateToken
} = require("./auth.service");

const bcrypt = require("bcrypt");

// POST /auth/register
async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const existing = await findUserByEmail(email);
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser(email, hashedPassword);

    const token = generateToken(newUser);

    return res.status(201).json({
      message: "User registered successfully",
      accessToken: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


// POST /auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const matches = await validatePassword(password, user.password_hash);
    if (!matches) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    return res.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


// MUST EXPORT BOTH!
module.exports = {
  login,
  register
};
