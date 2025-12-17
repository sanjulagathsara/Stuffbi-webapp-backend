// src/bundles/bundle.routes.js
// Routes for bundle-related endpoints

const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.middleware");
const controller = require("./bundle.controller");

router.get("/", auth, controller.getBundles);
router.post("/", auth, controller.createBundle);
router.put("/:id", auth, controller.updateBundle);
router.delete("/:id", auth, controller.deleteBundle);

router.post("/image/presign", auth, controller.presignNewBundleImage);
router.post("/:id/image/presign", auth, controller.presignBundleImage);
router.get("/:id/image/view-url", auth, controller.getBundleImageViewUrl);

module.exports = router;
