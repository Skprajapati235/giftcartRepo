const service = require("../services/testimonialService");

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, platform, rating, isFeatured, isActive, all, publicOnly } = req.query;

    if (publicOnly === "true") {
      const data = await service.getPublicTestimonials({
        featuredOnly: isFeatured === "true",
        limit: limit ? parseInt(limit, 10) : 10,
      });
      return res.json({ success: true, data });
    }

    const result = await service.getTestimonials({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search || "",
      platform: platform || "",
      rating: rating || "",
      isFeatured: isFeatured || "",
      isActive: isActive || "",
      all: all === "true",
    });

    res.json(result);
  } catch (error) {
    console.error("Testimonial getAll error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const testimonial = await service.getTestimonialById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Testimonial message is required" });
    }

    const data = await service.createTestimonial(req.body);
    res.status(201).json({ success: true, data, message: "Testimonial created successfully" });
  } catch (error) {
    console.error("Testimonial create error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, message } = req.body;
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ success: false, message: "Customer name cannot be empty" });
    }
    if (message !== undefined && !message.trim()) {
      return res.status(400).json({ success: false, message: "Testimonial message cannot be empty" });
    }

    const data = await service.updateTestimonial(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, data, message: "Testimonial updated successfully" });
  } catch (error) {
    console.error("Testimonial update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { isActive, isFeatured } = req.body;
    const data = await service.updateStatus(req.params.id, { isActive, isFeatured });
    if (!data) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, data, message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await service.deleteTestimonial(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "IDs array is required" });
    }
    const result = await service.bulkDeleteTestimonials(ids);
    res.json({
      success: true,
      message: `${result.deletedCount || 0} testimonials deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items array is required" });
    }
    await service.reorderTestimonials(items);
    res.json({ success: true, message: "Testimonials reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
