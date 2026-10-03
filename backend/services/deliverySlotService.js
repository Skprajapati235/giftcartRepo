/**
 * Delivery slot availability + order-time validation.
 *
 * - getAvailability()      → what the website / apps render (dates + slots)
 * - resolveSlotForOrder()  → the ONLY place an order's slot is trusted:
 *                            looked up in the DB, re-checked against the
 *                            rules, surcharge taken from the DB (never from
 *                            the client).
 * - enforceCapacity()      → race-safe guard run right after an order is saved.
 */
const mongoose = require("mongoose");
const DeliverySlot = require("../models/DeliverySlot");
const Order = require("../models/Order");
const rules = require("../utils/deliverySlotRules");

// How many days ahead a customer may schedule delivery (configurable).
const MAX_ADVANCE_DAYS = Math.min(
  90,
  Math.max(1, parseInt(process.env.DELIVERY_MAX_ADVANCE_DAYS, 10) || 15)
);

// Orders in these payment states no longer hold a slot.
const RELEASED_PAYMENT_STATES = ["Failed", "Cancelled", "Abandoned", "Incomplete"];

const holdsSlotFilter = {
  status: { $ne: "Cancelled" },
  paymentStatus: { $nin: RELEASED_PAYMENT_STATES },
};

function httpError(statusCode, message, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (code) err.code = code;
  return err;
}

/** Map of "slotId|date" → number of orders holding that slot. */
async function getBookedCounts(fromDate, toDate) {
  const rows = await Order.aggregate([
    {
      $match: {
        ...holdsSlotFilter,
        "deliverySlot.slotId": { $ne: null },
        "deliverySlot.deliveryDate": { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: { slot: "$deliverySlot.slotId", date: "$deliverySlot.deliveryDate" },
        count: { $sum: 1 },
      },
    },
  ]);
  const map = new Map();
  rows.forEach((r) => map.set(`${r._id.slot}|${r._id.date}`, r.count));
  return map;
}

const publicSlot = (slot) => ({
  _id: slot._id,
  name: slot.name,
  type: slot.type,
  image: slot.image || "",
  startTime: slot.startTime,
  endTime: slot.endTime,
  timeRange: slot.timeRange,
  extraCharge: Number(slot.extraCharge || 0),
  badge: slot.badge || "",
  sortOrder: slot.sortOrder || 0,
});

/**
 * GET /api/delivery-slots/availability?date=YYYY-MM-DD
 *
 * `dates`   – every bookable date with how many slots are open that day
 * `slots`   – each active slot evaluated for `selectedDate`
 * `selectedDate` – the requested date, or the first date with an open slot
 */
exports.getAvailability = async (requestedDate) => {
  const now = rules.getISTNow();
  const dateList = rules.buildDateRange(now, MAX_ADVANCE_DAYS);

  const slots = await DeliverySlot.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  const counts = slots.length ? await getBookedCounts(dateList[0], dateList[dateList.length - 1]) : new Map();

  const evaluate = (slot, date) =>
    rules.evaluateSlot(slot, date, now, counts.get(`${slot._id}|${date}`) || 0);

  const dates = dateList.map((date) => ({
    date,
    availableCount: slots.filter((s) => evaluate(s, date).available).length,
  }));

  let selectedDate = dateList[0];
  if (requestedDate && dateList.includes(requestedDate)) {
    selectedDate = requestedDate;
  } else {
    const firstOpen = dates.find((d) => d.availableCount > 0);
    if (firstOpen) selectedDate = firstOpen.date;
  }

  const slotRows = slots.map((slot) => {
    const result = evaluate(slot, selectedDate);
    let nextAvailableDate = null;
    if (!result.available) {
      const next = dateList.find((d) => d > selectedDate && evaluate(slot, d).available);
      nextAvailableDate = next || null;
    }
    return {
      ...publicSlot(slot),
      available: result.available,
      unavailableCode: result.code,
      unavailableReason: result.reason,
      cutoffText: result.cutoffText,
      remaining: result.remaining,
      nextAvailableDate,
    };
  });

  return {
    serverNow: {
      date: now.dateStr,
      time: `${String(Math.floor(now.minutes / 60)).padStart(2, "0")}:${String(now.minutes % 60).padStart(2, "0")}`,
    },
    today: now.dateStr,
    maxAdvanceDays: MAX_ADVANCE_DAYS,
    selectedDate,
    dates,
    slots: slotRows,
  };
};

/**
 * Validates the slot a customer picked and returns the trusted version to
 * store on the order. Throws a 400 with code SLOT_UNAVAILABLE when the slot
 * can no longer be booked (cutoff passed, sold out, deactivated, bad date).
 *
 * Returns null when the customer picked no slot (older clients / stores that
 * have no slots configured) — the order then simply has no slot surcharge.
 */
exports.resolveSlotForOrder = async (input) => {
  if (!input || typeof input !== "object") return null;

  const id = input.slotId || input._id;
  const name = input.slotName || input.name;
  if (!id && !name) return null;

  let slot = null;
  if (id && mongoose.isValidObjectId(id)) slot = await DeliverySlot.findById(id).lean();
  if (!slot && name) slot = await DeliverySlot.findOne({ name }).lean();

  if (!slot || !slot.isActive) {
    throw httpError(400, "This delivery slot is no longer available. Please choose another slot.", "SLOT_UNAVAILABLE");
  }

  const now = rules.getISTNow();
  const dateList = rules.buildDateRange(now, MAX_ADVANCE_DAYS);

  let date = input.deliveryDate;
  if (date !== undefined && date !== null && date !== "") {
    if (!rules.isValidDateStr(date)) {
      throw httpError(400, "Invalid delivery date.", "INVALID_DELIVERY_DATE");
    }
    if (!dateList.includes(date)) {
      throw httpError(
        400,
        `Delivery can be scheduled up to ${MAX_ADVANCE_DAYS} days ahead.`,
        "INVALID_DELIVERY_DATE"
      );
    }
  } else {
    date = null; // legacy client without a date → earliest bookable date below
  }

  const counts = await getBookedCounts(dateList[0], dateList[dateList.length - 1]);
  const check = (d) => rules.evaluateSlot(slot, d, now, counts.get(`${slot._id}|${d}`) || 0);

  if (!date) {
    date = dateList.find((d) => check(d).available);
    if (!date) {
      throw httpError(400, `"${slot.name}" is fully booked right now. Please choose another slot.`, "SLOT_UNAVAILABLE");
    }
  }

  const result = check(date);
  if (!result.available) {
    const detail = result.cutoffText ? ` (${result.cutoffText.replace(/^Book/, "Booking cutoff:")})` : "";
    throw httpError(
      400,
      `"${slot.name}" can't be booked for ${rules.formatDateShort(date)}: ${result.reason.toLowerCase()}.${
        result.code === "CUTOFF_PASSED" ? detail : ""
      } Please pick another slot or date.`,
      "SLOT_UNAVAILABLE"
    );
  }

  return {
    slotId: slot._id,
    slotName: slot.name,
    slotType: slot.type,
    timeRange: slot.timeRange,
    extraCharge: Number(slot.extraCharge || 0), // always from the DB
    deliveryDate: date,
  };
};

/**
 * Two customers can pass the availability check at the same instant. After
 * saving, whoever is beyond the capacity (by creation order) is rolled back.
 */
exports.enforceCapacity = async (order) => {
  const slotId = order?.deliverySlot?.slotId;
  const date = order?.deliverySlot?.deliveryDate;
  if (!slotId || !date) return;

  const slot = await DeliverySlot.findById(slotId).lean();
  const max = Number(slot?.maxOrdersPerDay) > 0 ? Number(slot.maxOrdersPerDay) : 0;
  if (!max) return;

  const earlier = await Order.countDocuments({
    ...holdsSlotFilter,
    "deliverySlot.slotId": slotId,
    "deliverySlot.deliveryDate": date,
    _id: { $lt: order._id },
  });

  if (earlier >= max) {
    await Order.deleteOne({ _id: order._id });
    throw httpError(
      409,
      `"${slot.name}" just got fully booked for ${rules.formatDateShort(date)}. Please choose another slot.`,
      "SLOT_UNAVAILABLE"
    );
  }
};

exports.MAX_ADVANCE_DAYS = MAX_ADVANCE_DAYS;
