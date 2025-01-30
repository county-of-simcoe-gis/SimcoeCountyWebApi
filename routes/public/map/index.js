const mapSettings = require("../../../helpers/mapSettings");
const common = require("../../../helpers/common");
module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/:id", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map']
      #swagger.path = '/public/map/{id}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve Map config'
       #swagger.parameters['id'] = {
          in: 'path',
          description: 'Map ID',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      mapSettings.getMap(req.params.id, (result) => {
        if (result === undefined) {
          res.json({ error: "ID Not Found" });
        } else {
          res.json(result);
        }
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
  router.get(baseRoute + "/:id/:version", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map']
      #swagger.path = '/public/map/{id}/{version}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve Map config version'
       #swagger.parameters['id'] = {
          in: 'path',
          description: 'Map ID',
          required: true,
          type: 'string'
      } 
          #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      mapSettings.getMapVersion(req.params.id, req.params.version, (result) => {
        if (result === undefined) {
          res.json({ error: "ID Not Found" });
        } else {
          res.json(result);
        }
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
  router.get(baseRoute + "/default", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map']
      #swagger.path = '/public/map/default'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve Default Map config'
      
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      mapSettings.getDefaultMap((result) => {
        if (result === undefined) res.send({ error: "ID Not Found" });

        res.send(result);
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
