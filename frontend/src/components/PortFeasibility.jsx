import React from "react";

export default function PortFeasibility({ feasibility }) {
  if (!feasibility) return null;
  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>Port Feasibility</h2>
        <span className={`tag feasible-${feasibility.status === "Feasible"}`}>{feasibility.status}</span>
      </div>
      <div className="ledger-row"><span className="label">Load Port</span><span className="value">{feasibility.loadPort}</span></div>
      <div className="ledger-row"><span className="label">Discharge Port</span><span className="value">{feasibility.dischargePort}</span></div>
      <div className="ledger-row"><span className="label">Vessel</span><span className="value">{feasibility.vessel}</span></div>
      <ul className="reasons-list" style={{ marginTop: 14 }}>
        {feasibility.checks?.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    </div>
  );
}
