const reportGenerator = require("../../../helpers/reportGenerator");
const common = require("../../../helpers/common");
const fs = require("fs");
module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/MLS/:mls", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Reports']
      #swagger.path = '/public/reports/MLS/{mls}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve economic development report'
       #swagger.parameters['mls'] = {
          in: 'path',
          description: 'MLS Number',
          required: true,
          type: 'string'
      } 
    */
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
        next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
};
