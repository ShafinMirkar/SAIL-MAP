const mongoose = require("mongoose");

const VesselSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true }, // Handysize | Supramax | Panamax | Capesize
  dwt: Number,
  cargoCapacity: Number,
  loa: Number,
  beam: Number,
  draft: Number,
  age: Number,
  ladenSpeed: Number,     // knots
  ballastSpeed: Number,   // knots
  fuelConsumptionLaden: Number,   // MT/day
  fuelConsumptionBallast: Number, // MT/day
  currentLocation: String,
  currentEmployment: { type: String, default: "Open" },
  availabilityDate: Date,
  etaLoadPort: Date,
  dailyHireRate: Number,     // USD/day
  demurrageRate: Number,     // USD/day
});

module.exports = mongoose.model("Vessel", VesselSchema);
