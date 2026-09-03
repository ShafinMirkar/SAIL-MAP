const mongoose = require("mongoose");

const FreightRateSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  origin: { type: String, required: true },       // origin country
  originPort: { type: String, required: true },
  destination: { type: String, required: true },  // destination port
  tradeRoute: { type: String, required: true },    // e.g. "Newcastle-Paradip"
  vesselClass: { type: String, required: true },
  rate: { type: Number, required: true },          // USD/tonne
  currency: { type: String, default: "USD" },
  contractType: { type: String, enum: ["Spot", "ShortTerm", "MediumTerm"], default: "Spot" },
  marketCondition: { type: String, enum: ["Bullish", "Bearish", "Neutral"], default: "Neutral" },
});

FreightRateSchema.index({ tradeRoute: 1, vesselClass: 1, date: 1 });

module.exports = mongoose.model("FreightRate", FreightRateSchema);
