const mongoose = require("mongoose");

const SpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    note: { type: String, default: "" }, 
    photo: { type: String, default: "" }, 
  },
  { _id: false }
);

const StepSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD"
    title: { type: String, required: true },
    overview: { type: String, default: "" },
    photos: { type: [String], default: [] }, // base64 strings
    spots: { type: [SpotSchema], default: [] },
  },
  { timestamps: true }
);

const TripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    destination: { type: String, required: true },
    arrivalDate: { type: String, required: true },
    departureDate: { type: String, required: true },

    tripName: { type: String, required: true },
    summary: { type: String, default: "" },

    coverImage: { type: String, default: "" },

    
    steps: { type: [StepSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", TripSchema);
