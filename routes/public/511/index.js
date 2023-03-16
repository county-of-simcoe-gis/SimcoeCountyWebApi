const mto = require("../../../helpers/mto");
const common = require("../../../helpers/common");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/MTOLayer/:layerName", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/511']
      #swagger.path = '/public/511/MTOLayer/{layerName}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get 511 Information'
      #swagger.parameters['layerName'] = {
          in: 'path',
          description: 'Layer name to filter 511 data',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      mto.getMTOLayer(req.params.layerName, function (response) {
        res.send(response);
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
};
