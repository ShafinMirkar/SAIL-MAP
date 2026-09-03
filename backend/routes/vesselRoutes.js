const router = require("express").Router();
const c = require("../controllers/vesselController");

router.get("/", c.listVessels);
router.get("/feasible", c.getFeasible);

module.exports = router;
