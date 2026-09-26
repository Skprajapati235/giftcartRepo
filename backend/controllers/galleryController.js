const service = require("../services/galleryService");

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, category, mediaType, isFeatured, isActive, all, publicOnly } = req.query;

    if (publicOnly === "true") {
      const data = await service.getPublicGallery({
        category: category || "",
        featuredOnly: isFeatured === "true",
        limit: limit ? parseInt(limit, 10) : 20,
      });
      return res.json({ success: true, data });
    }

    const result = await service.getGalleryItems({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      search: search || "",
      category: category || "",
      mediaType: mediaType || "",
      isFeatured: isFeatured || "",
      isActive: isActive || "",
      all: all === "true",
    });

    res.json(result);
  } catch (error) {
    console.error("Gallery getAll error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await service.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await service.getGalleryItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.like = async (req, res) => {
  try {
    const item = await service.likeGalleryItem(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }
    res.json({ success: true, data: item, message: "Gallery item liked" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, image } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const data = await service.createGalleryItem(req.body);
    res.status(201).json({ success: true, data, message: "Gallery item created successfully" });
  } catch (error) {
    console.error("Gallery create error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, image } = req.body;
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ success: false, message: "Title cannot be empty" });
    }
    if (image !== undefined && !image.trim()) {
      return res.status(400).json({ success: false, message: "Image cannot be empty" });
    }

    const data = await service.updateGalleryItem(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }
    res.json({ success: true, data, message: "Gallery item updated successfully" });
  } catch (error) {
    console.error("Gallery update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { isActive, isFeatured } = req.body;
    const data = await service.updateStatus(req.params.id, { isActive, isFeatured });
    if (!data) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }
    res.json({ success: true, data, message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await service.deleteGalleryItem(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }
    res.json({ success: true, message: "Gallery item deleted successfully" });
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
    const result = await service.bulkDeleteGalleryItems(ids);
    res.json({
      success: true,
      message: `${result.deletedCount || 0} gallery items deleted successfully`,
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
    await service.reorderGalleryItems(items);
    res.json({ success: true, message: "Gallery items reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await service.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const adminId = req.user?.id || null;
    const settings = await service.updateSettings(req.body, adminId);
    res.json({
      success: true,
      data: settings,
      message: "Gallery layout settings updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

