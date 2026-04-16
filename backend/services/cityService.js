const City = require("../models/City");

exports.createCity = async (data) => {
  return await City.create(data);
};

exports.getCities = async (query = {}) => {
  const { page = 1, limit = 10, search = "" } = query;
  const skip = (page - 1) * limit;

  const searchQuery = search
    ? {
        $or: [
          { state: { $regex: search, $options: "i" } },
          { cities: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const cities = await City.find(searchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await City.countDocuments(searchQuery);

  return {
    data: cities,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

exports.updateCity = async (id, data) => {
  return await City.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCity = async (id) => {
  return await City.findByIdAndDelete(id);
};
