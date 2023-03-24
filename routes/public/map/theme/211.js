const _211 = require("../../../../helpers/211");
const common = require("../../../../helpers/common");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/categories/:isFrench", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Map/Theme/211']
      #swagger.path = '/public/map/theme/211/Categories/{isFrench}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get 211 categories'
      #swagger.parameters['isFrench'] = {
          in: 'path',
          description: 'true/false to return french/english',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      _211.getCategories(req.params.isFrench, (result) => {
        res.json(result);
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  }),
    router.get(baseRoute + "/SubCategories/:category/:isFrench", middleWare, (req, res, next) => {
      /* 
      #swagger.tags = ['Public/Map/Theme/211']
      #swagger.path = '/public/map/theme/211/SubCategories/{category}/{isFrench}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get 211 sub-categories'
      #swagger.parameters['category'] = {
          in: 'path',
          description: 'Category',
          required: true,
          type: 'string'
      } ,
      #swagger.parameters['isFrench'] = {
          in: 'path',
          description: 'true/false to return french/english',
          required: true,
          type: 'string'
      } 
      */
      try {
        if (!common.isHostAllowed(req, res)) return;
        _211.getSubCategories(req.params.category, req.params.isFrench, (result) => {
          res.json(result);
          return next();
        });
      } catch (e) {
        console.error(e.stack);
        res.status(500).send();
        return next();
      }
    }),
    router.get(baseRoute + "/Results/:category/:subCategory/:age/:isFrench", middleWare, (req, res, next) => {
      /* 
      #swagger.tags = ['Public/Map/Theme/211']
      #swagger.path = '/public/map/theme/211/Results/{category}/{subCategory}/{age}/{isFrench}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get 211 Entries with filter parameters'
      #swagger.parameters['category'] = {
          in: 'path',
          description: 'Category',
          required: true,
          type: 'string'
      } ,
       #swagger.parameters['subCategory'] = {
          in: 'path',
          description: 'Sub-Category',
          required: true,
          type: 'string'
      } ,
       #swagger.parameters['age'] = {
          in: 'path',
          description: 'Age',
          required: true,
          type: 'string'
      } ,
      #swagger.parameters['isFrench'] = {
          in: 'path',
          description: 'true/false to return french/english',
          required: true,
          type: 'string'
      } 
      */
      try {
        if (!common.isHostAllowed(req, res)) return;
        _211.getResults(req.params.category, req.params.subCategory, req.params.age, req.params.isFrench, (result) => {
          res.json(result);
          return next();
        });
      } catch (e) {
        console.error(e.stack);
        res.status(500).send();
        return next();
      }
    });
};
