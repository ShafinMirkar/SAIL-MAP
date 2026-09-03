import React, { useState } from "react";

const SCENARIOS = [
  { type: "freightRateIncrease", label: "Freight +15%", value: 15 },
  { type: "freightRateDecrease", label: "Freight −10%", value: 10 },
  { type: "congestionIncrease", label: "Congestion Up", value: 3 },
  { type: "vesselUnavailable", label: "Vessel Unavailable", value: null },
  { type: "cargoIncrease", label: "Cargo +20%", value: 20 },
  { type: "deadlineMovedForward", label: "Deadline Moved Up", value: null },
  { type: "fuelPriceIncrease", label: "Fuel +15%", value: 15 },
  { type: "weatherDisruption", label: "Weather Disruption", value: 2 },
];

export default function ScenarioSimulator({ onRun, activeType, note, loading }) {
  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>What-If Scenario Simulator</h2>
        <span className="meta">Recalculates the report under alternative conditions</span>
      </div>
      <div className="scenario-bar">
        {SCENARIOS.map((s) => (
          <button
            key={s.type}
            className={`btn-secondary ${activeType === s.type ? "active" : ""}`}
            onClick={() => onRun(s)}
            disabled={loading}
          >
            {s.label}
          </button>
        ))}
      </div>
      {note && <div className="scenario-note">{note}</div>}
    </div>
  );
}
