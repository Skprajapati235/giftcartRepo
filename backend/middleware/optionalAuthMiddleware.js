const jwt = require("jsonwebtoken");

// Attaches req.user if a valid JWT Bearer token is provided.
// Does NOT reject the request if token is missing or expired — simply leaves req.user = null.
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
  }
  next();
};
