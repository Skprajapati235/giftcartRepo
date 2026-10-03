// const Story = require("../models/Story");

// const DEFAULT_STORIES = [
//   {
//     title: "Midnight Cakes 🎂",
//     thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60",
//     mediaUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1080&auto=format&fit=crop&q=80",
//     mediaType: "image",
//     tag: "MIDNIGHT SURPRISE",
//     ctaText: "Order Midnight Cakes",
//     ctaLink: "/category/cakes",
//     isActive: true,
//     sortOrder: 1,
//   },
//   {
//     title: "Velvet Roses 🌹",
//     thumbnail: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&auto=format&fit=crop&q=60",
//     mediaUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1080&auto=format&fit=crop&q=80",
//     mediaType: "image",
//     tag: "FRESH BLOOMS",
//     ctaText: "Explore Fresh Bouquets",
//     ctaLink: "/category/flowers",
//     isActive: true,
//     sortOrder: 2,
//   },
//   {
//     title: "Gift Hampers 🎁",
//     thumbnail: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&auto=format&fit=crop&q=60",
//     mediaUrl: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1080&auto=format&fit=crop&q=80",
//     mediaType: "image",
//     tag: "CURATED FOR YOU",
//     ctaText: "View Luxury Hampers",
//     ctaLink: "/category/hampers",
//     isActive: true,
//     sortOrder: 3,
//   },
//   {
//     title: "Choco Decadence 🍫",
//     thumbnail: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=60",
//     mediaUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1080&auto=format&fit=crop&q=80",
//     mediaType: "image",
//     tag: "HANDCRAFTED",
//     ctaText: "Taste Artisan Chocolates",
//     ctaLink: "/category/chocolates",
//     isActive: true,
//     sortOrder: 4,
//   },
// ];

// // GET /api/stories - Public (auto-seeds defaults if empty)
// exports.getStories = async (req, res) => {
//   try {
//     let stories = await Story.find().populate("ctaCategory", "name slug").sort({ sortOrder: 1, createdAt: 1 });
//     if (!stories || stories.length === 0) {
//       await Story.insertMany(DEFAULT_STORIES);
//       stories = await Story.find().populate("ctaCategory", "name slug").sort({ sortOrder: 1, createdAt: 1 });
//     }
//     if (req.query.all !== "true") {
//       stories = stories.filter((s) => s.isActive);
//     }
//     res.json({ success: true, count: stories.length, data: stories });
//   } catch (error) {
//     console.error("Get Stories Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // POST /api/stories - Admin
// exports.createStory = async (req, res) => {
//   try {
//     const story = await Story.create({
//       ...req.body,
//       thumbnail: req.body.thumbnail || req.body.mediaUrl,
//       ctaCategory: req.body.ctaCategory || undefined,
//     });
//     res.status(201).json({ success: true, message: "Story created", data: story });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // PUT /api/stories/:id - Admin
// exports.updateStory = async (req, res) => {
//   try {
//     const updates = { ...req.body };
//     if (Object.prototype.hasOwnProperty.call(updates, "ctaCategory")) {
//       updates.ctaCategory = updates.ctaCategory || null;
//     }
//     if (!updates.thumbnail && updates.mediaUrl) {
//       updates.thumbnail = updates.mediaUrl;
//     }
//     const story = await Story.findByIdAndUpdate(req.params.id, updates, {
//       new: true,
//       runValidators: true,
//     });
//     if (!story) return res.status(404).json({ success: false, message: "Story not found" });
//     res.json({ success: true, message: "Story updated", data: story });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // DELETE /api/stories/:id - Admin
// exports.deleteStory = async (req, res) => {
//   try {
//     const story = await Story.findByIdAndDelete(req.params.id);
//     if (!story) return res.status(404).json({ success: false, message: "Story not found" });
//     res.json({ success: true, message: "Story deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



const Story = require("../models/Story");

// GET /api/stories - Public (auto-seeds defaults if empty)
exports.getStories = async (req, res) => {
  try {
    let stories = await Story.find().populate("ctaCategory", "name slug").sort({ sortOrder: 1, createdAt: 1 });
    if (req.query.all !== "true") {
      stories = stories.filter((s) => s.isActive);
    }
    res.json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    console.error("Get Stories Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/stories - Admin
exports.createStory = async (req, res) => {
  try {
    const story = await Story.create({
      ...req.body,
      thumbnail: req.body.thumbnail || req.body.mediaUrl,
      ctaCategory: req.body.ctaCategory || undefined,
    });
    res.status(201).json({ success: true, message: "Story created", data: story });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/stories/:id - Admin
exports.updateStory = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updates, "ctaCategory")) {
      updates.ctaCategory = updates.ctaCategory || null;
    }
    if (!updates.thumbnail && updates.mediaUrl) {
      updates.thumbnail = updates.mediaUrl;
    }
    const story = await Story.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    res.json({ success: true, message: "Story updated", data: story });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/stories/:id - Admin
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    res.json({ success: true, message: "Story deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
