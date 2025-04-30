import jwt from "jsonwebtoken";
import { config } from "../config/default.js";  // Named import
import User from "../models/User.js";

// User authentication middleware
const verifyUserToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (decoded.isHost) {
      return res.status(403).json({ message: "Invalid token type. Host token used for user access." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Token Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    return res.status(401).json({ message: "Token is not valid" });
  }
};

// Host authentication middleware
const verifyHostToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (!decoded.isHost) {
      return res.status(403).json({ message: "Invalid token type. User token used for host access." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Token Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    return res.status(401).json({ message: "Token is not valid" });
  }
};

// Generic token verification (can be either user or host)
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.id || decoded.userId,
      isHost: decoded.isHost || false
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    return res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

// Add a verifyToken alias for backward compatibility
const verifyToken = auth;

export {
  verifyUserToken,
  verifyHostToken,
  auth,
  verifyToken
};
