const Report = require("../models/Report");

/**
 * Applies a what-if adjustment (Section 3.9) to an existing report's key figures
 * without re-querying the whole pipeline, so the UI can respond instantly.
 * Supported scenario types map to the 9 examples in the spec.
 */
function applyScenario(baseReport, scenario) {
  const r = JSON.parse(JSON.stringify(baseReport)); // deep clone, avoid mutating stored report
  const { type, value } = scenario;

  const adjust = (obj, path, factor) => {
    const keys = path.split(".");
    let ref = obj;
    for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
    ref[keys[keys.length - 1]] = Math.round(ref[keys[keys.length - 1]] * factor);
  };

  switch (type) {
    case "freightRateIncrease": {
      const factor = 1 + (value || 15) / 100;
      r.executiveRecommendation.expectedFreightRate = Number((r.executiveRecommendation.expectedFreightRate * factor).toFixed(2));
      adjust(r, "costBreakdown.freightCost", factor);
      r.costBreakdown.totalCost = r.costBreakdown.freightCost + r.costBreakdown.fuelCost + r.costBreakdown.portCharges + r.costBreakdown.demurrageCost + r.costBreakdown.positioningCost;
      r.executiveRecommendation.expectedTotalDeliveredCost = r.costBreakdown.totalCost;
      r.scenarioNote = `Freight rate increased by ${value || 15}%: total delivered cost re-estimated accordingly.`;
      break;
    }
    case "freightRateDecrease": {
      const factor = 1 - (value || 10) / 100;
      r.executiveRecommendation.expectedFreightRate = Number((r.executiveRecommendation.expectedFreightRate * factor).toFixed(2));
      adjust(r, "costBreakdown.freightCost", factor);
      r.costBreakdown.totalCost = r.costBreakdown.freightCost + r.costBreakdown.fuelCost + r.costBreakdown.portCharges + r.costBreakdown.demurrageCost + r.costBreakdown.positioningCost;
      r.executiveRecommendation.expectedTotalDeliveredCost = r.costBreakdown.totalCost;
      r.scenarioNote = `Freight rate decreased by ${value || 10}%: total delivered cost re-estimated accordingly.`;
      break;
    }
    case "congestionIncrease": {
      r.costBreakdown.expectedWaitDays = Number((r.costBreakdown.expectedWaitDays + (value || 3)).toFixed(1));
      r.costBreakdown.demurrageCost = Math.round(r.costBreakdown.demurrageCost + (value || 3) * 15000);
      r.costBreakdown.totalCost += r.costBreakdown.demurrageCost;
      r.riskAnalysis.overallRiskScore = Math.min(100, r.riskAnalysis.overallRiskScore + 15);
      r.riskAnalysis.overallRiskLevel = r.riskAnalysis.overallRiskScore > 65 ? "High" : r.riskAnalysis.overallRiskScore > 35 ? "Medium" : "Low";
      r.scenarioNote = `Destination port congestion increased: added ${value || 3} day(s) expected waiting, demurrage and risk score updated.`;
      break;
    }
    case "vesselUnavailable": {
      r.executiveRecommendation.summary = `Originally recommended vessel is now unavailable. Fallback to next-best feasible vessel class recommended: ${r.vesselRecommendation[1]?.vesselClass || "re-run optimizer required"}.`;
      r.scenarioNote = "Recommended vessel became unavailable — see updated summary for fallback guidance.";
      break;
    }
    case "cargoIncrease": {
      const factor = 1 + (value || 20) / 100;
      adjust(r, "costBreakdown.freightCost", factor);
      r.costBreakdown.totalCost = r.costBreakdown.freightCost + r.costBreakdown.fuelCost + r.costBreakdown.portCharges + r.costBreakdown.demurrageCost + r.costBreakdown.positioningCost;
      r.executiveRecommendation.expectedTotalDeliveredCost = r.costBreakdown.totalCost;
      r.scenarioNote = `Cargo quantity increased by ${value || 20}%: may require a larger vessel class — re-check feasibility.`;
      break;
    }
    case "deadlineMovedForward": {
      r.riskAnalysis.overallRiskScore = Math.min(100, r.riskAnalysis.overallRiskScore + 10);
      r.riskAnalysis.overallRiskLevel = r.riskAnalysis.overallRiskScore > 65 ? "High" : r.riskAnalysis.overallRiskScore > 35 ? "Medium" : "Low";
      r.scenarioNote = "Delivery deadline moved forward: reduced flexibility, spot market reliance more likely, risk score increased.";
      break;
    }
    case "alternatePort": {
      r.scenarioNote = `Alternate Indian port scenario requested (${value || "unspecified"}) — re-run optimizer with this port to get a full comparison.`;
      break;
    }
    case "fuelPriceIncrease": {
      const factor = 1 + (value || 15) / 100;
      adjust(r, "costBreakdown.fuelCost", factor);
      r.costBreakdown.totalCost = r.costBreakdown.freightCost + r.costBreakdown.fuelCost + r.costBreakdown.portCharges + r.costBreakdown.demurrageCost + r.costBreakdown.positioningCost;
      r.executiveRecommendation.expectedTotalDeliveredCost = r.costBreakdown.totalCost;
      r.scenarioNote = `Bunker fuel price increased by ${value || 15}%: total delivered cost re-estimated accordingly.`;
      break;
    }
    case "weatherDisruption": {
      r.costBreakdown.expectedWaitDays = Number((r.costBreakdown.expectedWaitDays + (value || 2)).toFixed(1));
      r.riskAnalysis.overallRiskScore = Math.min(100, r.riskAnalysis.overallRiskScore + 12);
      r.riskAnalysis.overallRiskLevel = r.riskAnalysis.overallRiskScore > 65 ? "High" : r.riskAnalysis.overallRiskScore > 35 ? "Medium" : "Low";
      r.scenarioNote = `Weather disruption scenario applied: added ${value || 2} day(s) delay risk, overall risk score increased.`;
      break;
    }
    default:
      r.scenarioNote = "Unrecognized scenario type — no changes applied.";
  }

  return r;
}

module.exports = { applyScenario };
