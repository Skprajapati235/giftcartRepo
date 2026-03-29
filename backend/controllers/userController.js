const service = require("../services/userService");

exports.getAll = async (req, res) => {
  const data = await service.getUsers();
  res.json(data);
};

exports.getAdmins = async (req, res) => {
  const data = await service.getAdmins();
  res.json(data);
};

exports.update = async (req, res) => {
  const data = await service.updateUser(req.params.id, req.body);
  res.json(data);
};

exports.delete = async (req, res) => {
  await service.deleteUser(req.params.id);
  res.json({ message: "Deleted" });
};
