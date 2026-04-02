const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  image: { type: String },
  description: { type: String },
  summary: { type: String },
  layout: { type: String },
  weight: { type: String },
  flowers: { type: Number },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);