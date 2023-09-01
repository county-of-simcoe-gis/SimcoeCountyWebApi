const common = require("../../../helpers/common");
const search = require("../../../helpers/search");
const streetAddresses = require("../../../helpers/streetAddresses");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute, middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Search']
      #swagger.path = '/public/search'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Search of property information'
       #swagger.parameters['q'] = {
          in: 'query',
          description: 'Search Text',
          required: true,
          type: 'string'
      },
      #swagger.parameters['limit'] = {
          in: 'query',
          description: 'Limit number of records returned',
          required: true,
          type: 'string'
      },
      #swagger.parameters['type'] = {
          in: 'query',
          description: 'Type of search',
          required: true,
          type: 'string'
      },
      #swagger.parameters['muni'] = {
          in: 'query',
          description: 'Municipality to limit search to',
          required: true,
          type: 'string'
      }     
    */
    try {
      const keywords = req.query.q;
      const limit = req.query.limit;
      const type = req.query.type;
      const muni = req.query.muni;

      if (!common.isHostAllowed(req, res)) return;
      search.search(keywords, type, muni, limit, async (result) => {
        if (result === undefined) res.send([]);
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

  router.get(baseRoute + "/:id", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Search']
      #swagger.path = '/public/search/{id}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve a single search item'
       #swagger.parameters['id'] = {
          in: 'path',
          description: 'Specific searchable item ID',
          required: true,
          type: 'string'
      },
      
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      search.searchById(req.params.id, (result) => {
        if (result === undefined) res.send([]);
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
  router.get(baseRoute + "/street/:streetName", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Search']
      #swagger.path = '/public/search/street/{streetName}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Find a street'
       #swagger.parameters['streetName'] = {
          in: 'path',
          description: 'Street Name',
          required: true,
          type: 'string'
      },
      
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      streetAddresses.getStreets(req.params.streetName, (result) => {
        if (result === undefined) res.send({ error: "No Streets Found" });
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
  router.get(baseRoute + "/types", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Search']
      #swagger.path = '/public/search/types'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get list of search types'
       
      
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      search.getSearchTypes((result) => {
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
