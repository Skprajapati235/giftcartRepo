// PATH: backend/services/stockService.js
//
// Stock reservation for orders — OFF by default.
//
//   ENFORCE_STOCK=true  → stock is deducted atomically when an order is placed,
//                         the order is rejected (409 STOCK_UNAVAILABLE) if there
//                         isn't enough, and stock is given back when the order
//                         is cancelled / the payment fails.
//   ENFORCE_STOCK unset → this module does nothing (current behaviour), so
//                         products whose stock was never filled in (default 0)
//                         keep selling.
//
// Turn it on only AFTER you have entered real stock numbers in Admin → Inventory.

const Order = require("../models/Order");
const Product = require("../models/Product");
const { findVariantTarget, httpError } = require("./orderPricingService");

const isEnabled = () => String(process.env.ENFORCE_STOCK || "").toLowerCase() === "true";

function buildFilterAndUpdate(target, qty, { reserve }) {
  const delta = reserve ? -qty : qty;
  if (target.type === "weight") {
    return {
      filter: reserve
        ? { weightOptions: { $elemMatch: { _id: target.optionId, stock: { $gte: qty } } } }
        : { "weightOptions._id": target.optionId },
      update: { $inc: { "weightOptions.$.stock": delta } },
    };
  }
  if (target.type === "flowerCount") {
    return {
      filter: reserve
        ? { flowerCountOptions: { $elemMatch: { _id: target.optionId, stock: { $gte: qty } } } }
        : { "flowerCountOptions._id": target.optionId },
      update: { $inc: { "flowerCountOptions.$.stock": delta } },
    };
  }
  return {
    filter: reserve ? { stock: { $gte: qty } } : {},
    update: { $inc: { stock: delta } },
  };
}

async function applyLine(line, product, { reserve }) {
  const target = findVariantTarget(product, { weight: line.weight, flowerCount: line.flowerCount });
  const { filter, update } = buildFilterAndUpdate(target, line.quantity, { reserve });
  const res = await Product.updateOne({ _id: product._id, ...filter }, update);
  return res.modifiedCount === 1;
}

/**
 * Atomically deducts stock for every line. All-or-nothing: if one line is
 * short, lines already deducted are given back and a 409 is thrown.
 */
async function reserveForOrder(order) {
  if (!isEnabled()) return { skipped: true };

  const done = [];
  try {
    for (const line of order.items) {
      if (!line.product) continue;
      const product = await Product.findById(line.product).select("name weightOptions flowerCountOptions");
      if (!product) continue;

      const ok = await applyLine(line, product, { reserve: true });
      if (!ok) {
        throw httpError(`"${product.name}" is out of stock or has less stock than requested.`, 409, "STOCK_UNAVAILABLE");
      }
      done.push({ line, product });
    }
  } catch (err) {
    for (const { line, product } of done) {
      await applyLine(line, product, { reserve: false }).catch(() => {});
    }
    throw err;
  }

  await Order.updateOne({ _id: order._id }, { $set: { stockAdjusted: true } });
  return { reserved: true };
}

/**
 * Gives stock back once (idempotent via the stockAdjusted flag), used on
 * cancel / failed payment / backed-out payment.
 */
async function releaseForOrder(orderId) {
  if (!isEnabled() || !orderId) return false;

  // Atomically "claim" the release so two callers can't both restore stock.
  const order = await Order.findOneAndUpdate(
    { _id: orderId, stockAdjusted: true },
    { $set: { stockAdjusted: false } },
    { new: true }
  );
  if (!order) return false;

  for (const line of order.items) {
    if (!line.product) continue;
    const product = await Product.findById(line.product).select("weightOptions flowerCountOptions");
    if (!product) continue;
    await applyLine(line, product, { reserve: false }).catch((e) =>
      console.warn("[stock] release failed:", e?.message || e)
    );
  }
  return true;
}

module.exports = { reserveForOrder, releaseForOrder, isEnabled };
