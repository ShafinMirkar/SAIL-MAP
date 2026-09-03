/**
 * Seed script: generates realistic dummy data for every collection described
 * in Section 2 of the spec (Data Used For Analysis), grounded in the port/vessel
 * reference data from the Problem Statement (utils/constants.js).
 *
 * Run with: npm run seed
 */
require("dotenv").config();
const { faker } = require("@faker-js/faker");
const connectDB = require("../config/db");

const FreightRate = require("../models/FreightRate");
const Vessel = require("../models/Vessel");
const Port = require("../models/Port");
const PortCongestion = require("../models/PortCongestion");
const CommodityMarket = require("../models/CommodityMarket");
const FuelPrice = require("../models/FuelPrice");
const WeatherEvent = require("../models/WeatherEvent");
const SailVoyage = require("../models/SailVoyage");

const {
  VESSEL_CLASSES,
  DESTINATION_PORTS,
  ORIGIN_PORTS,
  ORIGIN_COUNTRIES,
  COMMODITIES,
} = require("../utils/constants");
const { getDistance } = require("../utils/distance");

const DAYS_HISTORY = 730; // 2 years of daily data
const today = new Date();
const startDate = new Date(today.getTime() - DAYS_HISTORY * 86400000);

function dateNDaysFrom(base, n) {
  return new Date(base.getTime() + n * 86400000);
}

// Base freight rate (USD/tonne) per vessel class, calibrated roughly to real bulk market levels
const BASE_RATE_BY_CLASS = { Handysize: 18, Supramax: 15, Panamax: 13, Capesize: 10 };

// Deterministic-ish trend + seasonality + noise so the forecasting engine has real signal to learn from
function generateRateSeries(days, baseRate) {
  const series = [];
  let level = baseRate;
  for (let i = 0; i < days; i++) {
    const trend = Math.sin(i / 180) * baseRate * 0.15;        // slow multi-month cycle
    const seasonal = Math.sin((i % 365) / 365 * 2 * Math.PI) * baseRate * 0.08; // annual seasonality
    const noise = (Math.random() - 0.5) * baseRate * 0.06;
    // small random walk drift so the series doesn't just oscillate around a fixed mean
    level += (Math.random() - 0.5) * baseRate * 0.01;
    const value = Math.max(baseRate * 0.5, level + trend + seasonal + noise);
    series.push(Number(value.toFixed(2)));
  }
  return series;
}

async function seedPorts() {
  await Port.deleteMany({});
  const docs = [
    ...ORIGIN_PORTS.map((p) => ({
      name: p.name, country: p.country, type: "Load",
      maxLOA: p.maxLOA, maxBeam: p.maxBeam, maxDraft: p.maxDraft, maxDWT: p.maxDWT,
      berths: p.berths, channelDepth: p.maxDraft + 1.5,
      loadingRate: faker.number.int({ min: 15000, max: 45000 }),
      dischargeRate: 0,
      avgWaitTimeDays: Number(faker.number.float({ min: 0.5, max: 4, fractionDigits: 1 })),
      tidalRestriction: false,
      seasonalRestriction: "None",
    })),
    ...DESTINATION_PORTS.map((p) => ({
      name: p.name, country: p.country, type: "Discharge",
      maxLOA: p.maxLOA, maxBeam: p.maxBeam, maxDraft: p.maxDraft, maxDWT: p.maxDWT,
      berths: p.berths, channelDepth: p.maxDraft + 1.2,
      loadingRate: 0,
      dischargeRate: faker.number.int({ min: 10000, max: 35000 }),
      avgWaitTimeDays: Number(faker.number.float({ min: 0.5, max: 6, fractionDigits: 1 })),
      tidalRestriction: p.tidal,
      seasonalRestriction: p.tidal ? "Monsoon draft restriction (Jun-Sep)" : "None",
    })),
  ];
  await Port.insertMany(docs);
  console.log(`[seed] Ports: ${docs.length}`);
}

async function seedFreightRates() {
  await FreightRate.deleteMany({});
  const docs = [];
  for (const origin of ORIGIN_PORTS) {
    for (const dest of DESTINATION_PORTS) {
      for (const vc of VESSEL_CLASSES) {
        const dist = getDistance(origin.name, dest.name);
        const distFactor = dist / 5000; // longer routes -> higher $/tonne baseline
        const base = BASE_RATE_BY_CLASS[vc.name] * distFactor;
        const series = generateRateSeries(DAYS_HISTORY, base);
        series.forEach((rate, i) => {
          docs.push({
            date: dateNDaysFrom(startDate, i),
            origin: origin.country,
            originPort: origin.name,
            destination: dest.name,
            tradeRoute: `${origin.name}-${dest.name}`,
            vesselClass: vc.name,
            rate,
            currency: "USD",
            contractType: "Spot",
            marketCondition: rate > base ? "Bullish" : rate < base * 0.9 ? "Bearish" : "Neutral",
          });
        });
      }
    }
  }
  // Insert in batches to avoid oversized single insert
  const BATCH = 5000;
  for (let i = 0; i < docs.length; i += BATCH) {
    await FreightRate.insertMany(docs.slice(i, i + BATCH));
  }
  console.log(`[seed] FreightRate records: ${docs.length}`);
}

async function seedVessels() {
  await Vessel.deleteMany({});
  const docs = [];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const vc = faker.helpers.arrayElement(VESSEL_CLASSES);
    const dwt = faker.number.int({ min: vc.dwtRange[0], max: vc.dwtRange[1] });
    const allPorts = [...ORIGIN_PORTS, ...DESTINATION_PORTS];
    docs.push({
      name: `MV ${faker.word.adjective({ length: { min: 4, max: 8 } })} ${faker.word.noun({ length: { min: 4, max: 8 } })}`.replace(/\b\w/g, c => c.toUpperCase()),
      class: vc.name,
      dwt,
      cargoCapacity: Math.round(dwt * 0.92),
      loa: Number((vc.typicalLOA + faker.number.float({ min: -5, max: 5, fractionDigits: 1 })).toFixed(1)),
      beam: Number((vc.typicalBeam + faker.number.float({ min: -1, max: 1, fractionDigits: 1 })).toFixed(1)),
      draft: Number((vc.typicalDraft + faker.number.float({ min: -0.5, max: 0.5, fractionDigits: 1 })).toFixed(1)),
      age: faker.number.int({ min: 1, max: 22 }),
      ladenSpeed: Number(faker.number.float({ min: 11, max: 14.5, fractionDigits: 1 })),
      ballastSpeed: Number(faker.number.float({ min: 12, max: 15.5, fractionDigits: 1 })),
      fuelConsumptionLaden: Number(faker.number.float({ min: 18, max: 45, fractionDigits: 1 })),
      fuelConsumptionBallast: Number(faker.number.float({ min: 15, max: 38, fractionDigits: 1 })),
      currentLocation: faker.helpers.arrayElement(allPorts).name,
      currentEmployment: faker.helpers.arrayElement(["Open", "Open", "On Voyage", "Open"]),
      availabilityDate: dateNDaysFrom(today, faker.number.int({ min: 0, max: 45 })),
      etaLoadPort: dateNDaysFrom(today, faker.number.int({ min: 2, max: 50 })),
      dailyHireRate: faker.number.int({ min: 8000, max: 32000 }),
      demurrageRate: faker.number.int({ min: 9000, max: 35000 }),
    });
  }
  await Vessel.insertMany(docs);
  console.log(`[seed] Vessels: ${docs.length}`);
}

async function seedPortCongestion() {
  await PortCongestion.deleteMany({});
  const docs = [];
  const allPorts = [...ORIGIN_PORTS, ...DESTINATION_PORTS];
  const CONGESTION_DAYS = 180; // last 6 months + light forward projection baseline
  for (const port of allPorts) {
    let baseIndex = faker.number.int({ min: 20, max: 45 });
    for (let i = 0; i < CONGESTION_DAYS; i++) {
      // occasional congestion spikes
      const spike = Math.random() < 0.05 ? faker.number.int({ min: 20, max: 45 }) : 0;
      baseIndex = Math.min(95, Math.max(10, baseIndex + (Math.random() - 0.5) * 6));
      const index = Math.min(100, Math.round(baseIndex + spike));
      docs.push({
        port: port.name,
        date: dateNDaysFrom(startDate, DAYS_HISTORY - CONGESTION_DAYS + i),
        vesselsWaiting: Math.round(index / 8),
        vesselsAtBerth: Math.min(port.berths, Math.round(index / 12) + 1),
        berthOccupancyPct: Math.min(100, Math.round(index * 0.9)),
        congestionIndex: index,
      });
    }
  }
  await PortCongestion.insertMany(docs);
  console.log(`[seed] PortCongestion records: ${docs.length}`);
}

async function seedCommodityMarket() {
  await CommodityMarket.deleteMany({});
  const docs = [];
  const MONTHS = 24;
  for (const commodity of COMMODITIES) {
    let price = faker.number.int({ min: 90, max: 220 });
    for (let m = 0; m < MONTHS; m++) {
      price = Math.max(50, price + (Math.random() - 0.48) * 12);
      docs.push({
        commodity,
        date: new Date(startDate.getFullYear(), startDate.getMonth() + m, 1),
        price: Number(price.toFixed(2)),
        productionVolume: faker.number.int({ min: 500000, max: 5000000 }),
        exportVolume: faker.number.int({ min: 200000, max: 3000000 }),
        importVolume: faker.number.int({ min: 200000, max: 3000000 }),
        inventoryLevel: faker.number.int({ min: 100000, max: 2000000 }),
        indianDemandIndex: faker.number.int({ min: 40, max: 100 }),
        steelSectorDemandIndex: faker.number.int({ min: 40, max: 100 }),
      });
    }
  }
  await CommodityMarket.insertMany(docs);
  console.log(`[seed] CommodityMarket records: ${docs.length}`);
}

async function seedFuelPrices() {
  await FuelPrice.deleteMany({});
  const docs = [];
  let bunker = 550;
  let crude = 80;
  for (let i = 0; i < DAYS_HISTORY; i++) {
    bunker = Math.max(300, bunker + (Math.random() - 0.5) * 8);
    crude = Math.max(50, crude + (Math.random() - 0.5) * 1.5);
    docs.push({
      date: dateNDaysFrom(startDate, i),
      fuelType: "VLSFO",
      bunkerPrice: Number(bunker.toFixed(2)),
      crudePrice: Number(crude.toFixed(2)),
    });
  }
  const BATCH = 5000;
  for (let i = 0; i < docs.length; i += BATCH) {
    await FuelPrice.insertMany(docs.slice(i, i + BATCH));
  }
  console.log(`[seed] FuelPrice records: ${docs.length}`);
}

async function seedWeatherEvents() {
  await WeatherEvent.deleteMany({});
  const docs = [];
  const regions = [...DESTINATION_PORTS.map(p => p.name), ...ORIGIN_PORTS.map(p => p.name)];
  for (const region of regions) {
    const eventCount = faker.number.int({ min: 3, max: 10 });
    for (let i = 0; i < eventCount; i++) {
      const type = faker.helpers.arrayElement(["Cyclone", "Storm", "HeavyRain", "RoughSea"]);
      const severity = faker.number.int({ min: 1, max: 5 });
      docs.push({
        region,
        date: dateNDaysFrom(startDate, faker.number.int({ min: 0, max: DAYS_HISTORY + 60 })), // includes some forward-looking
        type,
        severity,
        expectedDelayDays: Math.round(severity * 0.8),
      });
    }
  }
  await WeatherEvent.insertMany(docs);
  console.log(`[seed] WeatherEvent records: ${docs.length}`);
}

async function seedSailVoyages() {
  await SailVoyage.deleteMany({});
  const docs = [];
  for (let i = 0; i < 120; i++) {
    const origin = faker.helpers.arrayElement(ORIGIN_PORTS);
    const dest = faker.helpers.arrayElement(DESTINATION_PORTS);
    const vc = faker.helpers.arrayElement(VESSEL_CLASSES);
    const charterDate = dateNDaysFrom(startDate, faker.number.int({ min: 0, max: DAYS_HISTORY - 40 }));
    const laycanStart = dateNDaysFrom(charterDate, faker.number.int({ min: 10, max: 25 }));
    const laycanEnd = dateNDaysFrom(laycanStart, faker.number.int({ min: 5, max: 10 }));
    const actualLoadDate = dateNDaysFrom(laycanStart, faker.number.int({ min: 0, max: 6 }));
    const loadingTimeDays = faker.number.int({ min: 2, max: 6 });
    const waitingTimeDays = faker.number.int({ min: 0, max: 5 });
    const dischargeTimeDays = faker.number.int({ min: 2, max: 7 });
    const actualDischargeDate = dateNDaysFrom(actualLoadDate, loadingTimeDays + waitingTimeDays + dischargeTimeDays + faker.number.int({ min: 12, max: 30 }));
    const freightRate = Number((BASE_RATE_BY_CLASS[vc.name] * (getDistance(origin.name, dest.name) / 5000) * faker.number.float({ min: 0.85, max: 1.25 })).toFixed(2));
    const cargoTonnes = faker.number.int({ min: vc.dwtRange[0] * 0.85, max: vc.dwtRange[1] * 0.92 });
    const fuelCostUSD = Math.round(getDistance(origin.name, dest.name) / 24 / 13 * faker.number.int({ min: 25, max: 40 }) * 550);
    const portCostUSD = faker.number.int({ min: 40000, max: 160000 });
    const demurrageUSD = waitingTimeDays > 2 ? (waitingTimeDays - 2) * faker.number.int({ min: 9000, max: 30000 }) : 0;
    const totalVoyageCostUSD = Math.round(freightRate * cargoTonnes + fuelCostUSD * 0 + portCostUSD + demurrageUSD);
    // Note: freightRate*cargoTonnes already reflects a full charter cost proxy; fuel/port modeled as embedded op-cost context

    docs.push({
      cargoRequirementTonnes: cargoTonnes,
      commodity: faker.helpers.arrayElement(COMMODITIES),
      origin: origin.country,
      originPort: origin.name,
      destination: dest.name,
      vesselClass: vc.name,
      vesselName: `MV ${faker.word.noun({ length: { min: 4, max: 9 } })}`.replace(/\b\w/g, c => c.toUpperCase()),
      charterDate,
      freightRate,
      laycanStart,
      laycanEnd,
      actualLoadDate,
      actualDischargeDate,
      loadingTimeDays,
      waitingTimeDays,
      dischargeTimeDays,
      demurrageUSD,
      fuelCostUSD,
      portCostUSD,
      totalVoyageCostUSD,
      contractType: faker.helpers.arrayElement(["Spot", "Spot", "ShortTerm", "MediumTerm"]),
      operationalDelayDays: faker.number.int({ min: 0, max: 4 }),
    });
  }
  await SailVoyage.insertMany(docs);
  console.log(`[seed] SailVoyage records: ${docs.length}`);
}

async function run() {
  await connectDB();
  console.log("[seed] Starting full dummy dataset generation...");
  await seedPorts();
  await seedVessels();
  await seedFreightRates();
  await seedPortCongestion();
  await seedCommodityMarket();
  await seedFuelPrices();
  await seedWeatherEvents();
  await seedSailVoyages();
  console.log("[seed] Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
