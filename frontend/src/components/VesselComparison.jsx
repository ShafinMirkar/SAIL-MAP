import React from "react";

export default function VesselComparison({ alternatives }) {
  if (!alternatives || alternatives.length === 0) return null;
  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>Vessel Comparison</h2>
        <span className="meta">Best option evaluated per feasible vessel class</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Class</th><th>Vessel</th><th>Capacity (t)</th><th>Freight Cost</th>
            <th>Fuel Cost</th><th>Total Expected Cost</th><th>Wait (days)</th><th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {alternatives.map((v, i) => (
            <tr key={i}>
              <td>{v.vesselClass}</td>
              <td>{v.vesselName}</td>
              <td>{v.cargoCapacity?.toLocaleString()}</td>
              <td>${v.freightCost?.toLocaleString()}</td>
              <td>${v.fuelCost?.toLocaleString()}</td>
              <td style={{ fontWeight: 600 }}>${v.totalExpectedCost?.toLocaleString()}</td>
              <td>{v.expectedWaitDays}</td>
              <td><span className={`tag risk-${v.riskLevel}`}>{v.riskLevel}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
