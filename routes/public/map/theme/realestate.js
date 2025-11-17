const e = require("cors");
const common = require("../../../../helpers/common");
const fetch = require("../../../../helpers/fetchWrapper");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/images/:listingId", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map/Theme/realestate']
      #swagger.path = '/public/map/theme/realestate/{listingId}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get Images by Listing ID'
      #swagger.parameters['listingId'] = {
          in: 'path',
          description: 'numeric listing id',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      fetch(`${process.env.BRIDGE_API_URL}?$filter=ListingId eq '${req.params.listingId}'&$select=City,Media,UnparsedAddress&access_token=${process.env.BRIDGE_API_KEY}`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.value && data.value.length > 0) {
            let images = [];
            data.value.forEach((item) => {
              if (item.Media) {
                item.Media.forEach((media) => {
                  images.push({ order: media.Order, url: media.MediaURL });
                });
              }
            });
            res.json(images);
          } else {
            res.json([]);
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
};
