# Manifest — Freight Forecasting & Vessel Chartering Optimization System

A MERN-stack implementation of the "Intelligent Freight Forecasting Model for Optimized
Vessel Chartering and Bulk Cargo Procurement" problem statement (Ministry of Steel / SAIL).

Moves chartering decisions from **reactive, daily spot-market checks** to a **proactive,
data-driven Chartering Decision Report** covering forecast, timing, vessel selection, port
feasibility, cost, contract strategy, risk, and what-if scenarios.

## Stack

- **MongoDB** + Mongoose — historical freight rates, vessels, ports, congestion, commodity
  markets, fuel prices, weather events, SAIL voyage history
- **Express + Node.js** — REST API, forecasting/feasibility/cost/risk/optimizer engines (pure JS)
- **React (Vite)** — requirement form + full decision-report dashboard, charts via Recharts

All analysis (forecasting, feasibility, cost, risk, optimization) is implemented in
plain JavaScript on the Node side — no external ML service required — using time-series
techniques (EMA smoothing, linear regression, volatility bands) suited to a MERN-only stack.

## Project Structure

```
freight-forecasting-system/
├── backend/
│   ├── config/db.js              Mongo connection
│   ├── models/                   9 Mongoose schemas (Section 2 data categories)
│   ├── utils/constants.js        Real port/vessel reference data from the PS
│   ├── seed/seedData.js          Generates 2 years of realistic dummy data
│   ├── services/                 forecast, feasibility, cost, risk, optimizer, scenario, report
│   ├── controllers/ + routes/    REST API layer
│   └── server.js
└── frontend/
    └── src/
        ├── components/           Executive summary, forecast chart, vessel/port/cost/
        │                         risk/contract panels, what-if simulator
        ├── pages/Dashboard.jsx
        ├── api/api.js
        └── styles/index.css      Design tokens ("Manifest" ledger theme)
```

## Setup

### 1. MongoDB
You need a running MongoDB instance (local `mongod`, Docker, or Atlas).

```bash
# Example with Docker
docker run -d -p 27017:27017 --name freight-mongo mongo:7
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # adjust MONGO_URI / PORT if needed
npm run seed                # populates ~2 years of dummy freight, vessel, port,
                             # congestion, commodity, fuel, weather & voyage data
npm run dev                 # starts API on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173, proxies /api to :5000
```

Open http://localhost:5173, fill in the cargo requirement form, and submit to generate
a full decision report.

## How the pipeline works

```
Cargo requirement (form)
   → Request saved to MongoDB
   → optimizerService evaluates candidate origin/destination/vessel combinations:
       - forecastService: EMA-smoothed trend + linear regression → 7/14/30/60-day
         freight forecast with confidence bands, from 2 years of seeded daily rates
       - feasibilityService: hard-constraint check (LOA/beam/draft/DWT) against both
         load and discharge port infrastructure
       - costService: freight + fuel + port charges + demurrage (from congestion) +
         positioning → Expected Total Delivered Cost
       - riskService: weighted score across market volatility, congestion, vessel
         availability, weather, geopolitical baseline
   → best-scoring combination selected (risk-weighted by the requester's risk tolerance)
   → reportService assembles the full Chartering Decision Report (Sections 3.1–3.10
     of the spec) and stores it
   → scenarioService can re-run key figures instantly for what-if simulation
     (freight ±%, congestion up, vessel unavailable, cargo +%, fuel +%, weather, etc.)
```

## Dummy Data

`npm run seed` generates, grounded in the PS's real port/vessel list:

- **Freight rates**: every (origin port × destination port × vessel class) combination,
  2 years of daily rates with trend + seasonality + noise so forecasting has real signal
- **Vessels**: 60 mock vessels across Handysize/Supramax/Panamax/Capesize
- **Ports**: all 8 origin-side ports (Australia, US, Mozambique, Russia, Indonesia) and
  all 7 East Coast India ports named in the PS, with draft/LOA/beam/DWT limits
- **Port congestion**: 180 days per port with occasional spikes
- **Commodity market, fuel prices, weather events**: monthly/daily mock series
- **SAIL historical voyages**: 120 synthetic past voyages for backtesting/demo purposes

Re-run `npm run seed` anytime to regenerate a fresh dataset (it clears and reseeds all
collections).

## Notes / Next Steps

- Real freight-rate feeds (Baltic Exchange, Clarksons) and AIS/port congestion APIs can
  replace the seeded collections without changing the service layer.
- The optimizer uses a weighted-score ranking; this can be swapped for a proper
  constrained-optimization solver if needed.
- Authentication/roles were out of scope for this pass — add as needed for
  multi-user deployment.
