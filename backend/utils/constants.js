/**
 * Reference data pulled directly from the Problem Statement:
 * - Origins: Australia, US, Mozambique, Russia, Indonesia
 * - East Coast India discharge ports: Paradip, Vizag, Gangavaram, Gopalpur, Dhamra,
 *   Sagar-Sandheads, Haldia
 * - Vessel classes: Handysize, Supramax, Panamax, Capesize
 *
 * Infrastructure figures below are approximate, publicly-known operating envelopes
 * for these ports (draft/LOA/DWT ceilings) used to make the dummy dataset realistic.
 * They are indicative, not official port authority notices.
 */

const VESSEL_CLASSES = [
  { name: "Handysize", dwtRange: [28000, 40000], typicalLOA: 190, typicalBeam: 27, typicalDraft: 10.5 },
  { name: "Supramax", dwtRange: [50000, 60000], typicalLOA: 200, typicalBeam: 32.3, typicalDraft: 12.0 },
  { name: "Panamax", dwtRange: [65000, 85000], typicalLOA: 225, typicalBeam: 32.3, typicalDraft: 13.5 },
  { name: "Capesize", dwtRange: [150000, 180000], typicalLOA: 292, typicalBeam: 45, typicalDraft: 17.5 },
];

// East Coast India discharge ports named in the PS
const DESTINATION_PORTS = [
  { name: "Paradip", country: "India", maxLOA: 300, maxBeam: 48, maxDraft: 18.1, maxDWT: 180000, berths: 15, tidal: false },
  { name: "Visakhapatnam", country: "India", maxLOA: 280, maxBeam: 45, maxDraft: 17.0, maxDWT: 160000, berths: 24, tidal: false },
  { name: "Gangavaram", country: "India", maxLOA: 300, maxBeam: 48, maxDraft: 18.5, maxDWT: 180000, berths: 6, tidal: false },
  { name: "Gopalpur", country: "India", maxLOA: 230, maxBeam: 33, maxDraft: 14.5, maxDWT: 90000, berths: 2, tidal: false },
  { name: "Dhamra", country: "India", maxLOA: 300, maxBeam: 48, maxDraft: 18.0, maxDWT: 180000, berths: 4, tidal: false },
  { name: "Sagar-Sandheads", country: "India", maxLOA: 250, maxBeam: 38, maxDraft: 13.0, maxDWT: 100000, berths: 1, tidal: true },
  { name: "Haldia", country: "India", maxLOA: 186, maxBeam: 28.4, maxDraft: 8.8, maxDWT: 40000, berths: 12, tidal: true },
];

// Representative loading ports for each origin named in the PS
const ORIGIN_PORTS = [
  { name: "Newcastle", country: "Australia", maxLOA: 300, maxBeam: 50, maxDraft: 18.0, maxDWT: 185000, berths: 4 },
  { name: "Gladstone", country: "Australia", maxLOA: 292, maxBeam: 45, maxDraft: 17.0, maxDWT: 180000, berths: 5 },
  { name: "Baltimore", country: "US", maxLOA: 290, maxBeam: 45, maxDraft: 15.2, maxDWT: 150000, berths: 3 },
  { name: "Norfolk", country: "US", maxLOA: 300, maxBeam: 48, maxDraft: 18.0, maxDWT: 180000, berths: 4 },
  { name: "Nacala", country: "Mozambique", maxLOA: 260, maxBeam: 43, maxDraft: 16.5, maxDWT: 150000, berths: 2 },
  { name: "Vostochny", country: "Russia", maxLOA: 290, maxBeam: 45, maxDraft: 16.5, maxDWT: 170000, berths: 3 },
  { name: "Taboneo", country: "Indonesia", maxLOA: 230, maxBeam: 36, maxDraft: 13.0, maxDWT: 90000, berths: 1 },
  { name: "Samarinda", country: "Indonesia", maxLOA: 200, maxBeam: 32, maxDraft: 11.0, maxDWT: 60000, berths: 2 },
];

// Approximate nautical mile distances, origin port -> discharge port (indicative, for cost calc)
const ROUTE_DISTANCES = {
  "Newcastle-Paradip": 5200, "Newcastle-Visakhapatnam": 5100, "Newcastle-Gangavaram": 5150,
  "Newcastle-Gopalpur": 5250, "Newcastle-Dhamra": 5350, "Newcastle-Sagar-Sandheads": 5450, "Newcastle-Haldia": 5500,
  "Gladstone-Paradip": 5400, "Gladstone-Visakhapatnam": 5300, "Gladstone-Gangavaram": 5350,
  "Gladstone-Gopalpur": 5450, "Gladstone-Dhamra": 5550, "Gladstone-Sagar-Sandheads": 5650, "Gladstone-Haldia": 5700,
  "Baltimore-Paradip": 9800, "Baltimore-Visakhapatnam": 9700, "Baltimore-Gangavaram": 9750,
  "Baltimore-Gopalpur": 9850, "Baltimore-Dhamra": 9950, "Baltimore-Sagar-Sandheads": 10050, "Baltimore-Haldia": 10100,
  "Norfolk-Paradip": 9700, "Norfolk-Visakhapatnam": 9600, "Norfolk-Gangavaram": 9650,
  "Norfolk-Gopalpur": 9750, "Norfolk-Dhamra": 9850, "Norfolk-Sagar-Sandheads": 9950, "Norfolk-Haldia": 10000,
  "Nacala-Paradip": 3600, "Nacala-Visakhapatnam": 3500, "Nacala-Gangavaram": 3550,
  "Nacala-Gopalpur": 3650, "Nacala-Dhamra": 3750, "Nacala-Sagar-Sandheads": 3850, "Nacala-Haldia": 3900,
  "Vostochny-Paradip": 5900, "Vostochny-Visakhapatnam": 5800, "Vostochny-Gangavaram": 5850,
  "Vostochny-Gopalpur": 5950, "Vostochny-Dhamra": 6050, "Vostochny-Sagar-Sandheads": 6150, "Vostochny-Haldia": 6200,
  "Taboneo-Paradip": 2600, "Taboneo-Visakhapatnam": 2500, "Taboneo-Gangavaram": 2550,
  "Taboneo-Gopalpur": 2650, "Taboneo-Dhamra": 2750, "Taboneo-Sagar-Sandheads": 2850, "Taboneo-Haldia": 2900,
  "Samarinda-Paradip": 2700, "Samarinda-Visakhapatnam": 2600, "Samarinda-Gangavaram": 2650,
  "Samarinda-Gopalpur": 2750, "Samarinda-Dhamra": 2850, "Samarinda-Sagar-Sandheads": 2950, "Samarinda-Haldia": 3000,
};

const ORIGIN_COUNTRIES = ["Australia", "US", "Mozambique", "Russia", "Indonesia"];
const COMMODITIES = ["Coking Coal", "Thermal Coal", "Iron Ore", "Limestone"];

module.exports = {
  VESSEL_CLASSES,
  DESTINATION_PORTS,
  ORIGIN_PORTS,
  ROUTE_DISTANCES,
  ORIGIN_COUNTRIES,
  COMMODITIES,
};
