const myMaps = require("../../../../helpers/myMaps");
const common = require("../../../../helpers/common");

module.exports = (baseRoute, middleWare, router) => {
  router.post(baseRoute + "/", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map']
      #swagger.path = '/public/map/mymaps'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Save My Maps drawing'
       #swagger.parameters['obj'] = {
          in: 'body',
          description: 'JSON MyMaps drawing object',
          required: true,
          schema: { 
            $body:'body'
          }}
    */
    try {
      if (!common.isHostAllowed(req, res)) return;

      myMaps.insertMyMaps(req.body, (id) => {
        res.send({ id: id });
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  }),
    router.get(baseRoute + "/:id", middleWare, (req, res, next) => {
      /* 
      #swagger.tags = ['Public/Map']
      #swagger.path = '/public/map/mymaps/{id}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve My Maps drawing'
       #swagger.parameters['id'] = {
          in: 'path',
          description: 'My Maps Drawing ID',
          required: true,
          type: 'string'
      } 
    */
      try {
        if (!common.isHostAllowed(req, res)) return;

        myMaps.getMyMaps(req.params.id, (result) => {
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
