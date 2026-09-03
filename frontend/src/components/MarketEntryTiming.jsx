import React from "react";

export default function MarketEntryTiming({ timing }) {
  if (!timing || timing.length === 0) return null;
  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>Optimal Market Entry Timing</h2>
        <span className="meta">Comparing chartering windows</span>
      </div>
      {timing.map((t, i) => (
        <div className="ledger-row" key={i}>
          <span className="label">{t.period}</span>
          <span className="value">
            ${t.expectedFreightRate}/t
            <span style={{ color: "#5B6B76", fontWeight: 400, marginLeft: 8, fontSize: 12.5 }}>
              (${t.expectedRange[0]}–${t.expectedRange[1]}) · {t.recommendation}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
