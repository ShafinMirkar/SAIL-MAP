const router = require("express").Router();
const c = require("../controllers/scenarioController");

router.post("/", c.runScenario);

module.exports = router;
