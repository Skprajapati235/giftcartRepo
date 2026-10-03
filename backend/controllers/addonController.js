// const Addon = require("../models/Addon");

// const DEFAULT_ADDONS = [
//   {
//     name: "Golden Birthday Candles (Pack of 10)",
//     category: "candle",
//     price: 49,
//     image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop&q=60",
//     description: "Elegant metallic spiral golden candles for birthday cakes.",
//     isPopular: true,
//     isActive: true,
//     sortOrder: 1,
//   },
//   {
//     name: "Handcrafted Greeting Card with Envelope",
//     category: "card",
//     price: 39,
//     image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60",
//     description: "Premium textured card with your personalized handwritten wish.",
//     isPopular: true,
//     isActive: true,
//     sortOrder: 2,
//   },
//   {
//     name: "Celebration Confetti Party Popper",
//     category: "popper",
//     price: 89,
//     image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=60",
//     description: "Exciting metallic paper confetti explosion for midnight cake cutting!",
//     isPopular: true,
//     isActive: true,
//     sortOrder: 3,
//   },
//   {
//     name: "Ferrero Rocher Hazelnut Chocolates (4 Pcs)",
//     category: "chocolate",
//     price: 199,
//     image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=60",
//     description: "Crispy hazelnut and milk chocolate pralines.",
//     isPopular: true,
//     isActive: true,
//     sortOrder: 4,
//   },
//   {
//     name: "Mini Cuddly Plush Teddy Bear (6 Inch)",
//     category: "teddy",
//     price: 249,
//     image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=500&auto=format&fit=crop&q=60",
//     description: "Super soft and lovable small brown teddy bear.",
//     isPopular: false,
//     isActive: true,
//     sortOrder: 5,
//   },
//   {
//     name: "Heart-Shaped Metallic Helium Foil Balloon",
//     category: "balloon",
//     price: 99,
//     image: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=500&auto=format&fit=crop&q=60",
//     description: "Glossy red heart balloon to elevate your romantic surprise.",
//     isPopular: false,
//     isActive: true,
//     sortOrder: 6,
//   },
// ];

// // GET /api/addons - Public (auto-seeds defaults if empty)
// exports.getAddons = async (req, res) => {
//   try {
//     let addons = await Addon.find().sort({ sortOrder: 1, createdAt: 1 });
//     if (!addons || addons.length === 0) {
//       await Addon.insertMany(DEFAULT_ADDONS);
//       addons = await Addon.find().sort({ sortOrder: 1, createdAt: 1 });
//     }
//     if (req.query.all !== "true") {
//       addons = addons.filter((a) => a.isActive);
//     }
//     res.json({ success: true, count: addons.length, data: addons });
//   } catch (error) {
//     console.error("Get Addons Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // POST /api/addons - Admin
// exports.createAddon = async (req, res) => {
//   try {
//     const addon = await Addon.create(req.body);
//     res.status(201).json({ success: true, message: "Add-on created", data: addon });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // PUT /api/addons/:id - Admin
// exports.updateAddon = async (req, res) => {
//   try {
//     const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!addon) return res.status(404).json({ success: false, message: "Add-on not found" });
//     res.json({ success: true, message: "Add-on updated", data: addon });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // DELETE /api/addons/:id - Admin
// exports.deleteAddon = async (req, res) => {
//   try {
//     const addon = await Addon.findByIdAndDelete(req.params.id);
//     if (!addon) return res.status(404).json({ success: false, message: "Add-on not found" });
//     res.json({ success: true, message: "Add-on deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



const Addon = require("../models/Addon");

// GET /api/addons - Public (active only unless ?all=true). No auto-seeded data: admin creates add-ons.
exports.getAddons = async (req, res) => {
  try {
    let addons = await Addon.find().sort({ sortOrder: 1, createdAt: 1 });
    if (req.query.all !== "true") {
      addons = addons.filter((a) => a.isActive);
    }
    res.json({ success: true, count: addons.length, data: addons });
  } catch (error) {
    console.error("Get Addons Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/addons - Admin
exports.createAddon = async (req, res) => {
  try {
    const addon = await Addon.create(req.body);
    res.status(201).json({ success: true, message: "Add-on created", data: addon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/addons/:id - Admin
exports.updateAddon = async (req, res) => {
  try {
    const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!addon) return res.status(404).json({ success: false, message: "Add-on not found" });
    res.json({ success: true, message: "Add-on updated", data: addon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/addons/:id - Admin
exports.deleteAddon = async (req, res) => {
  try {
    const addon = await Addon.findByIdAndDelete(req.params.id);
    if (!addon) return res.status(404).json({ success: false, message: "Add-on not found" });
    res.json({ success: true, message: "Add-on deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
