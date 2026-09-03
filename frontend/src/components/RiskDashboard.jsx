import React from "react";

const DIMENSIONS = [
  { key: "marketRisk", label: "Market Volatility", max: 25 },
  { key: "congestionRisk", label: "Port Congestion", max: 25 },
  { key: "availabilityRisk", label: "Vessel Availability", max: 15 },
  { key: "weatherRisk", label: "Weather", max: 20 },
  { key: "geoRisk", label: "Geopolitical", max: 15 },
];

export default function RiskDashboard({ risk }) {
  if (!risk) return null;
  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>Risk Analysis</h2>
        <span className={`tag risk-${risk.overallRiskLevel}`}>{risk.overallRiskScore}/100 — {risk.overallRiskLevel}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {DIMENSIONS.map((d) => {
          const val = risk.breakdown?.[d.key] || 0;
          const pct = Math.min(100, (val / d.max) * 100);
          return (
            <div key={d.key}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span style={{ color: "#5B6B76" }}>{d.label}</span>
                <span style={{ fontWeight: 600 }}>{val}/{d.max}</span>
              </div>
              <div style={{ height: 6, background: "#EDE8DA" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct > 65 ? "#B33F35" : pct > 35 ? "#C08A2E" : "#4C7A5E" }} />
              </div>
            </div>
          );
        })}
      </div>
      <ul className="reasons-list">
        {risk.reasons?.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}
