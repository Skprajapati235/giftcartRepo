const Product = require("../models/Product");

exports.createProduct = async (data) => {
  if (data.flavor === "" || data.flavor === "null" || data.flavor === "undefined") {
    data.flavor = undefined;
  }
  console.log("Creating Product with cleaned data:", data);
  try {
    const product = await Product.create(data);
    console.log("Saved Product:", product);
    return product;
  } catch (error) {
    console.error("Error creating product details:", {
      message: error.message,
      stack: error.stack,
      data: data
    });
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
    .populate("flavor")
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
  return await Product.findById(id).populate("category").populate("flavor");
};

exports.updateProduct = async (id, data) => {
  if (data.flavor === "" || data.flavor === "null" || data.flavor === "undefined") {
    data.flavor = null;
  }
  try {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    console.error("Error updating product details:", {
      message: error.message,
      stack: error.stack,
      id,
      data
    });
    throw error;
  }
};

exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};