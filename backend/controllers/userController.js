import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/emailService.js";

// Register User and Send Email
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if email is in valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const fullName = `${firstName} ${lastName}`;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Save the user with plain password (no hashing)
    const user = new User({ firstName, lastName, email, password });
    await user.save();

    // Generate custom styled welcome email
    const subject = "Welcome to GetPass Pro!";
    const html = `
      <html>...</html>
    `;

    // Plain text version as fallback
    const text = `
      Welcome to GetPass Pro, ${fullName}!
    `;

    try {
      // Log before sending email for debugging
      console.log(`Attempting to send welcome email to: ${email}`);

      // Send email using the email service
      await sendEmail(email, subject, text, html);
      console.log(`Welcome email sent successfully to: ${email}`);

      // Send success response
      res
        .status(201)
        .json({ message: "User registered successfully and email sent." });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);

      // Even if email fails, user is registered
      res.status(201).json({
        message:
          "User registered successfully, but welcome email could not be sent.",
        emailError: emailError.message,
      });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: error.stack,
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Direct password comparison (plain text)
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role, // Add the user's role to the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with password
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password is correct (plain text comparison)
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update with new password (plain text)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  try {
    // Check if email is already in use (by another user)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, email },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    // Remove user
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile by email
export const getprofile = async (req, res) => {
  try {
    const email = req.query.email; // Get email from query params

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Send password reset email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create reset link
    const resetLink = `${
      process.env.BASE_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;

    // Create email content with matching GetPass Pro styling
    const subject = "Password Reset Request";
    const htmlContent = `
      <html>...</html>
    `;

    const textContent = `
      Password Reset Request - GetPass Pro

      Dear ${user.firstName} ${user.lastName},

      We've received a request to reset your password for your GetPass Pro account. 
      To proceed with the password reset, please use the following link:

      ${resetLink}

      This link will expire in 1 hour.

      Important: If you didn't request this password reset, please ignore this email or contact support if you have concerns about your account security.

      Stay secure,
      The GetPass Pro Team
    `;

    try {
      // Log before sending email for debugging
      console.log(`Attempting to send password reset email to: ${email}`);

      // Send password reset email
      await sendEmail(email, subject, textContent, htmlContent);
      console.log(`Password reset email sent successfully to: ${email}`);

      res.status(200).json({ message: "Password reset email sent" });
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
      res.status(500).json({
        message: "Failed to send password reset email",
        error: emailError.message,
      });
    }
  } catch (error) {
    console.error("Error processing reset request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Validate the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Match the expiration time used in login
    );

    res.json({
      token: newAccessToken,
      role: user.role,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ message: "Failed to refresh token" });
  }
};
