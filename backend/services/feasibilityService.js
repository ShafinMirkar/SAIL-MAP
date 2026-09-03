const Vessel = require("../models/Vessel");
const Port = require("../models/Port");

/**
 * Checks a vessel against a load port and discharge port's hard infrastructure
 * constraints (Section 2.3 / 3.5 of the spec). Returns pass/fail + reasons.
 */
function checkVesselAgainstPort(vessel, port) {
  const reasons = [];
  let feasible = true;

  if (vessel.loa > port.maxLOA) { feasible = false; reasons.push(`Vessel LOA ${vessel.loa}m exceeds ${port.name} max LOA ${port.maxLOA}m`); }
  if (vessel.beam > port.maxBeam) { feasible = false; reasons.push(`Vessel beam ${vessel.beam}m exceeds ${port.name} max beam ${port.maxBeam}m`); }
  if (vessel.draft > port.maxDraft) { feasible = false; reasons.push(`Vessel draft ${vessel.draft}m exceeds ${port.name} max draft ${port.maxDraft}m`); }
  if (vessel.dwt > port.maxDWT) { feasible = false; reasons.push(`Vessel DWT ${vessel.dwt} exceeds ${port.name} max DWT ${port.maxDWT}`); }

  if (feasible) reasons.push(`Compatible with ${port.name}: LOA, beam, draft and DWT all within limits.`);
  return { port: port.name, feasible, reasons };
}

/**
 * For a given cargo requirement, returns all vessels that are feasible at BOTH
 * the load port and discharge port, with reasons for rejected ones too.
 */
async function getFeasibleVessels({ loadPortName, dischargePortName, minCargoTonnes, preferredVesselClass }) {
  const loadPort = await Port.findOne({ name: loadPortName });
  const dischargePort = await Port.findOne({ name: dischargePortName });
  if (!loadPort || !dischargePort) {
    return { error: "Load or discharge port not found in port database." };
  }

  const query = { dwt: { $gte: minCargoTonnes * 0.95 } };
  if (preferredVesselClass && preferredVesselClass !== "Any") query.class = preferredVesselClass;

  const vessels = await Vessel.find(query).limit(200);

  const results = vessels.map((v) => {
    const loadCheck = checkVesselAgainstPort(v, loadPort);
    const dischargeCheck = checkVesselAgainstPort(v, dischargePort);
    const feasible = loadCheck.feasible && dischargeCheck.feasible;
    return {
      vessel: v,
      feasible,
      loadPortCheck: loadCheck,
      dischargePortCheck: dischargeCheck,
    };
  });

  return {
    loadPort,
    dischargePort,
    feasibleCount: results.filter((r) => r.feasible).length,
    results,
  };
}

module.exports = { checkVesselAgainstPort, getFeasibleVessels };
