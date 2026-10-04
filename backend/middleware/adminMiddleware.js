const jwt = require("jsonwebtoken");
const User = require("../models/User");

const VALID_ADMIN_ROLES = [
  "super_admin",
  "admin",
  "kitchen_manager",
  "delivery_coordinator",
  "support_agent",
  "seo_specialist",
];

const adminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) return res.status(401).json({ success: false, message: "No authentication token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = (decoded.role || "").toLowerCase();

    if (VALID_ADMIN_ROLES.includes(role)) {
      req.user = decoded;
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user || !VALID_ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.user = { id: user._id, role: user.role, name: user.name, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
};

/**
 * Role-Based Access Control Guard for high-security endpoints
 */
adminMiddleware.requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || "").toLowerCase();
    if (userRole === "super_admin" || userRole === "admin") {
      return next(); // Super admin has root access to all endpoints
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: [${allowedRoles.join(", ")}]. Your current role is '${userRole}'.`,
      });
    }

    next();
  };
};

module.exports = adminMiddleware;
