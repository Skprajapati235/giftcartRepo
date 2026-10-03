// const DeliverySlot = require("../models/DeliverySlot");

// const DEFAULT_SLOTS = [
//   {
//     name: "Standard Delivery (Anytime between 9 AM - 9 PM)",
//     type: "standard",
//     startTime: "09:00",
//     endTime: "21:00",
//     timeRange: "09:00 AM - 09:00 PM",
//     extraCharge: 0,
//     cutoffTime: "",
//     badge: "Free Delivery",
//     maxOrdersPerDay: 100,
//     isActive: true,
//     sortOrder: 1,
//   },
//   {
//     name: "Fixed Time Slot Delivery (Selected 1-Hour Window)",
//     type: "fixed_time",
//     startTime: "14:00",
//     endTime: "15:00",
//     timeRange: "02:00 PM - 03:00 PM",
//     extraCharge: 49,
//     cutoffTime: "11:00",
//     badge: "Exact Time",
//     maxOrdersPerDay: 40,
//     isActive: true,
//     sortOrder: 2,
//   },
//   {
//     name: "Midnight Surprise Delivery (11:00 PM - 11:59 PM)",
//     type: "midnight",
//     startTime: "23:00",
//     endTime: "23:59",
//     timeRange: "11:00 PM - 11:59 PM",
//     extraCharge: 199,
//     cutoffTime: "20:00",
//     badge: "🌟 Most Loved for Birthdays",
//     maxOrdersPerDay: 30,
//     isActive: true,
//     sortOrder: 3,
//   },
//   {
//     name: "Early Morning Surprise (07:00 AM - 09:00 AM)",
//     type: "early_morning",
//     startTime: "07:00",
//     endTime: "09:00",
//     timeRange: "07:00 AM - 09:00 AM",
//     extraCharge: 99,
//     cutoffTime: "21:00",
//     badge: "Fresh Morning Flowers",
//     maxOrdersPerDay: 25,
//     isActive: true,
//     sortOrder: 4,
//   },
// ];

// // GET /api/delivery-slots - Public (auto-seeds defaults if empty)
// exports.getDeliverySlots = async (req, res) => {
//   try {
//     let slots = await DeliverySlot.find().sort({ sortOrder: 1, createdAt: 1 });
//     if (!slots || slots.length === 0) {
//       await DeliverySlot.insertMany(DEFAULT_SLOTS);
//       slots = await DeliverySlot.find().sort({ sortOrder: 1, createdAt: 1 });
//     }
//     // If client is public/mobile, return active only unless ?all=true
//     if (req.query.all !== "true") {
//       slots = slots.filter((s) => s.isActive);
//     }
//     res.json({ success: true, count: slots.length, data: slots });
//   } catch (error) {
//     console.error("Get Delivery Slots Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // POST /api/delivery-slots - Admin
// exports.createDeliverySlot = async (req, res) => {
//   try {
//     const slot = await DeliverySlot.create(req.body);
//     res.status(201).json({ success: true, message: "Delivery slot created", data: slot });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // PUT /api/delivery-slots/:id - Admin
// exports.updateDeliverySlot = async (req, res) => {
//   try {
//     const slot = await DeliverySlot.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
//     res.json({ success: true, message: "Delivery slot updated", data: slot });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // DELETE /api/delivery-slots/:id - Admin
// exports.deleteDeliverySlot = async (req, res) => {
//   try {
//     const slot = await DeliverySlot.findByIdAndDelete(req.params.id);
//     if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
//     res.json({ success: true, message: "Delivery slot deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



const DeliverySlot = require("../models/DeliverySlot");
const deliverySlotService = require("../services/deliverySlotService");
const rules = require("../utils/deliverySlotRules");

const SLOT_FIELDS = [
  "name",
  "type",
  "image",
  "startTime",
  "endTime",
  "timeRange",
  "extraCharge",
  "cutoffTime",
  "cutoffDaysBefore",
  "badge",
  "maxOrdersPerDay",
  "isActive",
  "sortOrder",
];

/**
 * Whitelists + validates the admin payload.
 * Returns { data } or { error }.
 */
function normalizeSlotPayload(body = {}, { partial = false } = {}) {
  const data = {};
  SLOT_FIELDS.forEach((f) => {
    if (body[f] !== undefined) data[f] = body[f];
  });

  if (!partial || data.name !== undefined) {
    if (!String(data.name || "").trim()) return { error: "Slot name is required." };
  }

  for (const f of ["startTime", "endTime"]) {
    if (data[f] !== undefined && data[f] !== "" && rules.parseHHmm(data[f]) === null) {
      return { error: `${f === "startTime" ? "Start" : "End"} time must be a valid HH:mm time.` };
    }
  }

  if (data.extraCharge !== undefined) {
    data.extraCharge = Number(data.extraCharge);
    if (!Number.isFinite(data.extraCharge) || data.extraCharge < 0) {
      return { error: "Surcharge must be 0 or more." };
    }
  }

  if (data.maxOrdersPerDay !== undefined) {
    data.maxOrdersPerDay = Number(data.maxOrdersPerDay);
    if (!Number.isFinite(data.maxOrdersPerDay) || data.maxOrdersPerDay < 0) {
      return { error: "Max orders per day must be 0 (unlimited) or more." };
    }
  }

  if (data.cutoffTime !== undefined) {
    data.cutoffTime = String(data.cutoffTime || "").trim();
    if (data.cutoffTime && !rules.parseCutoff({ cutoffTime: data.cutoffTime })) {
      return { error: "Cutoff must be a time like 20:00." };
    }
  }

  if (data.cutoffDaysBefore === "" || data.cutoffDaysBefore === null) {
    data.cutoffDaysBefore = undefined; // "use the default for this slot type"
  } else if (data.cutoffDaysBefore !== undefined) {
    data.cutoffDaysBefore = Number(data.cutoffDaysBefore);
    if (!Number.isInteger(data.cutoffDaysBefore) || data.cutoffDaysBefore < 0 || data.cutoffDaysBefore > 7) {
      return { error: "Cutoff day must be between 0 and 7 days before." };
    }
  }

  // Customer-facing label is generated from the window when left blank
  if (!partial && !String(data.timeRange || "").trim()) {
    const s = rules.parseHHmm(data.startTime ?? "09:00");
    const e = rules.parseHHmm(data.endTime ?? "21:00");
    if (s !== null && e !== null) data.timeRange = `${rules.format12h(s)} - ${rules.format12h(e)}`;
  }
  if (!partial && !String(data.timeRange || "").trim()) return { error: "Time range label is required." };

  return { data };
}

// GET /api/delivery-slots - Public: active slots (all slots with ?all=true, for the admin panel).
// Nothing is auto-created: slots exist only when the admin adds them.
exports.getDeliverySlots = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const slots = await DeliverySlot.find(filter).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    console.error("Get Delivery Slots Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/delivery-slots/availability?date=YYYY-MM-DD - Public
// Server-side (IST) truth: which dates are bookable and which slots are open
// on the chosen date, with cutoff / sold-out reasons.
exports.getAvailability = async (req, res) => {
  try {
    const requested = typeof req.query.date === "string" ? req.query.date : undefined;
    const data = await deliverySlotService.getAvailability(
      requested && rules.isValidDateStr(requested) ? requested : undefined
    );
    res.set("Cache-Control", "no-store");
    res.json({ success: true, data });
  } catch (error) {
    console.error("Get Slot Availability Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/delivery-slots - Admin
exports.createDeliverySlot = async (req, res) => {
  try {
    const { data, error } = normalizeSlotPayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    const slot = await DeliverySlot.create(data);
    res.status(201).json({ success: true, message: "Delivery slot created", data: slot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/delivery-slots/:id - Admin
exports.updateDeliverySlot = async (req, res) => {
  try {
    const { data, error } = normalizeSlotPayload(req.body, { partial: true });
    if (error) return res.status(400).json({ success: false, message: error });

    // `undefined` for cutoffDaysBefore means "clear it" → use $unset
    const update = { ...data };
    const unset = {};
    if ("cutoffDaysBefore" in update && update.cutoffDaysBefore === undefined) {
      delete update.cutoffDaysBefore;
      unset.cutoffDaysBefore = 1;
    }

    const slot = await DeliverySlot.findByIdAndUpdate(
      req.params.id,
      { $set: update, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { new: true, runValidators: true }
    );
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
