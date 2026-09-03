import React from "react";

const fmtUSD = (n) => n == null ? "—" : `$${Number(n).toLocaleString()}`;

export default function ExecutiveSummary({ rec }) {
  if (!rec) return null;
  return (
    <div className="panel exec-panel">
      <div className="panel-title-row">
        <h2>Executive Recommendation</h2>
        <span className={`tag risk-${rec.overallRiskLevel}`}>{rec.overallRiskLevel} Risk</span>
      </div>
      <p className="exec-summary">{rec.summary}</p>
      <div className="exec-grid">
        <div className="exec-stat"><div className="k">Route</div><div className="v" style={{ fontSize: 16 }}>{rec.origin} → {rec.destination}</div></div>
        <div className="exec-stat"><div className="k">Recommended Vessel</div><div className="v" style={{ fontSize: 16 }}>{rec.recommendedVessel}</div></div>
        <div className="exec-stat"><div className="k">Contract Type</div><div className="v" style={{ fontSize: 16 }}>{rec.recommendedContractType}</div></div>
        <div className="exec-stat"><div className="k">Chartering Window</div><div className="v">{rec.recommendedCharteringWindow}</div></div>
        <div className="exec-stat"><div className="k">Expected Freight Rate</div><div className="v">${rec.expectedFreightRate}/t</div></div>
        <div className="exec-stat"><div className="k">Expected Total Delivered Cost</div><div className="v">{fmtUSD(rec.expectedTotalDeliveredCost)}</div></div>
      </div>
    </div>
  );
}
