// src/items/item.routes.js
const express = require("express");
const auth = require("../auth/auth.middleware");
const {
  getItems,
  createItem,
} = require("./item.controller");

const router = express.Router();

// GET /items
router.get("/", auth, getItems);

// POST /items
router.post("/", auth, createItem);

module.exports = router;
