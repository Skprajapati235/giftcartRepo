// PATH: backend/services/orderPricingService.js
//
// SERVER-SIDE ORDER PRICING (anti price-tampering).
//
// The client (website / mobile) only tells us WHICH product, WHICH variant and
// HOW MANY. Every rupee figure — price, sale price, discount, tax, shipping —
// is re-read from the Product collection here, exactly the same way the cart
// does it (utils/priceCalculator.resolveVariantPricing). Anything priced by
// the client is ignored.

const mongoose = require("mongoose");
const Product = require("../models/Product");
const { calculateItemPricing, resolveVariantPricing } = require("../utils/priceCalculator");

const MAX_LINES = Number(process.env.MAX_ORDER_LINES) || 50;
const MAX_QTY_PER_LINE = Number(process.env.MAX_QTY_PER_LINE) || 50;

function httpError(message, statusCode = 400, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (code) err.code = code;
  return err;
}

const cleanText = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// Allow http(s) URLs, relative upload paths, or data URLs for the "custom image" a customer attaches.
const cleanUrl = (value) => {
  const v = cleanText(value, 1000);
  return /^(https?:\/\/|\/uploads\/|data:image\/)/i.test(v) ? v : "";
};

/**
 * Finds which variant option (weight / flower count) a line refers to.
 * Returns { type: "weight" | "flowerCount" | "root", optionId? } — also used by
 * stockService so stock is deducted from the SAME place the price came from.
 */
function findVariantTarget(product, { weight, flowerCount } = {}) {
  if (weight && Array.isArray(product.weightOptions) && product.weightOptions.length > 0) {
    const match = product.weightOptions.find((opt) => opt.weight === weight);
    if (match) return { type: "weight", optionId: match._id };
  }
  if (flowerCount && Array.isArray(product.flowerCountOptions) && product.flowerCountOptions.length > 0) {
    const match = product.flowerCountOptions.find((opt) => opt.flowerCount === flowerCount);
    if (match) return { type: "flowerCount", optionId: match._id };
  }
  return { type: "root" };
}

/**
 * @param {Array} rawItems  cart lines sent by the client
 * @returns {Promise<Array>} order lines whose money fields come ONLY from the DB
 */
async function priceOrderItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw httpError("Your cart is empty.", 400, "EMPTY_CART");
  }
  if (rawItems.length > MAX_LINES) {
    throw httpError(`You can order at most ${MAX_LINES} different items at once.`, 400, "TOO_MANY_ITEMS");
  }

  const ids = rawItems.map((item) => String(item?._id || item?.product || ""));
  if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw httpError("One or more items in your cart are invalid.", 400, "INVALID_ITEM");
  }

  const products = await Product.find({ _id: { $in: ids } }).populate("flavor", "name");
  const byId = new Map(products.map((p) => [String(p._id), p]));

  return rawItems.map((raw) => {
    const product = byId.get(String(raw._id || raw.product));
    if (!product) {
      throw httpError("One of the items in your cart is no longer available. Please refresh your cart.", 400, "PRODUCT_UNAVAILABLE");
    }

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) {
      throw httpError(`Invalid quantity for "${product.name}" (allowed 1-${MAX_QTY_PER_LINE}).`, 400, "INVALID_QUANTITY");
    }

    const weight = cleanText(raw.weight, 60) || product.weight || null;
    const flowerCount = cleanText(raw.flowerCount, 60) || product.flowerCount || null;

    // ← the ONLY source of price / discount / tax / shipping
    const variantPricing = resolveVariantPricing(product, { weight, flowerCount });
    const pricing = calculateItemPricing({ ...variantPricing, quantity });

    return {
      _id: String(product._id),
      product: product._id,
      name: product.name,
      quantity: pricing.quantity,
      price: variantPricing.price,
      salePrice: variantPricing.salePrice,
      discount: variantPricing.discount,
      tax: variantPricing.tax,
      shippingCost: variantPricing.shippingCost,
      itemTotal: pricing.itemTotal,
      isCodAvailable: product.isCodAvailable !== false,
      isEggless: product.hasEgglessOption ? Boolean(raw.isEggless) : false,
      deliveryTime: product.deliveryTime,
      expectedDeliveryDate: product.expectedDeliveryDate,
      flavor: product.flavor?.name || null,
      weight,
      flowerCount,
      selectedVariant: [weight, flowerCount].filter(Boolean).join(" / ") || undefined,
      occasions: product.occasions || [],
      messageOnCake: cleanText(raw.messageOnCake, 200),
      customImage: cleanUrl(raw.customImage),
    };
  });
}

module.exports = { priceOrderItems, findVariantTarget, cleanText, httpError };
