const Gallery = require("../models/Gallery");
const GallerySetting = require("../models/GallerySetting");
require("../models/Product");

const initialGallery = [
  {
    title: "Midnight Red Rose Cascade Bouquet",
    caption: "A 100-stem velvety Dutch red roses arrangement hand-tied for a 25th wedding anniversary in Mumbai.",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=900&auto=format&fit=crop",
    mediaType: "image",
    category: "Flowers",
    tags: ["#midnightdelivery", "#roses", "#anniversary"],
    likes: 142,
    order: 0,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Belgian Chocolate Truffle Celebration Cake",
    caption: "Handcrafted 3-tier dark chocolate celebration cake delivered chilled for a grand 50th birthday gala.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=900&auto=format&fit=crop",
    mediaType: "image",
    category: "Cakes",
    tags: ["#artisancakes", "#truffle", "#birthday"],
    likes: 98,
    order: 1,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Royal Velvet Gourmet Hamper Box",
    caption: "Custom gold-embossed velvet hampers containing imported artisan cheeses, gourmet cookies, and scented soy candles.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=900&auto=format&fit=crop",
    mediaType: "image",
    category: "Hampers",
    tags: ["#luxuryhamper", "#curatedgifts", "#festive"],
    likes: 215,
    order: 2,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Pastel Orchid & Carnation Table Arrangement",
    caption: "A breathtaking pastel pink floral centerpiece prepared for an intimate destination wedding reception.",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=900&auto=format&fit=crop",
    mediaType: "image",
    category: "Weddings",
    tags: ["#weddingdecor", "#orchids", "#centerpiece"],
    likes: 176,
    order: 3,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Corporate Diwali Welcome Gift Boxes",
    caption: "Eco-friendly wooden gift hampers with copper bottles, dry fruits, and personalized employee name cards.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=900&auto=format&fit=crop",
    mediaType: "image",
    category: "Corporate",
    tags: ["#corporategifting", "#bulkorder", "#diwali"],
    likes: 84,
    order: 4,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Surprise Room Decor with Helium Balloons",
    caption: "Romantic balloon canopy and fairy light arrangement setup for a milestone proposal celebration in Bengaluru.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=900&auto=format&fit=crop",
    mediaType: "image",
    category: "Celebrations",
    tags: ["#surprisedecor", "#balloons", "#proposal"],
    likes: 260,
    order: 5,
    isFeatured: true,
    isActive: true,
  },
];

// Automatically seed initial gallery if database collection is empty
const ensureInitialSeeded = async () => {
  try {
    const count = await Gallery.countDocuments();
    if (count === 0) {
      await Gallery.insertMany(initialGallery);
      console.log("✅ Seeded initial gallery items successfully.");
    }
  } catch (error) {
    console.error("Error seeding gallery:", error.message);
  }
};

exports.getPublicGallery = async ({ category = "", featuredOnly = false, limit = 20 } = {}) => {
  await ensureInitialSeeded();
  const query = { isActive: true };
  if (category && category !== "all") query.category = category;
  if (featuredOnly) query.isFeatured = true;

  const data = await Gallery.find(query)
    .sort({ order: 1, createdAt: -1 })
    .limit(Number(limit) || 20)
    .populate("linkedProduct", "name price image flowerCount category");

  return data;
};

exports.getCategories = async () => {
  await ensureInitialSeeded();
  const categories = await Gallery.distinct("category", { isActive: true });
  return categories.filter(Boolean);
};

exports.getGalleryItems = async ({
  page = 1,
  limit = 12,
  search = "",
  category = "",
  mediaType = "",
  isFeatured = "",
  isActive = "",
  all = false,
}) => {
  await ensureInitialSeeded();
  const query = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { caption: searchRegex },
      { category: searchRegex },
      { tags: searchRegex },
    ];
  }

  if (category && category !== "all") {
    query.category = category;
  }

  if (mediaType && mediaType !== "all") {
    query.mediaType = mediaType;
  }

  if (isFeatured !== "" && isFeatured !== "all") {
    query.isFeatured = isFeatured === "true" || isFeatured === true;
  }

  if (isActive !== "" && isActive !== "all") {
    query.isActive = isActive === "true" || isActive === true;
  }

  // Calculate live stats
  const [totalCount, activeCount, featuredCount, distinctCategories] = await Promise.all([
    Gallery.countDocuments(),
    Gallery.countDocuments({ isActive: true }),
    Gallery.countDocuments({ isFeatured: true }),
    Gallery.distinct("category"),
  ]);

  const stats = {
    total: totalCount,
    active: activeCount,
    featured: featuredCount,
    categoriesCount: distinctCategories.length,
  };

  if (all === "true" || all === true) {
    const data = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate("linkedProduct", "name price image");
    return { success: true, data, total: data.length, stats, categories: distinctCategories };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const skip = (pageNum - 1) * limitNum;

  const [data, totalFiltered] = await Promise.all([
    Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("linkedProduct", "name price image"),
    Gallery.countDocuments(query),
  ]);

  return {
    success: true,
    data,
    total: totalFiltered,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalFiltered / limitNum) || 1,
    stats,
    categories: distinctCategories,
  };
};

exports.getGalleryItemById = async (id) => {
  return Gallery.findById(id).populate("linkedProduct", "name price image");
};

exports.likeGalleryItem = async (id) => {
  return Gallery.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { returnDocument: "after", new: true }
  );
};

exports.createGalleryItem = async (data) => {
  let tags = [];
  if (Array.isArray(data.tags)) {
    tags = data.tags;
  } else if (typeof data.tags === "string") {
    tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }

  const item = new Gallery({
    title: data.title,
    caption: data.caption || "",
    image: data.image,
    mediaType: data.mediaType || "image",
    videoUrl: data.videoUrl || "",
    category: data.category || "Celebrations",
    tags,
    likes: data.likes ? Number(data.likes) : 0,
    order: data.order !== undefined ? Number(data.order) : 0,
    isFeatured: Boolean(data.isFeatured),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    linkedProduct: data.linkedProduct || null,
    date: data.date ? new Date(data.date) : new Date(),
  });

  return item.save();
};

exports.updateGalleryItem = async (id, data) => {
  const updateData = { ...data };
  if (typeof updateData.tags === "string") {
    updateData.tags = updateData.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (updateData.order !== undefined) updateData.order = Number(updateData.order);
  if (updateData.isActive !== undefined) updateData.isActive = Boolean(updateData.isActive);
  if (updateData.isFeatured !== undefined) updateData.isFeatured = Boolean(updateData.isFeatured);

  return Gallery.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    new: true,
    runValidators: true,
  });
};

exports.updateStatus = async (id, { isActive, isFeatured }) => {
  const updatePayload = {};
  if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);
  if (isFeatured !== undefined) updatePayload.isFeatured = Boolean(isFeatured);

  return Gallery.findByIdAndUpdate(id, updatePayload, {
    returnDocument: "after",
    new: true,
  });
};

exports.deleteGalleryItem = async (id) => {
  return Gallery.findByIdAndDelete(id);
};

exports.bulkDeleteGalleryItems = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return { deletedCount: 0 };
  return Gallery.deleteMany({ _id: { $in: ids } });
};

exports.reorderGalleryItems = async (items) => {
  if (!Array.isArray(items)) return [];
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { order: Number(item.order) || 0 } },
    },
  }));
  return Gallery.bulkWrite(bulkOps);
};

exports.getSettings = async () => {
  let settings = await GallerySetting.findOne({ key: "default_gallery_settings" });
  if (!settings) {
    settings = await GallerySetting.create({ key: "default_gallery_settings" });
  }
  return settings;
};

exports.updateSettings = async (data, adminId) => {
  const payload = { ...data };
  if (adminId) payload.updatedBy = adminId;
  return GallerySetting.findOneAndUpdate(
    { key: "default_gallery_settings" },
    payload,
    { upsert: true, returnDocument: "after", new: true }
  );
};

