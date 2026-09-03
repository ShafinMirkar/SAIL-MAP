const { forecastFreightRate } = require("../services/forecastService");

exports.getForecast = async (req, res) => {
  try {
    const { route, vesselClass } = req.params;
    const forecast = await forecastFreightRate(decodeURIComponent(route), vesselClass);
    if (forecast.error) return res.status(404).json(forecast);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
