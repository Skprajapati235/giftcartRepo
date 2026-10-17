// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

//   if (!token) return res.status(401).json("No token");

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch {
//     res.status(401).json("Invalid token");
//   }
// };

const jwt = require("jsonwebtoken");
const { getTokenFromRequest } = require("../utils/authCookie");
const { maybeRenewCustomerToken } = require("../utils/sessionRenewal");
const { isFamilyActive } = require("../utils/adminSessions");

module.exports = (req, res, next) => {
  // Authorization header (mobile app) OR httpOnly session cookie (website / admin panel)
  const token = getTokenFromRequest(req);

  if (!token) return res.status(401).json("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Admin-panel cookie sessions carry a session id: a logged-out / revoked session must stop working at once.
    if (decoded.sid) {
      return isFamilyActive(decoded.sid)
        .then((active) => (active ? next() : res.status(401).json("Session ended")))
        .catch(() => res.status(401).json("Invalid token"));
    }

    maybeRenewCustomerToken(req, res, decoded); // keeps customers logged in (sliding 365-day session)
    next();
  } catch {
    res.status(401).json("Invalid token");
  }
};