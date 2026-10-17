const jwt = require("jsonwebtoken");

const STAFF_ROLES = ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent", "seo_specialist"];

// Token lifetimes (override from .env if you want):
//   JWT_EXPIRES_IN        customers (website + app)  default 365d — and it slides forward
//                         automatically (utils/sessionRenewal.js), so customers stay logged in until
//                         they press Logout. Never set this below 180d.
//   ADMIN_JWT_EXPIRES_IN  legacy header-token mode for staff (cookie mode uses utils/adminSessions.js)  default 7d
module.exports = (id, role) => {
  const isStaff = STAFF_ROLES.includes(String(role || "").toLowerCase());
  const expiresIn = isStaff
    ? process.env.ADMIN_JWT_EXPIRES_IN || "7d"
    : process.env.JWT_EXPIRES_IN || "365d";
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
};
