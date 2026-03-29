const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) return res.status(401).json("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "admin") {
      req.user = decoded;
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json("Admin access required");
    }

    req.user = { id: user._id, role: user.role };
    next();
  } catch {
    res.status(401).json("Invalid token");
  }
};
