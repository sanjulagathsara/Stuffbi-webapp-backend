const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.middleware");
const controller = require("./item.controller");

router.get("/", auth, controller.getItems);
router.post("/", auth, controller.createItem);
router.put("/:id", auth, controller.updateItem);
router.delete("/:id", auth, controller.deleteItem);

module.exports = router;
