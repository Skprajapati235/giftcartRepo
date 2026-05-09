const service = require("../services/productService");

exports.create = async (req, res) => {
  try {
    const data = await service.createProduct(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, category } = req.query;
    console.log("Fetching products with filters:", { page, limit, search, category });
    const data = await service.getProducts({ 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10, 
      search: search || "",
      category: category || ""
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await service.getProductById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateProduct(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await service.deleteProduct(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};