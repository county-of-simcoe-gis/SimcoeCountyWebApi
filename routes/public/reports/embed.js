const common = require("../../../helpers/common");
const PowerBIEmbed = require("../../../helpers/powerbiEmbed");
const reports = new PowerBIEmbed();

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/:report", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Reports']
      #swagger.path = '/public/reports/embed/report'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve embed token'
      
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      reports.getEmbedToken(req.params.report, (result) => {
        res.json(result);
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  }),
    router.post(baseRoute + "/:report", middleWare, (req, res, next) => {
      /* 
      #swagger.tags = ['Public/Reports']
      #swagger.path = '/public/reports/embed/report'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Set embedded parameters'
      #swagger.parameters['obj'] = {
          in: 'body',
          description: 'Feedback Details',
          required: true,
          schema: [{ 
            $name:'name',
            $value:'value',
            $type:'type'
          }]
        }
    */

      try {
        if (!common.isHostAllowed(req, res)) return;
        reports.setReportParameters(req.params.report, req.body, (paramId) => {
          res.json(paramId);
          return next();
        });
      } catch (e) {
        console.error(e.stack);
        res.status(500);
        res.send();
        return next();
      }
    });
};
