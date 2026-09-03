const mongoose = require("mongoose");

const CommodityMarketSchema = new mongoose.Schema({
  commodity: { type: String, required: true },
  date: { type: Date, required: true },
  price: Number,           // USD/tonne
  productionVolume: Number,
  exportVolume: Number,
  importVolume: Number,
  inventoryLevel: Number,
  indianDemandIndex: Number,
  steelSectorDemandIndex: Number,
});

module.exports = mongoose.model("CommodityMarket", CommodityMarketSchema);
