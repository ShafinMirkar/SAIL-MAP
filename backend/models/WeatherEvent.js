const mongoose = require("mongoose");

const WeatherEventSchema = new mongoose.Schema({
  region: { type: String, required: true }, // port or route corridor
  date: { type: Date, required: true },
  type: { type: String, enum: ["Cyclone", "Storm", "HeavyRain", "RoughSea", "None"], default: "None" },
  severity: { type: Number, min: 0, max: 5, default: 0 },
  expectedDelayDays: { type: Number, default: 0 },
});

module.exports = mongoose.model("WeatherEvent", WeatherEventSchema);
