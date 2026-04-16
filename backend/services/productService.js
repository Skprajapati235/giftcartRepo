const Product = require("../models/Product");

exports.createProduct = async (data) => {
  console.log("Creating Product with data:", data);
  try {
    const product = await Product.create(data);
    console.log("Saved Product:", product);
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

exports.getProducts = async ({ page = 1, limit = 10, search = "", category = "" } = {}) => {
  const skip = (page - 1) * limit;
  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (category && category !== "all" && category !== "null" && category !== "undefined") {
    query.category = category;
  }

  const products = await Product.find(query)
    .populate("category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  return {
    data: products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

exports.getProductById = async (id) => {
  return await Product.findById(id).populate("category");
};

exports.updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};