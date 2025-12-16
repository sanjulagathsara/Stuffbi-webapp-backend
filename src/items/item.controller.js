const itemService = require("./item.service");
const { logActivity } = require("../activity/activity.service");
const { presignItemImageUpload } = require("./item.upload.service");

exports.getItems = async (req, res) => {
  const items = await itemService.getItems(req.user.id);
  res.json(items);
};

exports.createItem = async (req, res) => {
  const item = await itemService.createItem(req.user.id, req.body);
  await logActivity(req.user.id, "item", item.id, "create", null, item);
  res.status(201).json(item);
};

exports.updateItem = async (req, res) => {
  const result = await itemService.updateItem(req.user.id, req.params.id, req.body);

  if (!result) return res.status(404).json({ message: "Item not found" });

  await logActivity(
    req.user.id,
    "item",
    req.params.id,
    "update",
    result.old,
    result.new
  );

  res.json(result.new);
};

exports.deleteItem = async (req, res) => {
  const deleted = await itemService.deleteItem(req.user.id, req.params.id);

  if (!deleted) return res.status(404).json({ message: "Item not found" });

  await logActivity(req.user.id, "item", req.params.id, "delete", deleted, null);
  res.json({ message: "Item deleted" });
};

exports.presignItemImage = async (req, res) => {
  try {
    const { contentType } = req.body;
    const result = await presignItemImageUpload(req.user.id, req.params.id, contentType);
    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
};