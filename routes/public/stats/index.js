const common = require("../../../helpers/common");
var appStats = require("../../../helpers/appStats");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/write/:appName/:actionType/:description", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Stats']
      #swagger.path = '/public/stats/write/{appName}/{actionType}/{description}'
      #swagger.deprecated = false
      #swagger.true = false
      #swagger.summary = 'Write to appstats'
       #swagger.parameters['appName'] = {
          in: 'path',
          description: 'Application Name',
          required: true,
          type: 'string'
      },
      #swagger.parameters['actionType'] = {
          in: 'path',
          description: 'Type of action',
          required: true,
          type: 'string'
      },
      #swagger.parameters['description'] = {
          in: 'path',
          description: 'Details of the logged action',
          required: true,
          type: 'string'
      }
      
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      // IP FROM PROXY
      const ip = req.headers["proxy-ip"] === undefined ? "LOCAL_DEBUGGING" : req.headers["proxy-ip"];

      // INSERT APP STAT
      appStats.insertAppStat(req.params.appName, req.params.actionType, req.params.description, ip);
      res.send("OK");
      return next();
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
  router.get(baseRoute + "/read/:fromDate/:toDate/:type", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Stats']
      #swagger.path = '/public/stats/read/{fromDate}/{toDate}/{type}'
      #swagger.deprecated = false
      #swagger.ignore = true
      #swagger.summary = 'Retrieve appstats information'
       #swagger.parameters['fromDate'] = {
          in: 'path',
          description: 'Start Date',
          required: true,
          type: 'string'
      },
      #swagger.parameters['toDate'] = {
          in: 'path',
          description: 'End Date',
          required: true,
          type: 'string'
      },
      #swagger.parameters['type'] = {
          in: 'path',
          description: 'Type of action',
          required: true,
          type: 'string'
      }
      
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      appStats.getAppStats(req.params.fromDate, req.params.toDate, req.params.type, (result) => {
        res.send(JSON.stringify(result));
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
  router.get(baseRoute + "/types", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Stats']
      #swagger.path = '/public/stats/types'
      #swagger.deprecated = false
      #swagger.ignore = true
      #swagger.summary = 'Get listing of Action Types'
       
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      appStats.getAppStatsTypes((result) => {
        res.send(JSON.stringify(result));
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
};
