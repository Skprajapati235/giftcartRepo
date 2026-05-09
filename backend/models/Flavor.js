const mongoose = require("mongoose");

const flavorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Flavor", flavorSchema);
