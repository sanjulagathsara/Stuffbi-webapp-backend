// scripts/seedUser.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../src/config/db");

async function seed() {
  const email = "test@example.com";
  const plainPassword = "password123";
  const role = "admin";

  const password_hash = await bcrypt.hash(plainPassword, 10);

  await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
    [email, password_hash, role]
  );

  console.log("Seeded user:", email, "password:", plainPassword);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
