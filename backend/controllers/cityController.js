const service = require("../services/cityService");

exports.create = async (req, res) => {
  const data = await service.createCity(req.body);
  res.json(data);
};

exports.getAll = async (req, res) => {
  const data = await service.getCities(req.query);
  res.json(data);
};

exports.update = async (req, res) => {
  const data = await service.updateCity(req.params.id, req.body);
  res.json(data);
};

exports.delete = async (req, res) => {
  await service.deleteCity(req.params.id);
  res.json({ message: "Deleted" });
};
