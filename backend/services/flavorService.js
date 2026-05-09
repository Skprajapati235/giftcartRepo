const Flavor = require("../models/Flavor");

exports.createFlavor = async (data) => {
  return await Flavor.create(data);
};

exports.getFlavors = async ({ page = 1, limit = 10, search = "" }) => {
  const query = search ? { name: { $regex: search, $options: "i" } } : {};
  const total = await Flavor.countDocuments(query);
  const flavors = await Flavor.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: flavors,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};

exports.updateFlavor = async (id, data) => {
  return await Flavor.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteFlavor = async (id) => {
  return await Flavor.findByIdAndDelete(id);
};

exports.getAllFlavorsList = async () => {
    return await Flavor.find().sort({ name: 1 });
};
