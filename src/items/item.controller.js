const itemService = require("./item.service");
const { logActivity } = require("../activity/activity.service");

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
