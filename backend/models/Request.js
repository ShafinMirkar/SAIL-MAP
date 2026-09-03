const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  commodity: String,
  cargoQuantityTonnes: Number,
  cargoGrade: String,
  requiredDeliveryDate: Date,
  laycanStart: Date,
  laycanEnd: Date,
  numberOfVoyages: { type: Number, default: 1 },
  shipmentFrequency: String,

  originCountry: String,
  preferredLoadPort: String,   // "" => system selects

  preferredDischargePort: String, // "" => system evaluates multiple
  candidateDischargePorts: [String],

  preferredContractType: { type: String, enum: ["Spot", "ShortTerm", "MediumTerm", "LetSystemDecide"], default: "LetSystemDecide" },
  contractDurationMonths: Number,
  minCargoCommitment: Number,
  maxCargoCommitment: Number,

  preferredVesselClass: { type: String, default: "Any" },

  riskTolerance: { type: String, enum: ["Conservative", "Balanced", "Aggressive"], default: "Balanced" },
  maxAcceptableWaitingDays: Number,

  maxFreightBudgetUSD: Number,
  requiredDeliveryReliabilityPct: Number,
  maxAcceptableVoyageDurationDays: Number,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", RequestSchema);
