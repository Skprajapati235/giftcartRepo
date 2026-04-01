const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  salePrice: Number,
  image: String,
  description: String,
  summary: String,
  layout: String,
  weight: String,
  flowers: Number,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);