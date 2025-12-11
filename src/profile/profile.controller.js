// src/profile/profile.controller.js
const {
  getProfileByUserId,
  updateProfile,
  deleteUser,
} = require("./profile.service");
const { logActivity } = require("../activity/activity.service");

/**
 * GET /profile/me
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (err) {
    console.error("GET MY PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /profile/me
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await updateProfile(userId, req.body);
    if (!result) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // log activity
    await logActivity(
      userId,
      "profile",
      userId,
      "update",
      result.old,
      result.new
    );

    return res.json(result.new);
  } catch (err) {
    console.error("UPDATE MY PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /profile/:userId  (admin or self)
 */
exports.getProfileByUserId = async (req, res) => {
  try {
    const requestedId = parseInt(req.params.userId, 10);

    // Only admin OR the user themselves can access this
    if (req.user.id !== requestedId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const profile = await getProfileByUserId(requestedId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (err) {
    console.error("GET PROFILE BY ID ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /profile/me
 * Hard delete user, cascades to all data
 */
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await deleteUser(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // log account deletion (it will be deleted too due to cascade, but okay)
    await logActivity(
      userId,
      "user",
      userId,
      "delete_account",
      deletedUser,
      null
    );

    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("DELETE MY ACCOUNT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
