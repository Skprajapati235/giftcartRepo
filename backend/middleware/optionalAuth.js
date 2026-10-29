const jwt = require("jsonwebtoken");
const { getTokenFromRequest } = require("../utils/authCookie");
const { isFamilyActive } = require("../utils/adminSessions");

module.exports = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.sid) {
      const active = await isFamilyActive(decoded.sid).catch(() => false);
      if (!active) {
        req.user = null;
        return next();
      }
    }
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

