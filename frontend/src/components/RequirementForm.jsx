import React, { useState } from "react";

const COMMODITIES = ["Coking Coal", "Thermal Coal", "Iron Ore", "Limestone"];
const ORIGIN_COUNTRIES = ["Australia", "US", "Mozambique", "Russia", "Indonesia"];
const DEST_PORTS = ["Paradip", "Visakhapatnam", "Gangavaram", "Gopalpur", "Dhamra", "Sagar-Sandheads", "Haldia"];
const VESSEL_CLASSES = ["Any", "Handysize", "Supramax", "Panamax", "Capesize"];
const CONTRACT_TYPES = ["LetSystemDecide", "Spot", "ShortTerm", "MediumTerm"];
const RISK_LEVELS = ["Conservative", "Balanced", "Aggressive"];

export default function RequirementForm({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    commodity: "Thermal Coal",
    cargoQuantityTonnes: 150000,
    originCountry: "Australia",
    preferredLoadPort: "",
    preferredDischargePort: "Paradip",
    numberOfVoyages: 3,
    preferredContractType: "LetSystemDecide",
    preferredVesselClass: "Any",
    riskTolerance: "Balanced",
    maxFreightBudgetUSD: 4000000,
  });

  const update = (key) => (e) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-title-row">
        <h2>Cargo Requirement</h2>
        <span className="meta">Tell us what needs to move — we'll fill in the market data</span>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>Commodity</label>
          <select value={form.commodity} onChange={update("commodity")}>
            {COMMODITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Cargo Quantity (tonnes)</label>
          <input type="number" value={form.cargoQuantityTonnes} onChange={update("cargoQuantityTonnes")} min={10000} step={5000} />
        </div>
        <div className="field">
          <label>Number of Voyages</label>
          <input type="number" value={form.numberOfVoyages} onChange={update("numberOfVoyages")} min={1} max={12} />
        </div>

        <div className="field">
          <label>Origin Country</label>
          <select value={form.originCountry} onChange={update("originCountry")}>
            {ORIGIN_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Preferred Loading Port (optional)</label>
          <input type="text" placeholder="Let system select" value={form.preferredLoadPort} onChange={update("preferredLoadPort")} />
        </div>
        <div className="field">
          <label>Discharge Port (East Coast India)</label>
          <select value={form.preferredDischargePort} onChange={update("preferredDischargePort")}>
            <option value="">Let system evaluate all</option>
            {DEST_PORTS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Preferred Vessel Class</label>
          <select value={form.preferredVesselClass} onChange={update("preferredVesselClass")}>
            {VESSEL_CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Preferred Contract Type</label>
          <select value={form.preferredContractType} onChange={update("preferredContractType")}>
            {CONTRACT_TYPES.map((c) => <option key={c}>{c === "LetSystemDecide" ? "Let System Decide" : c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Risk Tolerance</label>
          <select value={form.riskTolerance} onChange={update("riskTolerance")}>
            {RISK_LEVELS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Max Freight Budget (USD, optional)</label>
          <input type="number" value={form.maxFreightBudgetUSD} onChange={update("maxFreightBudgetUSD")} min={0} step={50000} />
        </div>
      </div>
      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Generating decision report…" : "Generate Chartering Decision Report"}
      </button>
    </form>
  );
}
