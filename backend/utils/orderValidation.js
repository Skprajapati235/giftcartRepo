// PATH: backend/utils/orderValidation.js
// Small, dependency-free input checks for POST /api/order/create.

const { httpError, cleanText } = require("../services/orderPricingService");

const digits = (v) => String(v || "").replace(/\D/g, "");

/**
 * Validates + whitelists the shipping address. Returns a clean object.
 * Throws a 400 error (instead of a 500 mongoose ValidationError) when bad.
 */
function validateShippingAddress(addr) {
  if (!addr || typeof addr !== "object") {
    throw httpError("Delivery address is required.", 400, "INVALID_ADDRESS");
  }

  const clean = {
    fullName: cleanText(addr.fullName, 100),
    phone: digits(addr.phone).slice(-10),
    alternatePhone: digits(addr.alternatePhone).slice(-10) || undefined,
    houseNo: cleanText(addr.houseNo, 120),
    street: cleanText(addr.street, 200),
    landmark: cleanText(addr.landmark, 150) || undefined,
    pinCode: digits(addr.pinCode),
    address: cleanText(addr.address, 500) || undefined,
  };

  if (!clean.fullName) throw httpError("Recipient name is required.", 400, "INVALID_ADDRESS");
  if (clean.phone.length !== 10) throw httpError("Enter a valid 10-digit mobile number.", 400, "INVALID_ADDRESS");
  if (!clean.houseNo) throw httpError("House / flat number is required.", 400, "INVALID_ADDRESS");
  if (!clean.street) throw httpError("Street / area is required.", 400, "INVALID_ADDRESS");
  if (clean.pinCode.length !== 6) throw httpError("Enter a valid 6-digit PIN code.", 400, "INVALID_ADDRESS");

  // keep any extra fields the existing clients send (city/state) as plain strings
  if (addr.city) clean.city = cleanText(addr.city, 80);
  if (addr.state) clean.state = cleanText(addr.state, 80);

  return clean;
}

module.exports = { validateShippingAddress };
