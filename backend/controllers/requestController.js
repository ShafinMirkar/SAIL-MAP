const Request = require("../models/Request");
const { generateReport } = require("../services/reportService");
const Report = require("../models/Report");

exports.createRequest = async (req, res) => {
  try {
    const request = await Request.create(req.body);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.generateReportForRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    const report = await generateReport(request);
    if (report.error) return res.status(422).json(report);
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.listRequests = async (req, res) => {
  const requests = await Request.find().sort({ createdAt: -1 }).limit(50);
  res.json(requests);
};
