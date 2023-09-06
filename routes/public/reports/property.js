const propertyReport = require("../../../helpers/propertyReport");
const common = require("../../../helpers/common");
const reportGenerator = require("../../../helpers/reportGenerator");
const fs = require("fs");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/:arn", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Reports']
      #swagger.path = '/public/reports/property/{arn}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve property report information'
       #swagger.parameters['arn'] = {
          in: 'path',
          description: 'ARN',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      propertyReport.getPropertyReportInfo(req.params.arn, (result) => {
        res.json(result);
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
  router.get(baseRoute + "/pdf/:arn", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Reports']
      #swagger.path = '/public/reports/property/{arn}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve property report'
       #swagger.parameters['arn'] = {
          in: 'path',
          description: 'ARN',
          required: true,
          type: 'string'
      }
       
    */
    try {
      if (!common.isHostAllowed(req, res)) return;

      reportGenerator.getPropertyReport(req.params.arn, (result) => {
        const fileExists = fs.existsSync(result);
        if (!fileExists) {
          res.send(result);
        } else {
          var file = fs.createReadStream(result);
          var stat = fs.statSync(result);
          res.setHeader("Content-Length", stat.size);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "attachment; filename=PropertyReport.pdf");
          file.pipe(res);
        }
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
  router.get(baseRoute + "/pdf/:arn", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Reports']
      #swagger.path = '/public/reports/property/{arn}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve property report'
       #swagger.parameters['arn'] = {
          in: 'path',
          description: 'ARN',
          required: true,
          type: 'string'
      }
       
    */
    try {
      if (!common.isHostAllowed(req, res)) return;

      reportGenerator.getPropertyReport(req.params.arn, (result) => {
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
      return next();
    }
  });
};
