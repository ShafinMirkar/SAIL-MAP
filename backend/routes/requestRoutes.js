const router = require("express").Router();
const c = require("../controllers/requestController");

router.post("/", c.createRequest);
router.get("/", c.listRequests);
router.get("/:id", c.getRequest);
router.get("/:id/report", c.generateReportForRequest);

module.exports = router;
