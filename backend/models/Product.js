const mongoose = require("mongoose");

// One priced option for a product that comes in multiple weights (cakes) or
// multiple counts (flower bouquets). Every option carries its OWN price,
// sale price, discount, tax and shipping cost — set directly by the admin,
// nothing here is auto-calculated. When the buyer picks an option on the
// product page, that option's numbers (not the product's root-level
// price/discount/tax/shippingCost) are what get used everywhere downstream
// (cart, checkout, order).
const weightOptionSchema = new mongoose.Schema(
  {
    weight: { type: String, required: true }, // e.g. "500g", "1kg", "2kg"
    price: { type: Number, required: true }, // List Price (MRP) for this weight
    salePrice: { type: Number }, // Offer price for this weight
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true },
  },
  { _id: true }
);

const flowerCountOptionSchema = new mongoose.Schema(
  {
    flowerCount: { type: String, required: true }, // e.g. "10 Roses", "20 Roses"
    price: { type: Number, required: true },
    salePrice: { type: Number },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  image: { type: String },
  images: [{ type: String }],
  description: { type: String },
  summary: { type: String },
  layout: { type: String },
  hasEgglessOption: { type: Boolean, default: false },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, trim: true },
  lowStockThreshold: { type: Number, default: 5, min: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  isCodAvailable: { type: Boolean, default: true },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  deliveryTime: { type: String, default: "24-48" }, // e.g., "2-4 hours"
  expectedDeliveryDate: { type: String, default: "2 Hours" }, // e.g., "Tomorrow"
  flavor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flavor"
  },
  // A product can belong to more than one occasion (e.g. a cake works for
  // both Birthday and Anniversary) — used for the navbar occasion list
  // and product filtering.
  occasions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Occasion"
  }],
  weight: { type: String }, // e.g., "500g", "1kg" — used only when no weightOptions are set
  flowerCount: { type: String }, // e.g., "10 Roses", "24 Lilies" — used only when no flowerCountOptions are set
  // Multiple weight variants (cakes etc.), each with its own price/sale
  // price/discount/tax/shipping. Optional — a product can still just use
  // the single root price fields above if it has no variants.
  weightOptions: [weightOptionSchema],
  // Multiple flower-count variants (bouquets etc.), each with its own
  // price/sale price/discount/tax/shipping.
  flowerCountOptions: [flowerCountOptionSchema],
  // Which cities this product can be delivered to. Empty/undefined array
  // means "available everywhere" so existing products keep working exactly
  // as before this field was added — nothing becomes invisible by default.
  availableCities: [{ type: String }],
  // SEO Specific Fields
  seoTitle: { type: String, trim: true },
  seoDescription: { type: String, trim: true },
  seoKeywords: [{ type: String }],
  canonicalUrl: { type: String, trim: true },
  ogImage: { type: String, trim: true },
  noIndex: { type: Boolean, default: false },
  noFollow: { type: Boolean, default: false },
  customSchema: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);