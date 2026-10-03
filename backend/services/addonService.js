const mongoose = require("mongoose");
const Addon = require("../models/Addon");

const MAX_QTY_PER_ADDON = 10;

/**
 * Re-prices the add-ons a customer picked from the database.
 * The client may send anything; name/price/image/category stored on the
 * order always come from the Addon collection.
 */
exports.resolveAddonsForOrder = async (inputs) => {
  if (!Array.isArray(inputs) || inputs.length === 0) return [];

  const resolved = new Map(); // addon _id → line (merges duplicates)

  for (const input of inputs) {
    if (!input || typeof input !== "object") continue;

    const id = input.addonId || input._id;
    let addon = null;
    if (id && mongoose.isValidObjectId(id)) addon = await Addon.findById(id).lean();
    if (!addon && input.name) addon = await Addon.findOne({ name: input.name }).lean();

    if (!addon || !addon.isActive) {
      const err = new Error(`The add-on "${input.name || "selected"}" is no longer available. Please remove it and try again.`);
      err.statusCode = 400;
      err.code = "ADDON_UNAVAILABLE";
      throw err;
    }

    const qty = Math.min(MAX_QTY_PER_ADDON, Math.max(1, parseInt(input.quantity, 10) || 1));
    const key = String(addon._id);
    const existing = resolved.get(key);
    if (existing) {
      existing.quantity = Math.min(MAX_QTY_PER_ADDON, existing.quantity + qty);
    } else {
      resolved.set(key, {
        addonId: addon._id,
        name: addon.name,
        price: Number(addon.price || 0),
        quantity: qty,
        image: addon.image || "",
        category: addon.category || "accessory",
      });
    }
  }

  return Array.from(resolved.values());
};
