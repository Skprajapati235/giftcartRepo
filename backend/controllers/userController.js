const service = require("../services/userService");

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await service.getUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || ""
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await service.getAdmins({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || ""
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  const data = await service.updateUser(req.params.id, req.body);
  res.json(data);
};

exports.delete = async (req, res) => {
  await service.deleteUser(req.params.id);
  res.json({ message: "Deleted" });
};
