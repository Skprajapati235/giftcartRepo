const jwt = require("jsonwebtoken");

module.exports = (id, role) => {
  // Non-expiring persistent session for e-commerce customers (Website + Mobile app).
  // Customers stay logged in permanently until they explicitly click Logout.
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "36500d", // 100 years validity (permanent session)
  });
};