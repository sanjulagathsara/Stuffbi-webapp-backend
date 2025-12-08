// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

// Import routes
const authRoutes = require("./auth/auth.routes");
const itemRoutes = require("./items/item.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// API routes
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
