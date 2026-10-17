// const authService = require("../services/authService");
// const generateToken = require("../utils/generateToken");
// const Admin = require("../models/Admin");
// const User = require("../models/User");
// const jwt = require("jsonwebtoken");

// const sanitizeAdmin = (admin) => {
//   if (!admin) return null;
//   const obj = typeof admin.toObject === "function" ? admin.toObject() : { ...admin };
//   delete obj.password;
//   delete obj.resetOtpHash;
//   delete obj.resetOtpExpiresAt;
//   return obj;
// };

// exports.register = async (req, res) => {
//   try {
//     const adminCount = await Admin.countDocuments();
//     // If an admin already exists in the system, only a logged-in Super Admin can create accounts
//     if (adminCount > 0) {
//       const authHeader = req.headers.authorization;
//       const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
//       if (!token) {
//         return res.status(401).json({ message: "Super Admin authorization required to create accounts" });
//       }
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         let caller = await Admin.findById(decoded?.id);
//         if (!caller) caller = await User.findById(decoded?.id);
//         const role = (caller?.role || decoded.role || "").toLowerCase();
//         if (role !== "super_admin" && role !== "admin") {
//           return res.status(403).json({ message: "Access denied. Only Super Admin can register staff accounts" });
//         }
//       } catch (tokenErr) {
//         return res.status(401).json({ message: "Invalid or expired Super Admin session token" });
//       }
//     }

//     const admin = await authService.registerAdmin(req.body);
//     const { logActivity } = require("../utils/auditLogger");
//     await logActivity({
//       req,
//       action: `Created Staff Account`,
//       module: "Admin Management",
//       details: `Created new admin account "${admin.name}" (${admin.email}) with role: ${admin.role}.`,
//       severity: "warning",
//       metadata: { createdAdminId: admin._id, email: admin.email, role: admin.role },
//     });
//     res.status(201).json({ admin: sanitizeAdmin(admin) });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const admin = await authService.loginAdmin({ email, password });
//     const { logActivity } = require("../utils/auditLogger");
//     await logActivity({
//       req,
//       admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
//       action: `Admin Logged In`,
//       module: "Authentication",
//       details: `Admin "${admin.name}" (${admin.role}) signed in successfully from IP ${req.ip || "unknown"}.`,
//       severity: "info",
//     });
//     res.json({ admin: sanitizeAdmin(admin), token: generateToken(admin._id, admin.role) });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


// const { OAuth2Client } = require("google-auth-library");
// const client = new OAuth2Client("77642027655-ika7ain9hl6ah04g5ocv4qdccoc75a7q.apps.googleusercontent.com");

// exports.googleLogin = async (req, res) => {
//   try {
//     const { idToken } = req.body;

//     const ticket = await client.verifyIdToken({
//       idToken: idToken,
//       audience: "77642027655-ika7ain9hl6ah04g5ocv4qdccoc75a7q.apps.googleusercontent.com",
//     });

//     const payload = ticket.getPayload();
//     const { email, name } = payload;

//     const admin = await authService.googleLogin({ email, name });

//     res.json({
//       admin: sanitizeAdmin(admin),
//       token: generateToken(admin._id, admin.role),
//     });
//   } catch (err) {
//     res.status(400).json({ message: "Invalid Google Token or Server Error" });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     await authService.requestPasswordReset({ ...req.body, accountType: "admin" });
//     res.json({ message: "If an account exists for this email, an OTP has been sent" });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     await authService.resetPassword({ ...req.body, accountType: "admin" });
//     res.json({ message: "Password reset successfully. You can now log in" });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// exports.verifySession = async (req, res) => {
//   try {
//     const adminId = req.user?.id;
//     if (!adminId) {
//       return res.status(401).json({ success: false, message: "Unauthorized: No active admin session" });
//     }

//     let admin = await Admin.findById(adminId).select("-password -resetOtpHash -resetOtpExpiresAt");
//     if (!admin) {
//       admin = await User.findById(adminId).select("-password -resetOtpHash -resetOtpExpiresAt");
//     }

//     if (!admin) {
//       return res.status(401).json({ success: false, message: "Admin account not found" });
//     }

//     const VALID_ADMIN_ROLES = [
//       "super_admin",
//       "admin",
//       "kitchen_manager",
//       "delivery_coordinator",
//       "support_agent",
//       "seo_specialist",
//     ];

//     if (!VALID_ADMIN_ROLES.includes(admin.role)) {
//       return res.status(403).json({ success: false, message: "Admin privileges required" });
//     }

//     res.json({
//       success: true,
//       valid: true,
//       admin: {
//         id: admin._id,
//         _id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role,
//         department: admin.department || "Executive Management",
//         permissions: admin.permissions || (admin.role === "super_admin" || admin.role === "admin" ? ["*"] : []),
//         profilePic: admin.profilePic,
//         city: admin.city,
//         state: admin.state,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message || "Failed to verify session" });
//   }
// };

const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { getTokenFromRequest, wantsCookie } = require("../utils/authCookie");
const adminSessions = require("../utils/adminSessions");

// Cookie mode (admin panel)  → access + refresh httpOnly cookies, NO token in the JSON body.
// Header mode (old clients)  → { token } in the body exactly like before.
async function respondWithSession(req, res, admin) {
  if (wantsCookie(req)) {
    await adminSessions.startSession(req, res, admin);
    return res.json({ admin: sanitizeAdmin(admin), cookieSession: true });
  }
  return res.json({ admin: sanitizeAdmin(admin), token: generateToken(admin._id, admin.role) });
}

const sanitizeAdmin = (admin) => {
  if (!admin) return null;
  const obj = typeof admin.toObject === "function" ? admin.toObject() : { ...admin };
  delete obj.password;
  delete obj.resetOtpHash;
  delete obj.resetOtpExpiresAt;
  return obj;
};

exports.register = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    // If an admin already exists in the system, only a logged-in Super Admin can create accounts
    if (adminCount > 0) {
      const token = getTokenFromRequest(req); // header OR session cookie
      if (!token) {
        return res.status(401).json({ message: "Super Admin authorization required to create accounts" });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let caller = await Admin.findById(decoded?.id);
        if (!caller) caller = await User.findById(decoded?.id);
        const role = (caller?.role || decoded.role || "").toLowerCase();
        if (role !== "super_admin" && role !== "admin") {
          return res.status(403).json({ message: "Access denied. Only Super Admin can register staff accounts" });
        }
      } catch (tokenErr) {
        return res.status(401).json({ message: "Invalid or expired Super Admin session token" });
      }
    }

    const admin = await authService.registerAdmin(req.body);
    const { logActivity } = require("../utils/auditLogger");
    await logActivity({
      req,
      action: `Created Staff Account`,
      module: "Admin Management",
      details: `Created new admin account "${admin.name}" (${admin.email}) with role: ${admin.role}.`,
      severity: "warning",
      metadata: { createdAdminId: admin._id, email: admin.email, role: admin.role },
    });
    res.status(201).json({ admin: sanitizeAdmin(admin) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await authService.loginAdmin({ email, password });
    const { logActivity } = require("../utils/auditLogger");
    await logActivity({
      req,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      action: `Admin Logged In`,
      module: "Authentication",
      details: `Admin "${admin.name}" (${admin.role}) signed in successfully from IP ${req.ip || "unknown"}.`,
      severity: "info",
    });
    return await respondWithSession(req, res, admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "77642027655-ika7ain9hl6ah04g5ocv4qdccoc75a7q.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({ message: "Google token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      return res.status(403).json({ message: "Your Google email is not verified" });
    }
    const { email, name } = payload;

    const admin = await authService.googleLogin({ email, name });

    return await respondWithSession(req, res, admin);
  } catch (err) {
    if (err?.statusCode === 403) return res.status(403).json({ message: err.message });
    res.status(400).json({ message: "Invalid Google Token or Server Error" });
  }
};

// POST /api/admin/auth/session  (Authorization: Bearer <old token>, verified by adminMiddleware)
// One-time upgrade for admins already logged in with a localStorage token: swaps it for a
// httpOnly cookie (with a fresh 7-day token) so nobody has to log in again.
exports.exchangeSession = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password -resetOtpHash -resetOtpExpiresAt");
    const account = admin || (await User.findById(req.user.id).select("-password -resetOtpHash -resetOtpExpiresAt"));
    if (!account) return res.status(401).json({ success: false, message: "Account not found" });
    await adminSessions.startSession(req, res, account);
    res.json({ success: true });
  } catch (err) {
    console.error("Admin session exchange error:", err);
    res.status(500).json({ success: false, message: "Could not start a secure session" });
  }
};

// POST /api/admin/auth/refresh — swaps the refresh cookie for a new access + refresh pair (rotation)
exports.refresh = async (req, res) => {
  try {
    const result = await adminSessions.rotate(req, res);
    if (!result.ok) {
      // dead session → delete both cookies so the browser stops sending them
      require("../utils/authCookie").clearAuthCookie(res);
      adminSessions.clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: "Session expired. Please sign in again.", reason: result.reason });
    }
    res.json({ success: true, grace: Boolean(result.grace) });
  } catch (err) {
    console.error("Admin refresh error:", err);
    res.status(500).json({ success: false, message: "Could not refresh the session" });
  }
};

// POST /api/admin/auth/logout — revokes the session on the server and deletes both cookies
exports.logout = async (req, res) => {
  await adminSessions.endSession(req, res);
  res.json({ success: true });
};

exports.forgotPassword = async (req, res) => {
  try {
    await authService.requestPasswordReset({ ...req.body, accountType: "admin" });
    res.json({ message: "If an account exists for this email, an OTP has been sent" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword({ ...req.body, accountType: "admin" });
    // a new password must end every existing login session of that account
    await adminSessions.revokeAllForAdmin(result?.id);
    res.json({ message: "Password reset successfully. You can now log in" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifySession = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No active admin session" });
    }

    let admin = await Admin.findById(adminId).select("-password -resetOtpHash -resetOtpExpiresAt");
    if (!admin) {
      admin = await User.findById(adminId).select("-password -resetOtpHash -resetOtpExpiresAt");
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin account not found" });
    }

    const VALID_ADMIN_ROLES = [
      "super_admin",
      "admin",
      "kitchen_manager",
      "delivery_coordinator",
      "support_agent",
      "seo_specialist",
    ];

    if (!VALID_ADMIN_ROLES.includes(admin.role)) {
      return res.status(403).json({ success: false, message: "Admin privileges required" });
    }

    res.json({
      success: true,
      valid: true,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department || "Executive Management",
        permissions: admin.permissions || (admin.role === "super_admin" || admin.role === "admin" ? ["*"] : []),
        profilePic: admin.profilePic,
        city: admin.city,
        state: admin.state,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to verify session" });
  }
};