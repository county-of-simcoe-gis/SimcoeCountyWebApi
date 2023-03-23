const weather = require("../../../../helpers/weather");
const common = require("../../../../helpers/common");
var moment = require("moment");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/RadarImages", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map/Tool/Weather']
      #swagger.path = '/public/map/tool/weather/RadarImages'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get radar images'
      #swagger.parameters['fromDate'] = {
          in: 'query',
          description: 'Start Date',
          required: true,
          type: 'string'
      } ,
      #swagger.parameters['toDate'] = {
          in: 'query',
          description: 'End Date',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      const fromDate = req.query.fromDate;
      const toDate = req.query.toDate;
      if (moment(fromDate).isValid() && moment(toDate).isValid()) {
        weather.getRadarImages(fromDate, toDate, (result) => {
          if (result === undefined || result.error) res.send([]);
          else res.send(result);
          return next();
        });
      } else {
        res.send([]);
        return next();
      }
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
  router.get(baseRoute + "/CityWeather/:city", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map/Tool/Weather']
      #swagger.path = '/public/map/tool/weather/CityWeather/{city}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get radar images'
      #swagger.parameters['city'] = {
          in: 'path',
          description: 'City',
          required: true,
          type: 'string'
      } 
     
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      const city = req.params.city;
      weather.getCityWeather(city, (result) => {
        if (result === undefined || result.error) res.send([]);
        else res.send(result);
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
