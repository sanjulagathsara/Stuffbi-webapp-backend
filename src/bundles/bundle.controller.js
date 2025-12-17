// src/bundles/bundle.controller.js
// Controller functions for bundle routes

const bundleService = require("./bundle.service");
const { logActivity } = require("../activity/activity.service");
const {
  presignNewBundleImageUpload,
  presignBundleImageUpload,
  getPresignedViewUrlForBundle,
} = require("./bundle.upload.service");

exports.getBundles = async (req, res) => {
  const bundles = await bundleService.getBundles(req.user.id);
  res.json(bundles);
};

exports.createBundle = async (req, res) => {
  const bundle = await bundleService.createBundle(
    req.user.id,
    req.body.title,
    req.body.subtitle
  );

  await logActivity(req.user.id, "bundle", bundle.id, "create", null, bundle);
  res.status(201).json(bundle);
};

exports.updateBundle = async (req, res) => {
  const result = await bundleService.updateBundle(
    req.user.id,
    req.params.id,
    req.body
  );

  if (!result) return res.status(404).json({ message: "Bundle not found" });

  await logActivity(
    req.user.id,
    "bundle",
    req.params.id,
    "update",
    result.old,
    result.new
  );

  res.json(result.new);
};

exports.deleteBundle = async (req, res) => {
  const deleted = await bundleService.deleteBundle(req.user.id, req.params.id);

  if (!deleted) return res.status(404).json({ message: "Bundle not found" });

  await logActivity(req.user.id, "bundle", req.params.id, "delete", deleted, null);
  res.json({ message: "Bundle deleted" });
};

exports.presignNewBundleImage = async (req, res) => {
  try {
    const { contentType } = req.body;
    const result = await presignNewBundleImageUpload(req.user.id, contentType);
    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
};

exports.presignBundleImage = async (req, res) => {
  try {
    const { contentType } = req.body;
    const result = await presignBundleImageUpload(req.user.id, req.params.id, contentType);
    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
};

exports.getBundleImageViewUrl = async (req, res) => {
  try {
    const result = await getPresignedViewUrlForBundle(req.user.id, req.params.id);
    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
};