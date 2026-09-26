const HeroSlide = require("../models/HeroSlide");

const initialSlides = [
  {
    tag: "Fresh Blooms",
    title: "Flowers Worth\nEvery Celebration",
    desc: "Hand-tied bouquets delivered within hours, farm to doorstep.",
    cta: "Shop Flowers",
    categoryMatch: "flower",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=85&w=1000&auto=format&fit=crop",
    order: 0,
    isActive: true,
  },
  {
    tag: "Artisan Cakes",
    title: "Cakes Baked For\nSpecial Milestones",
    desc: "Freshly baked, delivered chilled and celebration-ready.",
    cta: "Shop Cakes",
    categoryMatch: "cake",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=85&w=1000&auto=format&fit=crop",
    order: 1,
    isActive: true,
  },
  {
    tag: "Curated Hampers",
    title: "Gifts That Make\nMemories Last",
    desc: "Curated gift boxes for every relationship and festive moment.",
    cta: "Shop Gifts",
    categoryMatch: "gift",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=85&w=1000&auto=format&fit=crop",
    order: 2,
    isActive: true,
  },
];

// Automatically seeds the database if no slides exist yet
const ensureInitialSeeded = async () => {
  try {
    const count = await HeroSlide.countDocuments();
    if (count === 0) {
      await HeroSlide.insertMany(initialSlides);
      console.log("✅ Seeded initial hero slides successfully.");
    }
  } catch (error) {
    console.error("Error seeding hero slides:", error.message);
  }
};

exports.getPublicSlides = async () => {
  await ensureInitialSeeded();
  return HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
};

exports.getHeroSlides = async ({ page = 1, limit = 10, search = "" }) => {
  await ensureInitialSeeded();
  const query = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { tag: searchRegex },
      { desc: searchRegex },
      { cta: searchRegex },
      { categoryMatch: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    HeroSlide.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
    HeroSlide.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

exports.getAllHeroSlidesList = async () => {
  await ensureInitialSeeded();
  return HeroSlide.find().sort({ order: 1, createdAt: -1 });
};

exports.createHeroSlide = async (data) => {
  const slide = new HeroSlide({
    tag: data.tag || "",
    title: data.title,
    desc: data.desc || "",
    cta: data.cta || "Shop Now",
    categoryMatch: data.categoryMatch || "",
    image: data.image || data.img,
    order: Number.isInteger(Number(data.order)) ? Number(data.order) : 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  });
  return slide.save();
};

exports.updateHeroSlide = async (id, data) => {
  const payload = { ...data };
  if (payload.img && !payload.image) {
    payload.image = payload.img;
  }
  if (payload.order !== undefined) {
    payload.order = Number(payload.order);
  }
  return HeroSlide.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

exports.deleteHeroSlide = async (id) => {
  return HeroSlide.findByIdAndDelete(id);
};
