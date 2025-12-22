const express = require("express");
const Trip = require("../models/Trip");
const auth = require("../models/middleware/authMiddleware");

const router = express.Router();

/*
 GET /api/trips
 Get all trips for logged-in user
 */
router.get("/", auth, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/*
 POST /api/trips
 Create a trip for logged-in user
 */
router.post("/", auth, async (req, res) => {
  try {
    const { destination, arrivalDate, departureDate, tripName, summary, coverImage } = req.body;

    if (!destination || !arrivalDate || !departureDate || !tripName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const trip = await Trip.create({
      userId: req.user.userId,
      destination,
      arrivalDate,
      departureDate,
      tripName,
      summary: summary || "",
      coverImage: coverImage || "",
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/*
 PUT /api/trips/:id
 Update a trip (only if it belongs to the user)
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: req.body },
      { new: true }
    );

    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/*
 DELETE /api/trips/:id
 Delete a trip (only if it belongs to the user)
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ message: "Trip not found" });
    res.json({ message: "Trip deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
/*
 POST /api/trips/:id/steps
 Create or update a step for a specific day (per-user)
*/
// Add Step to a Trip 
router.post("/:id/steps", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, title, overview, photos = [], spots = [] } = req.body;

    if (!date || !title) {
      return res.status(400).json({ message: "date and title are required" });
    }

    const trip = await Trip.findOne({ _id: id, user: req.userId });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Replace any existing step for that date 
    trip.steps = (trip.steps || []).filter((s) => s.date !== date);

    trip.steps.push({
      date,
      title,
      overview: overview || "",
      photos,
      spots,
    });

    await trip.save();
    res.json(trip);
  } catch (err) {
    console.error("POST /trips/:id/steps error:", err);
    res.status(500).json({ message: "Failed to create step" });
  }
});



module.exports = router;
