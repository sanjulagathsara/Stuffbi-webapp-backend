const bundleService = require("./bundle.service");
const { logActivity } = require("../activity/activity.service");

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
