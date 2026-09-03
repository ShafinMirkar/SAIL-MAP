const Report = require("../models/Report");

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listReports = async (req, res) => {
  const reports = await Report.find().sort({ generatedAt: -1 }).limit(50);
  res.json(reports);
};
