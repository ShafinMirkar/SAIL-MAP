const { optimizeChartering, compareContractStrategies } = require("./optimizerService");
const { forecastFreightRate } = require("./forecastService");
const Report = require("../models/Report");

/**
 * Builds the full Chartering Decision Report (Section 3.1 - 3.10) for a Request document.
 */
async function generateReport(requestDoc) {
  const evaluations = await optimizeChartering(requestDoc);
  if (evaluations.length === 0) {
    return { error: "No feasible vessel/port combination found for the given requirement." };
  }

  const best = evaluations[0];
  const tradeRoute = `${best.originPort}-${best.destinationPort}`;

  // 3.3 Market entry timing comparison (today / +7 / +14 / +30)
  const marketEntryTiming = [0, 7, 14, 30].map((offsetDays) => {
    const key = offsetDays === 0 ? "day7" : `day${offsetDays}`; // reuse forecast horizons as proxy
    const f = best.forecast.forecast[key] || best.forecast.forecast.day7;
    return {
      period: offsetDays === 0 ? "Charter Today" : `Charter in ${offsetDays} days`,
      expectedFreightRate: f.expectedRate,
      expectedRange: [f.low, f.high],
      recommendation: offsetDays === 0 ? "Baseline" : f.expectedRate < best.forecast.currentRate ? "Favorable — rates trending lower" : "Less favorable — rates trending higher",
    };
  });

  // 3.4 Vessel comparison across top alternatives (dedupe by vessel class, keep best per class)
  const seenClasses = new Set();
  const vesselAlternatives = [];
  for (const ev of evaluations) {
    if (seenClasses.has(ev.vessel.class)) continue;
    seenClasses.add(ev.vessel.class);
    vesselAlternatives.push({
      vesselClass: ev.vessel.class,
      vesselName: ev.vessel.name,
      cargoCapacity: ev.vessel.cargoCapacity,
      freightCost: ev.cost.freightCost,
      fuelCost: ev.cost.fuelCost,
      totalExpectedCost: ev.cost.totalCost,
      expectedWaitDays: ev.cost.expectedWaitDays,
      riskLevel: ev.risk.overallRiskLevel,
    });
    if (vesselAlternatives.length >= 4) break;
  }

  const contractStrategy = compareContractStrategies({
    bestEvaluation: best,
    numberOfVoyages: requestDoc.numberOfVoyages || 1,
    forecast: best.forecast,
  });

  const executiveRecommendation = {
    cargoRequirement: `${requestDoc.cargoQuantityTonnes} tonnes of ${requestDoc.commodity}`,
    origin: best.originPort,
    destination: best.destinationPort,
    recommendedVessel: `${best.vessel.class} (${best.vessel.name})`,
    recommendedCharteringWindow: "Next 7-14 days",
    recommendedContractType: contractStrategy.recommended,
    expectedFreightRate: best.forecast.forecast.day14.expectedRate,
    expectedTotalDeliveredCost: best.cost.totalCost,
    overallRiskLevel: best.risk.overallRiskLevel,
    summary: `Charter a ${best.vessel.class} vessel from ${best.originPort} to ${best.destinationPort} within the next 7-14 days under a ${contractStrategy.recommended.toLowerCase()} strategy, as freight is trending ${best.forecast.trendDirection.toLowerCase()}, the vessel is feasible at both ports, and this combination provides the lowest expected total delivered cost at an acceptable (${best.risk.overallRiskLevel.toLowerCase()}) risk level.`,
  };

  const portFeasibility = {
    loadPort: best.originPort,
    dischargePort: best.destinationPort,
    vessel: best.vessel.name,
    status: "Feasible",
    checks: [
      `LOA ${best.vessel.loa}m, Beam ${best.vessel.beam}m, Draft ${best.vessel.draft}m, DWT ${best.vessel.dwt} — within limits at both ports.`,
      `Expected discharge-port waiting time: ${best.cost.expectedWaitDays} day(s).`,
    ],
  };

  const explainability = {
    recommendedVessel: best.vessel.class,
    reasons: [
      `Meets required cargo capacity (${best.vessel.cargoCapacity} tonnes capacity vs ${Math.round(requestDoc.cargoQuantityTonnes / (requestDoc.numberOfVoyages || 1))} tonnes required per voyage).`,
      "Compatible with both origin and destination port infrastructure constraints.",
      "Provides the lowest expected total delivered cost among feasible alternatives evaluated.",
      `Vessel availability aligns with required laycan (available vessel, class ${best.vessel.class}).`,
      ...best.risk.reasons.slice(0, 2),
    ],
  };

  const reportData = {
    executiveRecommendation,
    freightForecast: best.forecast,
    marketEntryTiming,
    vesselRecommendation: vesselAlternatives,
    portFeasibility,
    costBreakdown: best.cost,
    contractStrategy,
    riskAnalysis: best.risk,
    explainability,
  };

  const saved = await Report.create({ request: requestDoc._id, ...reportData });
  return saved;
}

module.exports = { generateReport };
