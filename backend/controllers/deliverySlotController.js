const DeliverySlot = require("../models/DeliverySlot");

const DEFAULT_SLOTS = [
  {
    name: "Standard Delivery (Anytime between 9 AM - 9 PM)",
    type: "standard",
    startTime: "09:00",
    endTime: "21:00",
    timeRange: "09:00 AM - 09:00 PM",
    extraCharge: 0,
    cutoffTime: "",
    badge: "Free Delivery",
    maxOrdersPerDay: 100,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Fixed Time Slot Delivery (Selected 1-Hour Window)",
    type: "fixed_time",
    startTime: "14:00",
    endTime: "15:00",
    timeRange: "02:00 PM - 03:00 PM",
    extraCharge: 49,
    cutoffTime: "11:00",
    badge: "Exact Time",
    maxOrdersPerDay: 40,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Midnight Surprise Delivery (11:00 PM - 11:59 PM)",
    type: "midnight",
    startTime: "23:00",
    endTime: "23:59",
    timeRange: "11:00 PM - 11:59 PM",
    extraCharge: 199,
    cutoffTime: "20:00",
    badge: "🌟 Most Loved for Birthdays",
    maxOrdersPerDay: 30,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Early Morning Surprise (07:00 AM - 09:00 AM)",
    type: "early_morning",
    startTime: "07:00",
    endTime: "09:00",
    timeRange: "07:00 AM - 09:00 AM",
    extraCharge: 99,
    cutoffTime: "21:00",
    badge: "Fresh Morning Flowers",
    maxOrdersPerDay: 25,
    isActive: true,
    sortOrder: 4,
  },
];

// GET /api/delivery-slots - Public (auto-seeds defaults if empty)
exports.getDeliverySlots = async (req, res) => {
  try {
    let slots = await DeliverySlot.find().sort({ sortOrder: 1, createdAt: 1 });
    if (!slots || slots.length === 0) {
      await DeliverySlot.insertMany(DEFAULT_SLOTS);
      slots = await DeliverySlot.find().sort({ sortOrder: 1, createdAt: 1 });
    }
    // If client is public/mobile, return active only unless ?all=true
    if (req.query.all !== "true") {
      slots = slots.filter((s) => s.isActive);
    }
    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    console.error("Get Delivery Slots Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/delivery-slots - Admin
exports.createDeliverySlot = async (req, res) => {
  try {
    const slot = await DeliverySlot.create(req.body);
    res.status(201).json({ success: true, message: "Delivery slot created", data: slot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/delivery-slots/:id - Admin
exports.updateDeliverySlot = async (req, res) => {
  try {
    const slot = await DeliverySlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
    res.json({ success: true, message: "Delivery slot updated", data: slot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/delivery-slots/:id - Admin
exports.deleteDeliverySlot = async (req, res) => {
  try {
    const slot = await DeliverySlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
    res.json({ success: true, message: "Delivery slot deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
