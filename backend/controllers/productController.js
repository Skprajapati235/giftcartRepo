const service = require("../services/productService");

exports.create = async (req, res) => {
  const data = await service.createProduct(req.body);
  res.json(data);
};

exports.getAll = async (req, res) => {
  const data = await service.getProducts();
  res.json(data);
};

exports.getOne = async (req, res) => {
  const data = await service.getProductById(req.params.id);
  res.json(data);
};

exports.update = async (req, res) => {
  const data = await service.updateProduct(req.params.id, req.body);
  res.json(data);
};

exports.delete = async (req, res) => {
  await service.deleteProduct(req.params.id);
  res.json({ message: "Deleted" });
};