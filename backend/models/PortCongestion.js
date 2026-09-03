const mongoose = require("mongoose");

const PortCongestionSchema = new mongoose.Schema({
  port: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  vesselsWaiting: Number,
  vesselsAtBerth: Number,
  berthOccupancyPct: Number,
  congestionIndex: Number, // 0-100
});

PortCongestionSchema.index({ port: 1, date: 1 });

module.exports = mongoose.model("PortCongestion", PortCongestionSchema);
