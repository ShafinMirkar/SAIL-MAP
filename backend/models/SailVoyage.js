const mongoose = require("mongoose");

const SailVoyageSchema = new mongoose.Schema({
  cargoRequirementTonnes: Number,
  commodity: String,
  origin: String,
  originPort: String,
  destination: String,
  vesselClass: String,
  vesselName: String,
  charterDate: Date,
  freightRate: Number,
  laycanStart: Date,
  laycanEnd: Date,
  actualLoadDate: Date,
  actualDischargeDate: Date,
  loadingTimeDays: Number,
  waitingTimeDays: Number,
  dischargeTimeDays: Number,
  demurrageUSD: Number,
  fuelCostUSD: Number,
  portCostUSD: Number,
  totalVoyageCostUSD: Number,
  contractType: { type: String, enum: ["Spot", "ShortTerm", "MediumTerm"] },
  operationalDelayDays: Number,
});

module.exports = mongoose.model("SailVoyage", SailVoyageSchema);
