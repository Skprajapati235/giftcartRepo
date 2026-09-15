// PATH: backend/utils/priceCalculator.js
// Single source of truth for price / quantity calculation.
// Used by cartService, orderService and orderController so that the cart
// total shown to the user and the total actually charged on the order
// always match — and so the admin panel's own math (order detail,
// dashboards) always lands on the exact same number too.
//
// RULE: every per-unit figure (discount, tax) scales with quantity, same
// as the price itself — buying 3 units gives 3x the discount and 3x the
// tax, exactly like a real bill. Only shippingCost stays flat per cart
// line (one shipment per line item, regardless of how many units are in
// it), matching how shippingCost is configured per-product/variant.
//
// Formula:
//   unitPrice           = salePrice (falls back to price)
//   unitDiscountAmount  = unitPrice * (discount / 100)
//   unitPriceAfterDisc  = unitPrice - unitDiscountAmount
//   unitTaxAmount       = unitPriceAfterDisc * (tax / 100)
//   discountAmount      = unitDiscountAmount * quantity   [scales]
//   taxAmount           = unitTaxAmount * quantity        [scales]
//   priceForQty         = unitPrice * quantity             [scales]
//   itemTotal           = priceForQty - discountAmount + taxAmount + shippingCost

function round2(value) {
  return Number((Math.round(Number(value || 0) * 100) / 100).toFixed(2));
}

function calculateItemPricing({ price, salePrice, discount, tax, shippingCost, quantity }) {
  const qty = Math.max(1, Number(quantity || 1));
  const basePrice = Number(price || 0);
  const discountPct = Number(discount || 0);
  const taxPct = Number(tax || 0);
  const shipping = round2(Number(shippingCost || 0));

  // The salePrice field represents the post-discount price (List Price - Discount Amount).
  // If salePrice is explicitly provided, we trust it as the post-discount price.
  // Otherwise, we calculate it from basePrice and discountPct.
  const calcSalePrice = basePrice - (basePrice * (discountPct / 100));
  const effectiveSalePrice = salePrice !== undefined && salePrice !== null && salePrice !== "" 
      ? Number(salePrice) 
      : calcSalePrice;

  // Per-unit figures first...
  const unitDiscountAmount = basePrice - effectiveSalePrice;
  const unitPriceAfterDiscount = effectiveSalePrice;
  const unitTaxAmount = unitPriceAfterDiscount * (taxPct / 100);

  // ...then scaled by quantity, same as the price itself.
  const discountAmount = round2(unitDiscountAmount * qty);
  const taxAmount = round2(unitTaxAmount * qty);
  const priceForQuantity = round2(effectiveSalePrice * qty);

  const itemTotal = round2(priceForQuantity - discountAmount + taxAmount + shipping);
  // Informational "per unit" figure (what one unit alone would cost, shipping included).
  const unitFinalPrice = round2(unitPriceAfterDiscount + unitTaxAmount + shipping);

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
