const service = require("../services/occasionService");

exports.create = async (req, res) => {
  try {
    const data = await service.createOccasion(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, all } = req.query;

    if (all === "true") {
      const data = await service.getAllOccasionsList();
      return res.json(data);
    }

    const data = await service.getOccasions({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateOccasion(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await service.deleteOccasion(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
