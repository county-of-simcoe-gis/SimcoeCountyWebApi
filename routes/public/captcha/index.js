const fetch = require("node-fetch");
const config = require("../../../config.js");
const common = require("../../../helpers/common");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/response/:type/:token", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Captcha']
      #swagger.path = '/public/captcha/response/{type}/{token}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Captcha verification'
      #swagger.parameters['type'] = {
          in: 'path',
          description: 'Type',
          required: true,
          type: 'string'
      },
      #swagger.parameters['token'] = {
          in: 'path',
          description: 'Token',
          required: true,
          type: 'string'
      }  
    */
    try {
      if (!common.isHostAllowed(req, res)) return;

      // GET THE PARAMS
      const type = req.params.type;
      const token = req.params.token;

      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

      // RECAPTCHA DETAILS
      var secret = "";
      if (type === "DEV") secret = config.app.captchaDev;
      //DEV
      else secret = config.app.captchaProduction; //PRODUCTION

      const captchaUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret + "&response=" + token;
      fetch(captchaUrl, { method: "POST" })
        .then((res) => res.json()) // expecting a json response
        .then((json) => {
          res.send(json);
        });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
};
