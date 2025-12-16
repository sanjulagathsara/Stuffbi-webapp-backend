// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

// Import routes
const authRoutes = require("./auth/auth.routes");
const itemRoutes = require("./items/item.routes");
const bundleRoutes = require("./bundles/bundle.routes");
const profileRoutes = require("./profile/profile.routes");
const activityRoutes = require("./activity/activity.routes");
const syncRoutes = require("./sync/sync.routes");

const app = express();

// -----------------------
// CORS CONFIGURATION
// -----------------------
const allowedOrigins = [
  "http://localhost:3000",                               // Local Next.js dev
  "https://stuffbi-webapp-frontend.vercel.app",          // Vercel production domain
  "http://localhost:8080",                               // Flutter web
  "capacitor://localhost",                               // Flutter iOS/Android
  "http://localhost",
  "http://localhost:5173",                                   // Mobile debugging
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow tools like Postman / curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error("CORS Not Allowed"), false);
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// -----------------------
// API routes
// -----------------------
// You can optionally add "/api" prefix later if you want versioning
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/bundles", bundleRoutes);
app.use("/profile", profileRoutes);
app.use("/activity", activityRoutes);
app.use("/sync", syncRoutes);

// Global error handler (optional, but nice to have)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
