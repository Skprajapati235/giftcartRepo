const service = require("../services/flavorService");
const { logActivity } = require("../utils/auditLogger");

exports.create = async (req, res) => {
  try {
    const data = await service.createFlavor(req.body);
    await logActivity({
      req,
      action: "Created Flavor",
      module: "Catalog",
      details: `Added new cake flavor "${data?.name || "Flavor"}".`,
      severity: "info",
      metadata: { flavorId: data?._id, name: data?.name },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, all } = req.query;
    
    if (all === 'true') {
        const data = await service.getAllFlavorsList();
        return res.json(data);
    }

    const data = await service.getFlavors({
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
    const data = await service.updateFlavor(req.params.id, req.body);
    await logActivity({
      req,
      action: "Updated Flavor",
      module: "Catalog",
      details: `Updated flavor "${data?.name || req.params.id}".`,
      severity: "info",
      metadata: { flavorId: req.params.id, name: data?.name },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await service.deleteFlavor(req.params.id);
    await logActivity({
      req,
      action: "Deleted Flavor",
      module: "Catalog",
      details: `Permanently removed flavor ID "${req.params.id}".`,
      severity: "warning",
      metadata: { flavorId: req.params.id },
    });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
