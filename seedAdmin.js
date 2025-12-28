const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); 

async function seedAdmin() {
  try {
    await mongoose.connect("mongodb://localhost:27017/adventurego");

    const adminEmail = "admin@adventurego.com";
    const adminPassword = "AdminPass123!"; 

    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      firstName: "Admin",
      lastName: "Account",
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
    });

    console.log("🚀 Admin account created");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  }
}

seedAdmin();
