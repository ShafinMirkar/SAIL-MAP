const Port = require("../models/Port");
const PortCongestion = require("../models/PortCongestion");

exports.listPorts = async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};
  const ports = await Port.find(query);
  res.json(ports);
};

exports.getPortDetail = async (req, res) => {
  try {
    const port = await Port.findOne({ name: req.params.name });
    if (!port) return res.status(404).json({ error: "Port not found" });
    const congestion = await PortCongestion.find({ port: port.name }).sort({ date: -1 }).limit(30);
    res.json({ port, recentCongestion: congestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
