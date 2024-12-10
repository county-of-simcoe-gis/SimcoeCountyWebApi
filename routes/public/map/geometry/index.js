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
      res.status(500);
      res.send();
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
        res.status(500);
        res.send();
        return next();
      }
    }),
    router.get(baseRoute + "/epsg/:code/wkt", middleWare, (req, res, next) => {
      /* 
        #swagger.tags = ['Public/Map']
        #swagger.path = '/public/map/geometry/epsg/{code}/wkt'
        #swagger.deprecated = false
        #swagger.ignore = false
        #swagger.summary = 'Get WKT for the specified EPSG code'
        #swagger.parameters['code'] = {
          in: 'path',
          description: 'EPSG Code',
          required: true,
          type: 'integer'
        }
      */
      try {
        const epsgCode = parseInt(req.params.code, 10);

        if (isNaN(epsgCode) || epsgCode <= 0) {
          res.status(400);
          res.send("Invalid EPSG code. It must be a positive integer.");
          return next();
        }
        // GET WKT FROM POSTGRES
        geometry.getEpsgWkt(epsgCode, (result) => {
          if (result && result.wkt) {
            res.set("Content-Type", "text/plain");
            res.send(result.wkt);
          } else {
            res.status(404);
            res.send("WKT not found for the specified EPSG code.");
          }
          return next();
        });
      } catch (e) {
        console.error(e.stack);
        res.status(500);
        res.send("Internal Server Error");
        return next();
      }
    }),
    router.get(baseRoute + "/epsg/:code/proj4", middleWare, (req, res, next) => {
      /* 
        #swagger.tags = ['Public/Map']
        #swagger.path = '/public/map/geometry/epsg/{code}/proj4'
        #swagger.deprecated = false
        #swagger.ignore = false
        #swagger.summary = 'Get Proj4 for the specified EPSG code'
        #swagger.parameters['code'] = {
          in: 'path',
          description: 'EPSG Code',
          required: true,
          type: 'integer'
        }
      */
      try {
        const epsgCode = parseInt(req.params.code, 10);

        if (isNaN(epsgCode) || epsgCode <= 0) {
          res.status(400);
          res.send("Invalid EPSG code. It must be a positive integer.");
          return next();
        }

        // GET Proj4 FROM POSTGRES
        geometry.getEpsgProj4(epsgCode, (result) => {
          if (result && result.proj4) {
            res.set("Content-Type", "text/plain");
            res.send(result.proj4);
          } else {
            res.status(404);
            res.send("Proj4 not found for the specified EPSG code.");
          }
          return next();
        });
      } catch (e) {
        console.error(e.stack);
        res.status(500);
        res.send("Internal Server Error");
        return next();
      }
    });
};
