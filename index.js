const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("../routes/auth");
const tripsRoutes = require("../routes/trips");

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripsRoutes);


let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Serverless handler
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (e) {
    console.error("DB connection error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};
