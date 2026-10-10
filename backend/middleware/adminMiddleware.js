const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
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
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid session token" });
    }

    // Lookup authentic Admin or User account from MongoDB
    let account = await Admin.findById(decoded.id).select("-password -resetOtpHash -resetOtpExpiresAt").lean();
    if (!account) {
      account = await User.findById(decoded.id).select("-password -resetOtpHash -resetOtpExpiresAt").lean();
    }

    if (!account) {
      return res.status(401).json({ success: false, message: "Admin account not found or has been removed" });
    }

    const role = (account.role || decoded.role || "").toLowerCase().trim();
    if (!VALID_ADMIN_ROLES.includes(role)) {
      return res.status(403).json({ success: false, message: "Admin privileges required" });
    }

    // Attach complete authentic staff identity for activity tracking & RBAC checks
    req.user = {
      id: account._id,
      _id: account._id,
      name: account.name || "Staff Member",
      email: account.email || "",
      role: account.role || role,
      department: account.department || "Executive Operations",
      permissions: Array.isArray(account.permissions)
        ? account.permissions
        : (role === "super_admin" || role === "admin" ? ["*"] : []),
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
};

/**
 * Role & Screen-Permission RBAC Guard
 * Allows Super Admin root access unconditionally.
 * For staff users:
 * 1. Checks if staff has explicit permissions array matching requiredScreens
 * 2. If staff has no permissions configured (legacy), falls back to role matching
 */
adminMiddleware.requireRole = (allowedRoles = [], requiredScreens = []) => {
  const rolesList = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map((r) =>
    String(r).toLowerCase().trim()
  );
  const screensList = (Array.isArray(requiredScreens) ? requiredScreens : [requiredScreens]).map((s) =>
    String(s).toLowerCase().trim()
  );

  return (req, res, next) => {
    const userRole = (req.user?.role || "").toLowerCase().trim();
    const userPermissions = req.user?.permissions;

    // Super Admin has full unrestricted root access to everything
    if (userRole === "super_admin" || userRole === "admin") {
      return next();
    }

    // Wildcard permissions grant full access
    if (Array.isArray(userPermissions) && userPermissions.includes("*")) {
      return next();
    }

    // If staff user has an assigned screen permissions array, this is the SOLE source of truth
    if (Array.isArray(userPermissions)) {
      if (screensList.length > 0) {
        const hasScreen = userPermissions.some((p) => {
          if (!p) return false;
          const cleanP = String(p).toLowerCase().trim();
          return screensList.some(
            (s) => s === cleanP || s.startsWith(cleanP + "/") || cleanP.startsWith(s + "/")
          );
        });
        if (hasScreen) {
          return next();
        }
      }
      return res.status(403).json({
        success: false,
        message: `Access denied. Your assigned workstation permissions do not include access to this screen or action.`,
      });
    }

    // Fallback: If legacy account with no permissions array, check role
    if (rolesList.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. This action requires role [${rolesList.join(", ")}]. Your current role is '${userRole}'.`,
    });
  };
};

module.exports = adminMiddleware;
