// src/auth/auth.controller.js
const {
  findUserByEmail,
  validatePassword,
  generateToken,
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

module.exports = {
  login,
};
