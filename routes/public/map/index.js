const mapSettings = require("../../../helpers/mapSettings");
const common = require("../../../helpers/common");
module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/:id", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map']
      #swagger.path = '/public/map/{id}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve the latest configuration for a specific map'
      #swagger.description = 'Fetches the most recent configuration settings for a map identified by its unique ID. Returns the map configuration in JSON format.'
      #swagger.parameters['id'] = {
          in: 'path',
          description: 'Unique identifier of the map',
          required: true,
          type: 'string'
      } 
      #swagger.responses[200] = {
          description: 'Successful operation. Returns the map configuration.',
          schema: { $ref: '#/definitions/MapConfig' }
      }
      #swagger.responses[404] = {
          description: 'Map not found',
          schema: { error: 'ID Not Found' }
      }
      #swagger.responses[500] = {
          description: 'Internal server error'
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
      #swagger.summary = 'Retrieve a specific version of a map configuration'
      #swagger.description = 'Fetches a particular version of configuration settings for a map identified by its unique ID and version number. Useful for accessing historical configurations.'
      #swagger.parameters['id'] = {
          in: 'path',
          description: 'Unique identifier of the map',
          required: true,
          type: 'string'
      } 
      #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version number of the map configuration',
          required: true,
          type: 'string'
      } 
      #swagger.responses[200] = {
          description: 'Successful operation. Returns the specified version of map configuration.',
          schema: { $ref: '#/definitions/MapConfig' }
      }
      #swagger.responses[404] = {
          description: 'Map or version not found',
          schema: { error: 'ID Not Found' }
      }
      #swagger.responses[500] = {
          description: 'Internal server error'
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
      #swagger.summary = 'Retrieve the default map configuration'
      #swagger.description = 'Fetches the system-wide default map configuration. This configuration serves as a template or fallback when specific map configurations are not available.'
      #swagger.responses[200] = {
          description: 'Successful operation. Returns the default map configuration.',
          schema: { $ref: '#/definitions/MapConfig' }
      }
      #swagger.responses[404] = {
          description: 'Default configuration not found',
          schema: { error: 'ID Not Found' }
      }
      #swagger.responses[500] = {
          description: 'Internal server error'
      }
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
