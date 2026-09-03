const router = require("express").Router();
const c = require("../controllers/reportController");

router.get("/", c.listReports);
router.get("/:id", c.getReport);

module.exports = router;
