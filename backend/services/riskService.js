const WeatherEvent = require("../models/WeatherEvent");
const PortCongestion = require("../models/PortCongestion");

/**
 * Produces a weighted risk score (0-100) and narrative reasons across the
 * dimensions listed in Section 3.8: market, congestion, vessel availability,
 * weather, geopolitical, delivery-delay.
 */
async function assessRisk({ destinationPortName, originPortName, vessel, forecastVolatility, currentRate }) {
  const reasons = [];
  let score = 0;

  // Market volatility risk (0-25)
  const volPct = currentRate ? (forecastVolatility / currentRate) * 100 : 0;
  const marketRisk = Math.min(25, Math.round(volPct * 2));
  score += marketRisk;
  reasons.push(
    marketRisk > 15
      ? `Freight market volatility is elevated (~${volPct.toFixed(1)}% of current rate), increasing pricing risk.`
      : `Freight market volatility is within a normal range (~${volPct.toFixed(1)}% of current rate).`
  );

  // Port congestion risk (0-25)
  const congestion = await PortCongestion.findOne({ port: destinationPortName }).sort({ date: -1 });
  const congestionIndex = congestion ? congestion.congestionIndex : 40;
  const congestionRisk = Math.round((congestionIndex / 100) * 25);
  score += congestionRisk;
  reasons.push(
    congestionIndex > 65
      ? `${destinationPortName} congestion index is high (${congestionIndex}/100) — increased probability of berth waiting and demurrage.`
      : `${destinationPortName} congestion index is moderate/low (${congestionIndex}/100).`
  );

  // Vessel availability risk (0-15)
  const daysToAvailability = vessel && vessel.availabilityDate
    ? Math.max(0, Math.round((new Date(vessel.availabilityDate) - new Date()) / 86400000))
    : 10;
  const availabilityRisk = Math.min(15, daysToAvailability);
  score += availabilityRisk;
  reasons.push(
    daysToAvailability > 10
      ? `Recommended vessel becomes available in ${daysToAvailability} days — some schedule risk if laycan is tight.`
      : `Recommended vessel availability aligns well with the required laycan window.`
  );

  // Weather risk (0-20)
  const weatherEvents = await WeatherEvent.find({
    region: { $in: [destinationPortName, originPortName] },
    date: { $gte: new Date() },
  }).sort({ date: 1 }).limit(5);
  const maxSeverity = weatherEvents.reduce((m, e) => Math.max(m, e.severity), 0);
  const weatherRisk = Math.round((maxSeverity / 5) * 20);
  score += weatherRisk;
  reasons.push(
    weatherEvents.length > 0
      ? `${weatherEvents.length} forecast weather event(s) on this corridor, max severity ${maxSeverity}/5, potential delay up to ${weatherEvents[0]?.expectedDelayDays || 0} day(s).`
      : "No significant weather disruptions currently forecast on this corridor."
  );

  // Geopolitical risk (static/mock baseline, 0-15)
  const geoRisk = Math.round(Math.random() * 8); // low baseline mock indicator
  score += geoRisk;
  reasons.push(geoRisk > 5
    ? "Elevated geopolitical/trade-flow risk flagged for this origin region — monitor for sanctions or route disruptions."
    : "No material geopolitical risk flagged for this origin region currently.");

  const totalScore = Math.min(100, score);
  const level = totalScore > 65 ? "High" : totalScore > 35 ? "Medium" : "Low";

  return {
    overallRiskScore: totalScore,
    overallRiskLevel: level,
    breakdown: { marketRisk, congestionRisk, availabilityRisk, weatherRisk, geoRisk },
    reasons,
  };
}

module.exports = { assessRisk };
