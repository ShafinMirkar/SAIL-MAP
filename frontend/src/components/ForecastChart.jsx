import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

export default function ForecastChart({ forecast }) {
  if (!forecast || forecast.error) return null;
  const history = (forecast.history || []).map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    rate: h.rate,
  }));

  return (
    <div className="panel">
      <div className="panel-title-row">
        <h2>Freight Rate Forecast</h2>
        <span className="meta">{forecast.tradeRoute} · {forecast.vesselClass} · Trend: {forecast.trendDirection}</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3D6B85" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3D6B85" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E4DFD1" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5B6B76" }} interval={Math.floor(history.length / 6)} />
          <YAxis tick={{ fontSize: 11, fill: "#5B6B76" }} width={40} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ fontSize: 12.5, border: "1px solid #D9D2C2", borderRadius: 0 }} />
          <Area type="monotone" dataKey="rate" stroke="#1B3A54" strokeWidth={2} fill="url(#rateFill)" />
        </AreaChart>
      </ResponsiveContainer>

      <table className="data-table" style={{ marginTop: 18 }}>
        <thead>
          <tr><th>Horizon</th><th>Expected Rate ($/t)</th><th>Confidence Range</th></tr>
        </thead>
        <tbody>
          {Object.entries(forecast.forecast).map(([k, v]) => (
            <tr key={k}>
              <td>{k.replace("day", "")}-day</td>
              <td>${v.expectedRate}</td>
              <td>${v.low} – ${v.high}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="reasons-list" style={{ marginTop: 16 }}>
        {forecast.influencingFactors?.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  );
}
