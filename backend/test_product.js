const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  try {
    const p = await Product.create({
      name: "Test Bouquet",
      price: 100,
      category: "60b8d2955f1b2c0015f8e1a1", // dummy id
      flowerCount: "10 Roses"
    });
    console.log("Created:", p);
    await Product.findByIdAndDelete(p._id);
    console.log("Deleted test product");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
