import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const COLORS = ["#1B3A54", "#3D6B85", "#D98E3F", "#C08A2E", "#5B6B76"];

export default function CostBreakdown({ cost }) {
  if (!cost) return null;
  const data = [
    { name: "Freight", value: cost.freightCost },
    { name: "Fuel", value: cost.fuelCost },
    { name: "Port Charges", value: cost.portCharges },
    { name: "Demurrage", value: cost.demurrageCost },
    { name: "Positioning", value: cost.positioningCost },
  ];

  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>Total Voyage Cost Breakdown</h2>
        <span className="meta">{cost.distanceNM?.toLocaleString()} NM · {cost.voyageDays} days · {cost.expectedWaitDays}d expected wait</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid stroke="#E4DFD1" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#5B6B76" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12.5, fill: "#1B2B36" }} width={100} />
          <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12.5, border: "1px solid #D9D2C2", borderRadius: 0 }} />
          <Bar dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="ledger-row" style={{ marginTop: 8, borderTop: "1.5px solid #10263B", paddingTop: 12 }}>
        <span className="label" style={{ fontWeight: 600, color: "#10263B" }}>Expected Total Delivered Cost</span>
        <span className="value" style={{ fontSize: 17 }}>${cost.totalCost?.toLocaleString()}</span>
      </div>
    </div>
  );
}
