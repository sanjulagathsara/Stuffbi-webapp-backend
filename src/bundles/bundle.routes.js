const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.middleware");
const controller = require("./bundle.controller");

router.get("/", auth, controller.getBundles);
router.post("/", auth, controller.createBundle);
router.put("/:id", auth, controller.updateBundle);
router.delete("/:id", auth, controller.deleteBundle);

module.exports = router;
