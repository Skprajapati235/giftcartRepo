// PATH: backend/utils/priceCalculator.js
// Single source of truth for price / quantity calculation.
// Used by cartService, orderService and orderController so that the cart
// total shown to the user and the total actually charged on the order
// always match.
//
// IMPORTANT RULE (as decided by the store owner):
//   Increasing the quantity of an item ONLY multiplies the item's price.
//   Discount, tax and shipping cost are fixed, one-time amounts for that
//   line — they are calculated ONCE (from the selected variant / product)
//   and do NOT get multiplied again by the quantity.
//
// Formula:
//   unitPrice       = salePrice (falls back to price)
//   discountAmount  = unitPrice * (discount / 100)               [flat, once]
//   taxAmount       = (unitPrice - discountAmount) * (tax / 100) [flat, once]
//   priceForQty     = unitPrice * quantity                       [scales]
//   itemTotal       = priceForQty - discountAmount + taxAmount + shippingCost

function round2(value) {
  return Number((Math.round(Number(value || 0) * 100) / 100).toFixed(2));
}

function calculateItemPricing({ price, salePrice, discount, tax, shippingCost, quantity }) {
  const qty = Math.max(1, Number(quantity || 1));
  const basePrice = Number(price || 0);
  const effectiveSalePrice =
    salePrice !== undefined && salePrice !== null && salePrice !== ""
      ? Number(salePrice)
      : basePrice;
  const discountPct = Number(discount || 0);
  const taxPct = Number(tax || 0);
  const shipping = round2(Number(shippingCost || 0));

  // These three are FLAT — computed once off the unit price, never
  // multiplied by quantity.
  const discountAmount = round2(effectiveSalePrice * (discountPct / 100));
  const priceAfterDiscount = effectiveSalePrice - discountAmount;
  const taxAmount = round2(priceAfterDiscount * (taxPct / 100));

  // Only the price itself scales with quantity.
  const priceForQuantity = round2(effectiveSalePrice * qty);

  const itemTotal = round2(priceForQuantity - discountAmount + taxAmount + shipping);
  // Informational "per unit" figure (what the line total would be at qty=1).
  const unitFinalPrice = round2(effectiveSalePrice - discountAmount + taxAmount + shipping);

  return {
    quantity: qty,
    price: round2(basePrice),
    salePrice: round2(effectiveSalePrice),
    discount: discountPct,
    tax: taxPct,
    shippingCost: shipping,
    discountAmount,
    taxAmount,
    unitFinalPrice,
    itemTotal,
  };
}

// Totals across a whole cart/order. Every item passed in is expected to
// already carry the fields calculateItemPricing() returns (discountAmount,
// taxAmount, shippingCost, itemTotal, price, salePrice, quantity) — this
// function only sums them up, it never re-derives tax/discount/shipping
// from percentages itself, so it can never re-introduce the
// scales-with-quantity bug.
function calculateCartTotals(items) {
  const subTotal = round2(
    items.reduce((sum, item) => sum + Number(item.salePrice ?? item.price ?? 0) * Number(item.quantity || 0), 0)
  );
  const totalDiscount = round2(items.reduce((sum, item) => sum + Number(item.discountAmount || 0), 0));
  const totalTax = round2(items.reduce((sum, item) => sum + Number(item.taxAmount || 0), 0));
  const totalShipping = round2(items.reduce((sum, item) => sum + Number(item.shippingCost || 0), 0));
  const grandTotal = round2(items.reduce((sum, item) => sum + Number(item.itemTotal || 0), 0));
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return { subTotal, totalDiscount, totalTax, totalShipping, grandTotal, totalQuantity };
}

// Picks the right price/discount/tax/shipping numbers for a cart/order line:
// - if the product has weightOptions/flowerCountOptions and the line picked
//   one of them, use THAT option's own numbers
// - otherwise fall back to the product's root-level price fields
// Nothing here does any math beyond finding the right numbers — the actual
// calculation still happens in calculateItemPricing().
function resolveVariantPricing(product, { weight, flowerCount } = {}) {
  if (!product) return null;

  if (weight && Array.isArray(product.weightOptions) && product.weightOptions.length > 0) {
    const match = product.weightOptions.find((opt) => opt.weight === weight);
    if (match) {
      return {
        price: match.price,
        salePrice: match.salePrice,
        discount: match.discount,
        tax: match.tax,
        shippingCost: match.shippingCost,
      };
    }
  }

  if (flowerCount && Array.isArray(product.flowerCountOptions) && product.flowerCountOptions.length > 0) {
    const match = product.flowerCountOptions.find((opt) => opt.flowerCount === flowerCount);
    if (match) {
      return {
        price: match.price,
        salePrice: match.salePrice,
        discount: match.discount,
        tax: match.tax,
        shippingCost: match.shippingCost,
      };
    }
  }

  // No variant selected/matched — use the product's own root pricing.
  return {
    price: product.price,
    salePrice: product.salePrice,
    discount: product.discount,
    tax: product.tax,
    shippingCost: product.shippingCost,
  };
}

module.exports = { calculateItemPricing, calculateCartTotals, resolveVariantPricing, round2 };
