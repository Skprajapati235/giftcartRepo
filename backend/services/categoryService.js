const Category = require("../models/Category");

exports.createCategory = async (data) => {
  return await Category.create(data);
};

exports.getCategories = async () => {
  return await Category.find();
};

exports.updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};