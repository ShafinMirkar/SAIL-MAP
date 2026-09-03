const Report = require("../models/Report");
const { applyScenario } = require("../services/scenarioService");

exports.runScenario = async (req, res) => {
  try {
    const { reportId, type, value } = req.body;
    const baseReport = await Report.findById(reportId).lean();
    if (!baseReport) return res.status(404).json({ error: "Base report not found" });
    const adjusted = applyScenario(baseReport, { type, value });
    res.json(adjusted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
