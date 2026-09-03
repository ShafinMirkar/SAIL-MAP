const Vessel = require("../models/Vessel");
const Port = require("../models/Port");
const { forecastFreightRate } = require("./forecastService");
const { getFeasibleVessels } = require("./feasibilityService");
const { computeVoyageCost } = require("./costService");
const { assessRisk } = require("./riskService");
const { DESTINATION_PORTS } = require("../utils/constants");

const RISK_WEIGHT_BY_TOLERANCE = { Conservative: 1.5, Balanced: 1.0, Aggressive: 0.5 };

/**
 * Core optimization pipeline: for a request, evaluates candidate discharge ports,
 * feasible vessels, forecasted cost and risk, and ranks the combinations to produce
 * a single best recommendation plus full comparison data.
 */
async function optimizeChartering(request) {
  const candidateDestPorts = request.candidateDischargePorts?.length
    ? request.candidateDischargePorts
    : request.preferredDischargePort
    ? [request.preferredDischargePort]
    : DESTINATION_PORTS.map((p) => p.name);

  const originPort = request.preferredLoadPort || null;

  const allEvaluations = [];

  for (const destPortName of candidateDestPorts) {
    // Resolve origin port(s): if not specified, try all load ports for the origin country
    const originPortDocs = originPort
      ? await Port.find({ name: originPort })
      : await Port.find({ country: request.originCountry, type: "Load" });

    for (const originDoc of originPortDocs) {
      const feasibility = await getFeasibleVessels({
        loadPortName: originDoc.name,
        dischargePortName: destPortName,
        minCargoTonnes: request.cargoQuantityTonnes / (request.numberOfVoyages || 1),
        preferredVesselClass: request.preferredVesselClass,
      });
      if (feasibility.error || feasibility.feasibleCount === 0) continue;

      const feasibleVessels = feasibility.results.filter((r) => r.feasible);

      for (const fv of feasibleVessels.slice(0, 8)) { // cap for performance
        const tradeRoute = `${originDoc.name}-${destPortName}`;
        const forecast = await forecastFreightRate(tradeRoute, fv.vessel.class);
        if (forecast.error) continue;

        const cargoPerVoyage = Math.round(request.cargoQuantityTonnes / (request.numberOfVoyages || 1));
        const cost = await computeVoyageCost({
          vessel: fv.vessel,
          originPortName: originDoc.name,
          destinationPortName: destPortName,
          forecastRate: forecast.forecast.day14.expectedRate,
          cargoTonnes: cargoPerVoyage,
        });

        const risk = await assessRisk({
          destinationPortName: destPortName,
          originPortName: originDoc.name,
          vessel: fv.vessel,
          forecastVolatility: forecast.volatility,
          currentRate: forecast.currentRate,
        });

        const riskWeight = RISK_WEIGHT_BY_TOLERANCE[request.riskTolerance] || 1.0;
        const score = cost.totalCost * (1 + (risk.overallRiskScore / 100) * riskWeight * 0.5);

        allEvaluations.push({
          originPort: originDoc.name,
          destinationPort: destPortName,
          vessel: fv.vessel,
          forecast,
          cost,
          risk,
          score,
        });
      }
    }
  }

  allEvaluations.sort((a, b) => a.score - b.score);
  return allEvaluations;
}

/**
 * Compares contract strategies (Section 3.7): single spot, multi-spot,
 * short-term multi-voyage, medium-term multi-voyage.
 */
function compareContractStrategies({ bestEvaluation, numberOfVoyages, forecast }) {
  const perVoyageCost = bestEvaluation.cost.totalCost;
  const volatilityFactor = forecast.volatility / forecast.currentRate;

  const strategies = [
    {
      type: "Single Spot Voyage",
      description: "One-off spot charter, no forward commitment.",
      expectedTotalCost: perVoyageCost,
      freightRateExposure: "Full exposure per voyage — repriced every time.",
      marketRisk: "High (re-enters volatile spot market each voyage)",
      flexibility: "Highest",
    },
    {
      type: "Multiple Spot Voyages",
      description: `${numberOfVoyages} separate spot charters over the period.`,
      expectedTotalCost: Math.round(perVoyageCost * numberOfVoyages * (1 + volatilityFactor * 0.4)),
      freightRateExposure: "Full exposure, compounded across each voyage.",
      marketRisk: "High — cumulative volatility risk across voyages",
      flexibility: "High",
    },
    {
      type: "Short-Term Multi-Voyage Contract (COA)",
      description: `${numberOfVoyages} voyages locked under one contract, 3-6 month tenor.`,
      expectedTotalCost: Math.round(perVoyageCost * numberOfVoyages * (1 - 0.04 + volatilityFactor * 0.15)),
      freightRateExposure: "Partially hedged — rate fixed or banded for tenor.",
      marketRisk: "Medium",
      flexibility: "Medium",
    },
    {
      type: "Medium-Term Multi-Voyage Contract (COA)",
      description: `${numberOfVoyages}+ voyages locked under one contract, 6-12 month tenor.`,
      expectedTotalCost: Math.round(perVoyageCost * numberOfVoyages * (1 - 0.08 + volatilityFactor * 0.1)),
      freightRateExposure: "Well hedged — rate fixed for most of the tenor.",
      marketRisk: "Low-Medium",
      flexibility: "Lower — less able to react to falling rates",
    },
  ];

  const recommended = strategies.reduce((best, s) => (s.expectedTotalCost < best.expectedTotalCost ? s : best), strategies[0]);
  return { strategies, recommended: recommended.type };
}

module.exports = { optimizeChartering, compareContractStrategies };
