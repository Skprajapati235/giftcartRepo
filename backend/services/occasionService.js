const Occasion = require("../models/Occasion");

exports.createOccasion = async (data) => {
  return await Occasion.create(data);
};

exports.getOccasions = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;
  const query = search ? { name: { $regex: search, $options: "i" } } : {};

  const occasions = await Occasion.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Occasion.countDocuments(query);

  return {
    data: occasions,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

// Public — used by the website navbar dropdown + category filter. Only
// active occasions, lightest possible payload, alphabetical.
exports.getAllOccasionsList = async () => {
  return await Occasion.find({ isActive: true }).sort({ name: 1 });
};

exports.updateOccasion = async (id, data) => {
  return await Occasion.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteOccasion = async (id) => {
  return await Occasion.findByIdAndDelete(id);
};
