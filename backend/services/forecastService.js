const FreightRate = require("../models/FreightRate");

// Simple linear regression: returns {slope, intercept}
function linearRegression(values) {
  const n = values.length;
  const xs = values.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (values[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

function stdDev(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// Exponential moving average (smoothed trend line)
function ema(values, period = 14) {
  const k = 2 / (period + 1);
  let emaVal = values[0];
  const out = [emaVal];
  for (let i = 1; i < values.length; i++) {
    emaVal = values[i] * k + emaVal * (1 - k);
    out.push(emaVal);
  }
  return out;
}

/**
 * Produces a freight-rate forecast for a route/vessel-class combination using the
 * last 120 days of history: EMA-smoothed trend + linear regression projection,
 * with a volatility-based confidence band.
 */
async function forecastFreightRate(tradeRoute, vesselClass) {
  const history = await FreightRate.find({ tradeRoute, vesselClass })
    .sort({ date: 1 })
    .limit(100000);

  if (history.length < 30) {
    return { error: "Insufficient historical data for this route/vessel class." };
  }

  const recent = history.slice(-120);
  const rates = recent.map((r) => r.rate);
  const smoothed = ema(rates, 14);
  const { slope, intercept } = linearRegression(smoothed);
  const volatility = stdDev(rates.slice(-30));
  const currentRate = rates[rates.length - 1];

  const horizons = [7, 14, 30, 60];
  const forecast = {};
  horizons.forEach((h) => {
    const projected = intercept + slope * (smoothed.length - 1 + h);
    const confidenceWidth = volatility * Math.sqrt(h / 7); // uncertainty grows with horizon
    forecast[`day${h}`] = {
      expectedRate: Number(projected.toFixed(2)),
      low: Number((projected - confidenceWidth).toFixed(2)),
      high: Number((projected + confidenceWidth).toFixed(2)),
    };
  });

  const trendDirection = slope > 0.02 ? "Rising" : slope < -0.02 ? "Falling" : "Stable";

  return {
    tradeRoute,
    vesselClass,
    currentRate: Number(currentRate.toFixed(2)),
    trendDirection,
    dailySlope: Number(slope.toFixed(4)),
    volatility: Number(volatility.toFixed(2)),
    forecast,
    history: recent.map((r) => ({ date: r.date, rate: r.rate })),
    influencingFactors: [
      trendDirection === "Rising"
        ? "Recent 120-day trend shows sustained upward pressure on rates for this route."
        : trendDirection === "Falling"
        ? "Recent 120-day trend shows softening rates for this route."
        : "Rates have been range-bound with no strong directional trend.",
      volatility > currentRate * 0.08
        ? "Above-average volatility detected — wider confidence bands apply."
        : "Volatility is within normal historical range.",
    ],
  };
}

module.exports = { forecastFreightRate, linearRegression, stdDev, ema };
