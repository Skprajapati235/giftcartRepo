const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { calculateItemPricing, calculateCartTotals, resolveVariantPricing } = require("../utils/priceCalculator");

function buildVariantKey({ productId, weight, flowerCount, flavor, isEggless }) {
  return [
    String(productId),
    weight || "",
    flowerCount || "",
    flavor ? String(flavor) : "",
    isEggless ? "eggless" : "regular",
  ].join("|");
}

// Turns raw cart docs (with populated product) into the response shape the
// frontend expects — every price field comes fresh from the Product
// collection, never from anything stored on the cart line itself.
async function serializeCart(cartDoc) {
  if (!cartDoc || !cartDoc.items || cartDoc.items.length === 0) {
    return { items: [], totals: calculateCartTotals([]) };
  }

  // Drop lines whose product was deleted in the meantime.
  const validItems = cartDoc.items.filter((item) => item.product);
  if (validItems.length !== cartDoc.items.length) {
    cartDoc.items = validItems;
    await cartDoc.save();
  }

  const items = validItems.map((item) => {
    const product = item.product;
    const variantPricing = resolveVariantPricing(product, {
      weight: item.weight,
      flowerCount: item.flowerCount,
    });
    const pricing = calculateItemPricing({
      ...variantPricing,
      quantity: item.quantity,
    });

    return {
      _id: item._id,
      product: product._id,
      name: product.name,
      image: product.image,
      category: product.category,
      isCodAvailable: product.isCodAvailable,
      hasEgglessOption: product.hasEgglessOption,
      deliveryTime: product.deliveryTime,
      expectedDeliveryDate: product.expectedDeliveryDate,
      weight: item.weight || product.weight || null,
      flowerCount: item.flowerCount || product.flowerCount || null,
      // Product only ever has ONE flavor, so always show the real
      // (populated) Flavor doc — {_id, name, image} — never the raw id
      // that used to get stored/echoed back on the cart line.
      flavor: product.flavor || null,
      occasions: product.occasions || [],
      isEggless: item.isEggless || false,
      variantKey: item.variantKey,
      quantity: pricing.quantity,
      price: pricing.price,
      salePrice: pricing.salePrice,
      discount: pricing.discount,
      tax: pricing.tax,
      shippingCost: pricing.shippingCost,
      discountAmount: pricing.discountAmount,
      taxAmount: pricing.taxAmount,
      unitFinalPrice: pricing.unitFinalPrice,
      itemTotal: pricing.itemTotal,
    };
  });

  return { items, totals: calculateCartTotals(items) };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

exports.getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate({ path: "items.product", populate: [{ path: "flavor" }, { path: "occasions" }] });
  return serializeCart(cart);
};

exports.addItem = async (userId, payload) => {
  const { productId, quantity = 1, weight, flowerCount, flavor, isEggless } = payload;

  const product = await Product.findById(productId).populate("flavor").populate("occasions");
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const cart = await getOrCreateCart(userId);
  const variantKey = buildVariantKey({ productId, weight, flowerCount, flavor, isEggless });

  const existing = cart.items.find((item) => item.variantKey === variantKey);
  if (existing) {
    existing.quantity += Math.max(1, Number(quantity || 1));
  } else {
    cart.items.push({
      product: productId,
      quantity: Math.max(1, Number(quantity || 1)),
      weight: weight || product.weight || null,
      flowerCount: flowerCount || product.flowerCount || null,
      flavor: flavor || product.flavor || null,
      isEggless: Boolean(isEggless),
      variantKey,
    });
  }

  await cart.save();
  await cart.populate({ path: "items.product", populate: [{ path: "flavor" }, { path: "occasions" }] });
  return serializeCart(cart);
};

exports.updateItemQuantity = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) {
    const error = new Error("Cart item not found");
    error.statusCode = 404;
    throw error;
  }

  const qty = Number(quantity);
  if (!qty || qty <= 0) {
    item.deleteOne();
  } else {
    item.quantity = qty;
  }

  await cart.save();
  await cart.populate({ path: "items.product", populate: [{ path: "flavor" }, { path: "occasions" }] });
  return serializeCart(cart);
};

exports.removeItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (item) {
    item.deleteOne();
    await cart.save();
  }
  await cart.populate({ path: "items.product", populate: [{ path: "flavor" }, { path: "occasions" }] });
  return serializeCart(cart);
};

exports.clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return serializeCart(cart);
};

// Public (no login needed) price quote for a guest cart kept in the
// browser's local storage. Takes only {productId, quantity, weight,
// flowerCount, flavor, isEggless} and returns fully backend-calculated
// line items + totals — nothing about price/discount/tax is trusted from
// the frontend.
exports.getGuestQuote = async (rawItems = []) => {
  const items = [];

  for (const rawItem of rawItems) {
    const productId = rawItem.productId || rawItem._id;
    if (!productId) continue;

    const product = await Product.findById(productId).populate("flavor").populate("occasions");
    if (!product) continue; // deleted/unavailable product silently dropped

    const variantPricing = resolveVariantPricing(product, {
      weight: rawItem.weight,
      flowerCount: rawItem.flowerCount,
    });
    const pricing = calculateItemPricing({
      ...variantPricing,
      quantity: rawItem.quantity,
    });

    items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      category: product.category,
      isCodAvailable: product.isCodAvailable,
      hasEgglessOption: product.hasEgglessOption,
      deliveryTime: product.deliveryTime,
      expectedDeliveryDate: product.expectedDeliveryDate,
      weight: rawItem.weight || product.weight || null,
      flowerCount: rawItem.flowerCount || product.flowerCount || null,
      flavor: product.flavor || null,
      occasions: product.occasions || [],
      isEggless: Boolean(rawItem.isEggless),
      variantKey: buildVariantKey({
        productId,
        weight: rawItem.weight,
        flowerCount: rawItem.flowerCount,
        flavor: rawItem.flavor?._id || rawItem.flavor,
        isEggless: rawItem.isEggless,
      }),
      quantity: pricing.quantity,
      price: pricing.price,
      salePrice: pricing.salePrice,
      discount: pricing.discount,
      tax: pricing.tax,
      shippingCost: pricing.shippingCost,
      discountAmount: pricing.discountAmount,
      taxAmount: pricing.taxAmount,
      unitFinalPrice: pricing.unitFinalPrice,
      itemTotal: pricing.itemTotal,
    });
  }

  return { items, totals: calculateCartTotals(items) };
};

// Called right after login/register so the guest cart kept in the app's
// local storage is not lost — it gets folded into the user's server cart.
exports.mergeGuestCart = async (userId, guestItems = []) => {
  const cart = await getOrCreateCart(userId);

  for (const guestItem of guestItems) {
    const productId = guestItem.productId || guestItem._id;
    if (!productId) continue;

    const product = await Product.findById(productId).populate("flavor").populate("occasions");
    if (!product) continue;

    const variantKey = buildVariantKey({
      productId,
      weight: guestItem.weight,
      flowerCount: guestItem.flowerCount,
      flavor: guestItem.flavor?._id || guestItem.flavor,
      isEggless: guestItem.isEggless,
    });

    const existing = cart.items.find((item) => item.variantKey === variantKey);
    if (existing) {
      existing.quantity += Math.max(1, Number(guestItem.quantity || 1));
    } else {
      cart.items.push({
        product: productId,
        quantity: Math.max(1, Number(guestItem.quantity || 1)),
        weight: guestItem.weight || product.weight || null,
        flowerCount: guestItem.flowerCount || product.flowerCount || null,
        flavor: guestItem.flavor?._id || guestItem.flavor || product.flavor || null,
        isEggless: Boolean(guestItem.isEggless),
        variantKey,
      });
    }
  }

  await cart.save();
  await cart.populate({ path: "items.product", populate: [{ path: "flavor" }, { path: "occasions" }] });
  return serializeCart(cart);
};