const common = require("../../../helpers/common");
const parcelImageGenerator = require("../../../helpers/parcelImageGenerator");
const got = require("got");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/image/:arn/:overview/:width/:height", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Reports']
      #swagger.path = '/public/reports/parcel/image/{arn}/{overview}/{width}/{height}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve parcel image'
       #swagger.parameters['arn'] = {
          in: 'path',
          description: 'ARN',
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
      parcelImageGenerator.getImage(req.params.arn, req.params.overview, req.params.width, req.params.height, (resultUrl) => {
        if (!resultUrl) {
          res.status(404).send();
        } else {
          res.set("Content-Type", "image/jpeg");
          got.stream(resultUrl).pipe(res);
        }
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
};
