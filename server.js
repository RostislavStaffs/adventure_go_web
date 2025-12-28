require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const tripsRoutes = require("./routes/trips");
const User = require("./models/User");

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/admin", adminRoutes);

// Admin bootstrap (runs every start, creates only if missing)
async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@adventurego.com";

  // This is the actual admin account login password (the "Password" field on the admin login page)
  const adminAccountPassword =
    process.env.ADMIN_ACCOUNT_PASSWORD || "AdminAccountPass123!";

  if (!adminEmail || !adminAccountPassword) {
    console.warn("ADMIN_EMAIL or ADMIN_ACCOUNT_PASSWORD missing. Skipping admin creation.");
    return;
  }

  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    if (!existing.isAdmin) {
      existing.isAdmin = true;
      await existing.save();
      console.log("Existing user updated to admin:", adminEmail);
    } else {
      console.log("Admin exists:", adminEmail);
    }


    // Set ADMIN_RESET_PASSWORD_ON_START=true in .env to enable
    if ((process.env.ADMIN_RESET_PASSWORD_ON_START || "").toLowerCase() === "true") {
      const hashed = await bcrypt.hash(adminAccountPassword, 10);
      existing.password = hashed;
      await existing.save();
      console.log("Admin password reset from .env for:", adminEmail);
    }

    return;
  }

  const hashed = await bcrypt.hash(adminAccountPassword, 10);

  await User.create({
    firstName: "Admin",
    lastName: "Account",
    email: adminEmail,
    password: hashed,
    isAdmin: true,
  });

  console.log("Admin created:", adminEmail);
}

// Use .env if available
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/adventurego";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await ensureAdminUser();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
