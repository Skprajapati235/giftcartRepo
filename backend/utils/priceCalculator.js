// PATH: backend/utils/priceCalculator.js  (NAYI FILE)
// Single source of truth for price / quantity calculation.
// Used by cartService and orderService so that the cart total shown to the
// user and the total actually charged on the order always match.
//
// Formula:
//   unitPrice        = salePrice (falls back to price)
//   discountedPrice   = unitPrice * (1 - discount / 100)
//   taxedPrice        = discountedPrice * (1 + tax / 100)
//   itemTotal         = (taxedPrice + shippingCost) * quantity

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
  const shipping = Number(shippingCost || 0);

  const discountedPrice = effectiveSalePrice * (1 - discountPct / 100);
  const taxedPrice = discountedPrice * (1 + taxPct / 100);
  const unitFinalPrice = round2(taxedPrice + shipping);
  const itemTotal = round2(unitFinalPrice * qty);

  return {
    quantity: qty,
    price: round2(basePrice),
    salePrice: round2(effectiveSalePrice),
    discount: discountPct,
    tax: taxPct,
    shippingCost: round2(shipping),
    unitFinalPrice,
    itemTotal,
  };
}

function calculateCartTotals(items) {
  const subTotal = round2(items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0));
  const totalDiscount = round2(
    items.reduce((sum, item) => {
      const base = Number(item.price || 0) * Number(item.quantity || 0);
      const afterDiscount = Number(item.salePrice || item.price || 0) * (1 - Number(item.discount || 0) / 100) * Number(item.quantity || 0);
      return sum + Math.max(0, base - afterDiscount);
    }, 0)
  );
  const totalTax = round2(
    items.reduce((sum, item) => {
      const afterDiscount = Number(item.salePrice || item.price || 0) * (1 - Number(item.discount || 0) / 100);
      const taxAmount = afterDiscount * (Number(item.tax || 0) / 100) * Number(item.quantity || 0);
      return sum + taxAmount;
    }, 0)
  );
  const totalShipping = round2(items.reduce((sum, item) => sum + Number(item.shippingCost || 0) * Number(item.quantity || 0), 0));
  const grandTotal = round2(items.reduce((sum, item) => sum + Number(item.itemTotal || 0), 0));
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return { subTotal, totalDiscount, totalTax, totalShipping, grandTotal, totalQuantity };
}

module.exports = { calculateItemPricing, calculateCartTotals, round2 };