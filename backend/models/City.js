const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  image: String,
  state: { type: String, required: true },
  cities: [{ type: String, required: true }],
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);
