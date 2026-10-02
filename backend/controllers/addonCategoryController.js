const Addon = require("../models/Addon");
const AddonCategory = require("../models/AddonCategory");

const LEGACY_CATEGORY_NAMES = {
  candle: "Candles",
  card: "Greeting Cards",
  chocolate: "Chocolates",
  balloon: "Balloons",
  popper: "Party Poppers",
  teddy: "Teddy Bears",
  accessory: "Accessories",
};

const toSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

exports.getAll = async (req, res) => {
  try {
    if (!(await AddonCategory.exists({}))) {
      const legacySlugs = (await Addon.distinct("category")).filter(Boolean);
      if (legacySlugs.length > 0) {
        await AddonCategory.insertMany(
          legacySlugs.map((slug) => ({
            slug,
            name: LEGACY_CATEGORY_NAMES[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
          })),
          { ordered: false }
        );
      }
    }
    const categories = await AddonCategory.find().sort({ name: 1 }).lean();
    const counts = await Addon.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countBySlug = new Map(counts.map(({ _id, count }) => [_id, count]));
    res.json({
      success: true,
      data: categories.map((category) => ({
        ...category,
        addonCount: countBySlug.get(category.slug) || 0,
      })),
    });
  } catch (error) {
    console.error("Get Add-on Categories Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const slug = toSlug(name);
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    if (slug === "all") {
      return res.status(400).json({ success: false, message: "The name All is reserved for the combined category filter" });
    }
    const category = await AddonCategory.create({ name, slug });
    res.status(201).json({ success: true, data: { ...category.toObject(), addonCount: 0 } });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 400;
    res.status(status).json({
      success: false,
      message: error.code === 11000 ? "An add-on category with this name already exists" : error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    const category = await AddonCategory.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: "Add-on category not found" });
    }
    const addonCount = await Addon.countDocuments({ category: category.slug });
    res.json({ success: true, data: { ...category.toObject(), addonCount } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const category = await AddonCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Add-on category not found" });
    }
    const addonCount = await Addon.countDocuments({ category: category.slug });
    if (addonCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Move or delete the ${addonCount} add-on item(s) in this category before deleting it`,
      });
    }
    await category.deleteOne();
    res.json({ success: true, message: "Add-on category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
