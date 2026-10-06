const service = require("../services/userService");

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await service.getUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || ""
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await service.getAdmins({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || ""
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateUser(req.params.id, req.body);
    const { logActivity } = require("../utils/auditLogger");
    await logActivity({
      req,
      action: `Updated Staff Permissions/Role`,
      module: "Admin Management",
      details: `Updated role and access controls for account "${data?.name || req.params.id}" (${data?.email || ""}). Role: ${data?.role || "N/A"}.`,
      severity: "info",
      metadata: { targetId: req.params.id, role: data?.role },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?._id;
    if (currentUserId && String(currentUserId) === String(req.params.id)) {
      return res.status(400).json({ message: "You cannot delete your own active Super Admin account" });
    }
    await service.deleteUser(req.params.id);
    const { logActivity } = require("../utils/auditLogger");
    await logActivity({
      req,
      action: `Deleted Staff Account`,
      module: "Admin Management",
      details: `Permanently removed staff account ID ${req.params.id}.`,
      severity: "warning",
      metadata: { deletedId: req.params.id },
    });
    res.json({ message: "Admin account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
