const router = require("express").Router();
const c = require("../controllers/forecastController");

router.get("/:route/:vesselClass", c.getForecast);

module.exports = router;
