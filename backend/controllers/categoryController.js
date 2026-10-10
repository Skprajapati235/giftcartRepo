const service = require("../services/categoryService");
const { logActivity } = require("../utils/auditLogger");

exports.create = async (req, res) => {
  try {
    const data = await service.createCategory(req.body);
    await logActivity({
      req,
      action: "Created Category",
      module: "Catalog",
      details: `Created new category taxonomy "${data?.name || "Category"}".`,
      severity: "info",
      metadata: { categoryId: data?._id, name: data?.name },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await service.getCategories({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || ""
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await service.getCategoryById(req.params.id);
    if (!data) return res.status(404).json({ message: "Category not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateCategory(req.params.id, req.body);
    await logActivity({
      req,
      action: "Updated Category",
      module: "Catalog",
      details: `Updated category "${data?.name || req.params.id}".`,
      severity: "info",
      metadata: { categoryId: req.params.id, name: data?.name },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const catBefore = await service.getCategoryById(req.params.id).catch(() => null);
    await service.deleteCategory(req.params.id);
    await logActivity({
      req,
      action: "Deleted Category",
      module: "Catalog",
      details: `Permanently removed category "${catBefore?.name || req.params.id}".`,
      severity: "warning",
      metadata: { categoryId: req.params.id, name: catBefore?.name },
    });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};