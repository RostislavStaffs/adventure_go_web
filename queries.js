const express = require("express");
const Query = require("../models/Query");

const router = express.Router();

async function generateUniqueQueryNumber() {
  // Try random numbers first
  for (let i = 0; i < 25; i++) {
    const n = Math.floor(Math.random() * 1000) + 1; // 1..1000
    const exists = await Query.exists({ queryNumber: n });
    if (!exists) return n;
  }

  // Fallback: find a free number deterministically
  const used = await Query.find().select("queryNumber -_id").lean();
  const usedSet = new Set(used.map((x) => x.queryNumber));

  for (let n = 1; n <= 1000; n++) {
    if (!usedSet.has(n)) return n;
  }

  throw new Error("No available query numbers (1-1000 exhausted)");
}

// POST /api/queries
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }
    if (String(message).length > 250) {
      return res.status(400).json({ message: "Message must be 250 characters or less" });
    }

    // Attempt create with unique queryNumber; handle rare race collisions
    for (let attempt = 0; attempt < 5; attempt++) {
      const queryNumber = await generateUniqueQueryNumber();

      try {
        const created = await Query.create({
          queryNumber,
          firstName: firstName || "",
          lastName: lastName || "",
          email: email.trim(),
          phone: phone || "",
          message: message.trim(),
        });

        return res.status(201).json({
          message: "Query submitted",
          query: {
            id: created._id,
            queryNumber: created.queryNumber,
            email: created.email,
            createdAt: created.createdAt,
          },
        });
      } catch (err) {
        // Duplicate key (queryNumber) -> retry
        if (err && err.code === 11000) continue;
        throw err;
      }
    }

    return res.status(500).json({ message: "Could not generate unique query id" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
