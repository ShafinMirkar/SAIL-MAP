const FuelPrice = require("../models/FuelPrice");
const PortCongestion = require("../models/PortCongestion");
const { getDistance } = require("../utils/distance");

/**
 * Computes the "Expected Total Delivered Cost" for a vessel on a given route
 * (Section 3.6): freight + fuel + port charges + waiting/demurrage + positioning.
 */
async function computeVoyageCost({ vessel, originPortName, destinationPortName, forecastRate, cargoTonnes }) {
  const distance = getDistance(originPortName, destinationPortName);
  const ladenSpeed = vessel.ladenSpeed || 13;
  const voyageDays = distance / (ladenSpeed * 24);

  const latestFuel = await FuelPrice.findOne().sort({ date: -1 });
  const bunkerPrice = latestFuel ? latestFuel.bunkerPrice : 550;
  const fuelCost = voyageDays * (vessel.fuelConsumptionLaden || 30) * bunkerPrice;

  // Port charges: rough proxy based on DWT
  const portCharges = Math.round(vessel.dwt * 1.1);

  // Expected waiting time from destination congestion index
  const congestion = await PortCongestion.findOne({ port: destinationPortName }).sort({ date: -1 });
  const congestionIndex = congestion ? congestion.congestionIndex : 40;
  const expectedWaitDays = Math.max(0, (congestionIndex - 40) / 15); // >40 index starts generating wait

  const demurrageCost = expectedWaitDays > 1 ? (expectedWaitDays - 1) * (vessel.demurrageRate || 15000) : 0;

  const freightCost = forecastRate * cargoTonnes;

  // Positioning/deadheading cost proxy (ballast leg to load port), simplified as % of hire
  const positioningCost = Math.round((vessel.dailyHireRate || 15000) * 1.5);

  const totalCost = Math.round(freightCost + fuelCost + portCharges + demurrageCost + positioningCost);

  return {
    distanceNM: Math.round(distance),
    voyageDays: Number(voyageDays.toFixed(1)),
    freightCost: Math.round(freightCost),
    fuelCost: Math.round(fuelCost),
    portCharges,
    expectedWaitDays: Number(expectedWaitDays.toFixed(1)),
    demurrageCost: Math.round(demurrageCost),
    positioningCost,
    totalCost,
  };
}

module.exports = { computeVoyageCost };
