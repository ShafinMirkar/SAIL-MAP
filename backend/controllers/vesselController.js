const Vessel = require("../models/Vessel");
const { getFeasibleVessels } = require("../services/feasibilityService");

exports.listVessels = async (req, res) => {
  const { class: vesselClass } = req.query;
  const query = vesselClass ? { class: vesselClass } : {};
  const vessels = await Vessel.find(query).limit(200);
  res.json(vessels);
};

exports.getFeasible = async (req, res) => {
  try {
    const { loadPort, dischargePort, minCargoTonnes, vesselClass } = req.query;
    const result = await getFeasibleVessels({
      loadPortName: loadPort,
      dischargePortName: dischargePort,
      minCargoTonnes: Number(minCargoTonnes) || 30000,
      preferredVesselClass: vesselClass || "Any",
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
