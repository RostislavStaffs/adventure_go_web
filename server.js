const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");


const app = express();

// middleware
app.use(cors());


app.use(express.json());
app.use("/api/auth", authRoutes);

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
