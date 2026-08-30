const mongoose = require("mongoose");

const websiteContentSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    mobileNumber: String,


}, { timestamps: true });

module.exports = mongoose.model("WebsiteContent", websiteContentSchema);