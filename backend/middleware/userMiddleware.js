// middleware/userMiddleware.js
import jwt from "jsonwebtoken";
import { config } from "../config/default.js";

// Export as named function
export const verifyToken = function (req, res, next) {
  // Extract token from the Authorization header (Bearer token)
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Token Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    // Handle other JWT errors
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// Check your userMiddleware.js file for something like this
export const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // This part is likely failing - no user ID in the decoded token
    if (!decoded.userId) {
      throw new Error("Invalid token: no user ID found");
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};
