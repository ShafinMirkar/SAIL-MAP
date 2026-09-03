import React from "react";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="rail-brand">
          <div className="mark">Manifest</div>
          <div className="sub">Freight Forecasting &amp; Vessel Chartering Intelligence — East Coast India</div>
        </div>

        <div>
          <div className="rail-divider" style={{ marginBottom: 18 }} />
          <div className="rail-section-label">Origins Tracked</div>
          <div className="rail-stat"><span>Australia</span></div>
          <div className="rail-stat"><span>US</span></div>
          <div className="rail-stat"><span>Mozambique</span></div>
          <div className="rail-stat"><span>Russia</span></div>
          <div className="rail-stat"><span>Indonesia</span></div>
        </div>

        <div>
          <div className="rail-divider" style={{ marginBottom: 18 }} />
          <div className="rail-section-label">East Coast Ports</div>
          <div className="rail-stat"><span>Paradip</span></div>
          <div className="rail-stat"><span>Visakhapatnam</span></div>
          <div className="rail-stat"><span>Gangavaram</span></div>
          <div className="rail-stat"><span>Gopalpur</span></div>
          <div className="rail-stat"><span>Dhamra</span></div>
          <div className="rail-stat"><span>Sagar-Sandheads</span></div>
          <div className="rail-stat"><span>Haldia</span></div>
        </div>

        <div className="rail-footnote">
          Ministry of Steel · SAIL<br />
          Transportation &amp; Logistics
        </div>
      </aside>

      <Dashboard />
    </div>
  );
}
