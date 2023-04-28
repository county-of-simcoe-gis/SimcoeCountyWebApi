const propertyReport = require("../../../helpers/propertyReport");
const common = require("../../../helpers/common");

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
      res.status(500).send();
      return next();
    }
  });
};
