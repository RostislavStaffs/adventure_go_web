const express = require("express");
const jwt = require("jsonwebtoken");
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

// GET /api/admin/queries?page=1&limit=6
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

    return res.json({
      items,
      page,
      pages,
      total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/queries/:id
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

// DELETE /api/admin/queries/:id
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

module.exports = router;
