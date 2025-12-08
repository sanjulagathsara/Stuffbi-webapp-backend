// src/config/db.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to Postgres");
    client.release();
  })
  .catch((err) => {
    console.error("Postgres connection error", err);
  });

module.exports = pool;
