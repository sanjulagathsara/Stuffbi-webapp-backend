// src/auth/auth.controller.js
const {
  findUserByEmail,
  validatePassword,
  generateToken,
  createUser
} = require("./auth.service");

// POST /auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password required" });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await validatePassword(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateToken(user);

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// POST /auth/register
async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Prevent duplicate accounts
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await createUser(email, hashedPassword);

    // Generate JWT
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
    return res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
  login,
  register
};