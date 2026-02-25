const mto = require("../../../../helpers/mto");
const common = require("../../../../helpers/common");
const waze = require("../../../../helpers/waze");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/MTOLayer/:layerName", middleWare, async (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map/Theme/511']
      #swagger.path = '/public/map/theme/511/MTOLayer/{layerName}'
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
      const response = await mto.getMTOLayer(req.params.layerName);
      res.send(response);
      return next();
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
  router.get(baseRoute + "/AlertLayer/:category/:type", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map/Theme/511']
      #swagger.path = '/public/map/theme/511/AlertLayer/{category}/{type}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get Waze alerts'
      #swagger.parameters['category'] = {
          in: 'path',
          description: 'Category of alert',
          required: true,
          type: 'string'
      } 
      #swagger.parameters['type'] = {
          in: 'path',
          description: 'Type of alert',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      waze.getWazeLayer(req.params.category, req.params.type, function (response) {
        res.send(response);
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
  router.get(baseRoute + "/JamLayer", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map/Theme/511']
      #swagger.path = '/public/map/theme/511/JamLayer'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get Waze Traffic Jam Layer'
      
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      waze.getWazeLayer("JAMS", "", function (response) {
        res.send(response);
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
  router.get(baseRoute + "/IrregularLayer", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map/Theme/511']
      #swagger.path = '/public/map/theme/511/IrregularLayer'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get Waze Irregular Layer'
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      waze.getWazeLayer("IRREGULAR", "", function (response) {
        res.send(response);
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
