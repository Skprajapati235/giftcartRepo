const Category = require("../models/Category");

exports.createCategory = async (data) => {
  return await Category.create(data);
};

exports.getCategories = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;
  const query = search ? { name: { $regex: search, $options: "i" } } : {};

  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments(query);

  return {
    data: categories,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

exports.updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};