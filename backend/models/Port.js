const mongoose = require("mongoose");

const PortSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  type: { type: String, enum: ["Load", "Discharge"], required: true },
  maxLOA: Number,
  maxBeam: Number,
  maxDraft: Number,
  maxDWT: Number,
  berths: Number,
  channelDepth: Number,
  loadingRate: Number,    // tonnes/day
  dischargeRate: Number,  // tonnes/day
  avgWaitTimeDays: Number,
  tidalRestriction: { type: Boolean, default: false },
  seasonalRestriction: { type: String, default: "None" },
});

module.exports = mongoose.model("Port", PortSchema);
