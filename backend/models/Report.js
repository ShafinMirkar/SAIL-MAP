const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
  generatedAt: { type: Date, default: Date.now },
  executiveRecommendation: mongoose.Schema.Types.Mixed,
  freightForecast: mongoose.Schema.Types.Mixed,
  marketEntryTiming: mongoose.Schema.Types.Mixed,
  vesselRecommendation: mongoose.Schema.Types.Mixed,
  portFeasibility: mongoose.Schema.Types.Mixed,
  costBreakdown: mongoose.Schema.Types.Mixed,
  contractStrategy: mongoose.Schema.Types.Mixed,
  riskAnalysis: mongoose.Schema.Types.Mixed,
  explainability: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("Report", ReportSchema);
