import React from "react";

export default function Explainability({ explain }) {
  if (!explain) return null;
  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>Why This Recommendation</h2>
        <span className="meta">Recommended vessel class: {explain.recommendedVessel}</span>
      </div>
      <ul className="reasons-list">
        {explain.reasons?.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}
