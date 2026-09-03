const router = require("express").Router();
const c = require("../controllers/portController");

router.get("/", c.listPorts);
router.get("/:name", c.getPortDetail);

module.exports = router;
