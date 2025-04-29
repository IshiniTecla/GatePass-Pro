import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Adjust the path if necessary
import Host from '../models/Host.js';  // Adjust the path if necessary

// Add a check for token expiration
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }
    
    const token = authHeader.split(" ")[1];
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    if (decodedToken.exp * 1000 < Date.now()) {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }
    
    const { type, userId, hostId } = decodedToken;
    
    if (type === "user") {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = {
        userId,
        email: user.email,
        role: "user"
      };
      const host = await Host.findOne({ user: userId });
      if (host) {
        req.user.hostId = host.hostID;
      }
    } else if (type === "host") {
      const host = await Host.findOne({ hostID: hostId });
      if (!host) {
        return res.status(401).json({ message: "Host not found" });
      }
      req.user = {
        hostId,
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

export default authenticateUser;
