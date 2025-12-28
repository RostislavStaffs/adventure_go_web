const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      password: hashed,
    });

    return res.status(201).json({ message: "User created", userId: user._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login success",
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        userId: user._id,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ADMIN LOGIN
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password, adminId } = req.body;

    if (!email || !password || !adminId) {
      return res
        .status(400)
        .json({ message: "Email, password and adminId are required" });
    }

    const expectedAdminId = process.env.ADMIN_PASSWORD || "admin123";
    if (adminId !== expectedAdminId) {
      return res.status(401).json({ message: "Invalid Admin ID" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Not an admin account" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Admin login success",
      token,
      user: {
        email: user.email,
        userId: user._id,
        isAdmin: true,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone, email, avatarBase64 } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phone, email, avatarBase64 },
      { new: true, runValidators: true }
    ).select("-password");

    return res.json({ message: "Updated", user: updated });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * RESET PASSWORD (used by ResetPasswordPage)
 * POST /api/auth/reset-password
 * Body: { email, token, newPassword }
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token and newPassword are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
      return res.status(403).json({ message: "Reset not approved for this account" });
    }

    if (new Date(user.passwordResetExpiresAt).getTime() < Date.now()) {
      return res.status(403).json({ message: "Reset link expired" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== user.passwordResetTokenHash) {
      return res.status(401).json({ message: "Invalid reset link" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    // clear token so the link cannot be reused
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    await user.save();

    return res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
