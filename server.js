const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const tripsRoutes = require("./routes/trips");


const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripsRoutes);

// connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/adventurego")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
