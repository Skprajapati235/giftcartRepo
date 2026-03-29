const service = require("../services/categoryService");

exports.create = async (req, res) => {
  const data = await service.createCategory(req.body);
  res.json(data);
};

exports.getAll = async (req, res) => {
  const data = await service.getCategories();
  res.json(data);
};

exports.update = async (req, res) => {
  const data = await service.updateCategory(req.params.id, req.body);
  res.json(data);
};

exports.delete = async (req, res) => {
  await service.deleteCategory(req.params.id);
  res.json({ message: "Deleted" });
};