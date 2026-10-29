// PATH: backend/tests/orderSecurity.test.js
// Run:  npm test      (uses Node's built-in test runner — no extra packages)

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const mongoose = require("mongoose");

const Product = require("../models/Product");
const { priceOrderItems } = require("../services/orderPricingService");
const { validateShippingAddress } = require("../utils/orderValidation");
const { signatureMatches } = require("../controllers/razorpayWebhookController");
const stockService = require("../services/stockService");

const id = () => new mongoose.Types.ObjectId();

// Fake the DB: Product.find(...).populate(...) resolves to `docs`
function mockProducts(docs) {
  Product.find = () => ({ populate: async () => docs });
}

const cake = () => ({
  _id: id(),
  name: "Choco Truffle Cake",
  price: 1000,
  salePrice: 900,
  discount: 0,
  tax: 0,
  shippingCost: 50,
  isCodAvailable: true,
  hasEgglessOption: true,
  weightOptions: [{ _id: id(), weight: "1kg", price: 1800, salePrice: 1600, discount: 0, tax: 0, shippingCost: 0 }],
  flowerCountOptions: [],
  occasions: [],
  flavor: { name: "Chocolate" },
});

test("client-sent price is ignored — DB price is used", async () => {
  const p = cake();
  mockProducts([p]);
  const [line] = await priceOrderItems([{ _id: String(p._id), quantity: 2, price: 1, salePrice: 1, discount: 99, tax: 0, shippingCost: 0 }]);
  assert.equal(line.price, 1000);
  assert.equal(line.salePrice, 900);
  assert.equal(line.itemTotal, 900 * 2 + 50); // 1850, not ₹1
});

test("variant (weight option) price comes from the DB option", async () => {
  const p = cake();
  mockProducts([p]);
  const [line] = await priceOrderItems([{ _id: String(p._id), quantity: 1, weight: "1kg", price: 5 }]);
  assert.equal(line.salePrice, 1600);
  assert.equal(line.itemTotal, 1600);
  assert.equal(line.selectedVariant, "1kg");
});

test("eggless flag is dropped when product has no eggless option", async () => {
  const p = { ...cake(), hasEgglessOption: false };
  mockProducts([p]);
  const [line] = await priceOrderItems([{ _id: String(p._id), quantity: 1, isEggless: true }]);
  assert.equal(line.isEggless, false);
});

test("rejects empty cart, bad quantity, bad id and unknown product", async () => {
  const p = cake();
  mockProducts([p]);
  await assert.rejects(() => priceOrderItems([]), { code: "EMPTY_CART" });
  await assert.rejects(() => priceOrderItems(undefined), { code: "EMPTY_CART" });
  await assert.rejects(() => priceOrderItems([{ _id: String(p._id), quantity: 0 }]), { code: "INVALID_QUANTITY" });
  await assert.rejects(() => priceOrderItems([{ _id: String(p._id), quantity: -3 }]), { code: "INVALID_QUANTITY" });
  await assert.rejects(() => priceOrderItems([{ _id: String(p._id), quantity: 1.5 }]), { code: "INVALID_QUANTITY" });
  await assert.rejects(() => priceOrderItems([{ _id: "not-an-id", quantity: 1 }]), { code: "INVALID_ITEM" });
  await assert.rejects(() => priceOrderItems([{ _id: String(id()), quantity: 1 }]), { code: "PRODUCT_UNAVAILABLE" });
});

test("shipping address validation", () => {
  const ok = validateShippingAddress({
    fullName: " Riya ", phone: "+91 98765 43210", houseNo: "12", street: "Sector 15", pinCode: "121007",
  });
  assert.equal(ok.phone, "9876543210");
  assert.equal(ok.fullName, "Riya");

  assert.throws(() => validateShippingAddress(null), { code: "INVALID_ADDRESS" });
  assert.throws(() => validateShippingAddress({ fullName: "A", phone: "123", houseNo: "1", street: "x", pinCode: "121007" }), { code: "INVALID_ADDRESS" });
  assert.throws(() => validateShippingAddress({ fullName: "A", phone: "9876543210", houseNo: "1", street: "x", pinCode: "12" }), { code: "INVALID_ADDRESS" });
});

test("razorpay webhook signature check", () => {
  const body = Buffer.from('{"event":"payment.captured"}');
  const good = crypto.createHmac("sha256", "secret").update(body).digest("hex");
  assert.equal(signatureMatches(body, good, "secret"), true);
  assert.equal(signatureMatches(body, good, "other-secret"), false);
  assert.equal(signatureMatches(body, "deadbeef", "secret"), false);
  assert.equal(signatureMatches(undefined, good, "secret"), false);
});

test("stock enforcement is OFF unless ENFORCE_STOCK=true", async () => {
  delete process.env.ENFORCE_STOCK;
  assert.equal(stockService.isEnabled(), false);
  assert.deepEqual(await stockService.reserveForOrder({ items: [] }), { skipped: true });
});

test("custom photo and message are preserved on priced order item", async () => {
  const p = cake();
  mockProducts([p]);
  const [line] = await priceOrderItems([{
    _id: String(p._id),
    quantity: 1,
    customImage: "https://res.cloudinary.com/giftcart/image/upload/custom-phone-case.jpg",
    messageOnCake: "Happy Birthday Rahul",
  }]);
  assert.equal(line.customImage, "https://res.cloudinary.com/giftcart/image/upload/custom-phone-case.jpg");
  assert.equal(line.messageOnCake, "Happy Birthday Rahul");
});
