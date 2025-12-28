const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Query = require("../models/Query");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    if (!user.isAdmin) return res.status(403).json({ message: "Admin only" });

    req.userId = user._id;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * ============================
 * USER QUERIES
 * ============================
 */

router.get("/queries", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "6", 10), 1), 50);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Query.countDocuments(),
      Query.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("queryNumber email createdAt")
        .lean(),
    ]);

    const pages = Math.max(Math.ceil(total / limit), 1);

    return res.json({ items, page, pages, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/queries/:id", requireAdmin, async (req, res) => {
  try {
    const q = await Query.findById(req.params.id).lean();
    if (!q) return res.status(404).json({ message: "Query not found" });
    return res.json({ query: q });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/queries/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Query.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Query not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * ============================
 * USERS (ADMIN USER LIST)
 * ============================
 * Supports search by email/first/last/phone:
 * GET /api/admin/users?page=1&limit=6&search=rostislav
 */

router.get("/users", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "6", 10), 1), 50);
    const skip = (page - 1) * limit;

    const rawSearch = (req.query.search || "").trim();
    const filter = {};

    if (rawSearch) {
      const rx = new RegExp(rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { email: rx },
        { firstName: rx },
        { lastName: rx },
        { phone: rx },
      ];
    }

    const [total, items] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const pages = Math.max(Math.ceil(total / limit), 1);

    return res.json({ items, page, pages, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * Reset password approval + link generation
 * POST /api/admin/users/:id/reset-password
 * Returns: { resetLink, expiresAt }
 */
router.post("/users/:id/reset-password", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // prevent accidentally resetting admin through this UI
    if (user.isAdmin) {
      return res.status(400).json({ message: "Cannot reset admin password from this action" });
    }

    // create one-time token (send token to user via link; store only hash)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const expiresMs = 60 * 60 * 1000; // 1 hour
    const expiresAt = new Date(Date.now() + expiresMs);

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    const frontBase = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontBase}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;

    return res.json({ resetLink, expiresAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});
// DELETE /api/admin/users/:id  (delete user account)
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    // Stop deleting yourself (optional but recommended)
    if (String(id) === String(req.userId)) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent deleting admin accounts (recommended so you don't lock yourself out)
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot delete admin accounts" });
    }

    await User.findByIdAndDelete(id);
    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
