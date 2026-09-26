const service = require("../services/heroSlideService");

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, all } = req.query;

    // If query has no pagination/search/all flag or explicit public request, return active slides
    if (!page && !limit && !search && all !== "true") {
      const data = await service.getPublicSlides();
      return res.json({ success: true, data });
    }

    if (all === "true") {
      const data = await service.getAllHeroSlidesList();
      return res.json({ success: true, data });
    }

    const data = await service.getHeroSlides({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      search: search || "",
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body.title || (!req.body.image && !req.body.img)) {
      return res.status(400).json({ success: false, message: "Title and Image are required" });
    }
    const data = await service.createHeroSlide(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateHeroSlide(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Hero slide not found" });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteHeroSlide(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Hero slide not found" });
    }
    res.json({ success: true, message: "Hero slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
