import React from "react";

export default function ContractStrategy({ strategy }) {
  if (!strategy) return null;
  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>Contract Strategy Analysis</h2>
        <span className="meta">Recommended: {strategy.recommended}</span>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Strategy</th><th>Expected Total Cost</th><th>Market Risk</th><th>Flexibility</th></tr>
        </thead>
        <tbody>
          {strategy.strategies?.map((s, i) => (
            <tr key={i} style={s.type === strategy.recommended ? { background: "#FBF3E6" } : {}}>
              <td style={{ fontWeight: s.type === strategy.recommended ? 600 : 400 }}>{s.type}</td>
              <td>${s.expectedTotalCost?.toLocaleString()}</td>
              <td>{s.marketRisk}</td>
              <td>{s.flexibility}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
