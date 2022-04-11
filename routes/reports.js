var express = require("express");
var router = express.Router();
const reportGenerator = require("../helpers/reportGenerator");
const common = require("../helpers/common");
const fs = require("fs");

// GET MAP SETTINGS
router.get("/EconomicDevelopmentReportMLS/:mls", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    reportGenerator.getEconomicDevelopmentReportMLS(req.params.mls, (result) => {
      const fileExists = fs.existsSync(result);
      if (!fileExists) {
        res.send(result);
      } else {
        var file = fs.createReadStream(result);
        var stat = fs.statSync(result);
        res.setHeader("Content-Length", stat.size);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=EconomicDevelopmentReport.pdf");
        file.pipe(res);
      }
    });
  } catch (e) {
    console.error(e.stack);
    res.status(500).send();
  }
});

module.exports = router;
