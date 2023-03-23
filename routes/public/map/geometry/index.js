const geometry = require("../../../../helpers/geometry");
const common = require("../../../../helpers/common");

module.exports = (baseRoute, middleWare, router) => {
  router.post(baseRoute + "/buffer", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map']
      #swagger.path = '/public/map/geometry/buffer'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Provide a buffer geometry for the submitted geometry'
       #swagger.parameters['obj'] = {
          in: 'body',
          description: 'Geometry Details',
          required: true,
          schema: { 
            $geoJSON:'geoJSON',
            $distance:'distance',
            $srid:'srid'
          }}
    */

    try {
      if (!common.isHostAllowed(req, res)) return;

      // GET BUFFER FROM POSTGRES
      geometry.bufferGeometry(req.body, (result) => {
        res.send(result);
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  }),
    router.post(baseRoute + "/center", middleWare, (req, res, next) => {
      /* 
      #swagger.tags = ['Public/Map']
      #swagger.path = '/public/map/geometry/center'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Provide a center point geometry for the submitted geometry'
       #swagger.parameters['obj'] = {
          in: 'body',
          description: 'Geometry Details',
          required: true,
          schema: { 
            $geoJSON:'geoJSON',
            $srid:'srid'
          }}
    */
      try {
        if (!common.isHostAllowed(req, res)) return;

        // GET CENTER FROM POSTGRES CUSTOM FUNCTION
        geometry.getGeometryCenter(req.body, (result) => {
          res.send(result);
          return next();
        });
      } catch (e) {
        console.error(e.stack);
        res.status(500).send();
        return next();
      }
    });
};
