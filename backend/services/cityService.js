const City = require("../models/City");

exports.createCity = async (data) => {
  return await City.create(data);
};

exports.getCities = async () => {
  return await City.find();
};

exports.updateCity = async (id, data) => {
  return await City.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCity = async (id) => {
  return await City.findByIdAndDelete(id);
};
