import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Host from "../models/Host.js";

// Authenticate user tokens
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.type === "user") {
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        userId: decodedToken.userId,
        email: user.email,
        role: "user"
      };

      const host = await Host.findOne({ user: decodedToken.userId });
      if (host) {
        req.user.hostId = host.hostID;
      }
    } else if (decodedToken.type === "host") {
      const host = await Host.findOne({ hostID: decodedToken.hostId });
      if (!host) {
        return res.status(401).json({ message: "Host not found" });
      }

      req.user = {
        hostId: decodedToken.hostId,
        email: host.email,
        role: "host"
      };

      if (host.user) {
        req.user.userId = host.user;
      }
    } else {
      return res.status(401).json({ message: "Invalid token type" });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

// Check if user has host privileges
const authorizeHost = (req, res, next) => {
  if (!req.user || !req.user.hostId) {
    return res.status(403).json({ message: "Host privileges required" });
  }
  next();
};

export { authenticateUser, authorizeHost };
