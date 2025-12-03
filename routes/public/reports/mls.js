const common = require("../../../helpers/common");
const pointImageGenerator = require("../../../helpers/pointImageGenerator");
const got = require("got").default;

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/image/:mls/:overview/:width/:height", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Reports']
      #swagger.path = '/public/reports/mls/image/{mls}/{overview}/{width}/{height}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve parcel image'
       #swagger.parameters['mls'] = {
          in: 'path',
          description: 'MLS',
          required: true,
          type: 'string'
      },
       #swagger.parameters['overview'] = {
          in: 'path',
          description: 'Is Overview',
          required: true,
          type: 'string'
      },
       #swagger.parameters['width'] = {
          in: 'path',
          description: 'Image Width',
          required: true,
          type: 'string'
      },
       #swagger.parameters['height'] = {
          in: 'path',
          description: 'Image height',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      pointImageGenerator.getImage(req.params.mls, req.params.overview, req.params.width, req.params.height, (resultUrl) => {
        if (!resultUrl) {
          res.status(404);
          res.send();
          return next();
        } else {
          res.set("Content-Type", "image/jpeg");
          console.log(resultUrl);
          got
            .stream(resultUrl)
            .on("error", function (e) {
              console.error(e.stack);
              res.status(500);
              res.send();
              return next();
            })
            .pipe(res);
        }
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
};
