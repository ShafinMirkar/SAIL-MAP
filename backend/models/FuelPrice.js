const mongoose = require("mongoose");

const FuelPriceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  fuelType: { type: String, default: "VLSFO" },
  bunkerPrice: Number, // USD/MT
  crudePrice: Number,  // USD/bbl
});

module.exports = mongoose.model("FuelPrice", FuelPriceSchema);
