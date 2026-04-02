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

exports.getProducts = async () => {
  return await Product.find().populate("category");
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