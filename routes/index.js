var express = require("express");
var router = express.Router();
var routerPromise = require("express-promise-router");
var feedback = require("../helpers/feedback");
var appStats = require("../helpers/appStats");
const logger = require("../helpers/logger");

const fetch = require("node-fetch");
const config = require("../config.js");
const geometry = require("../helpers/geometry");
const myMaps = require("../helpers/myMaps");
const streetAddresses = require("../helpers/streetAddresses");
const search = require("../helpers/search");
const common = require("../helpers/common");
const weather = require("../helpers/weather");
const _211 = require("../helpers/211");
const mto = require("../helpers/mto");
const waze = require("../helpers/waze");
const servicePinger = require("../helpers/servicePinger");
const propertyReport = require("../helpers/propertyReport");
const parcelImageGenerator = require("../helpers/parcelImageGenerator");
var request = require("request");

const routeWait = new routerPromise();

/* GET home page. */
router.get("/", function (req, res, next) {
  try {
    res.send({ title: "opengiswebapi" });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// 211 CATEGORIES
router.get("/get211Categories/:isFrench", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // GET CATEGORIES
    _211.getCategories(req.params.isFrench, (result) => {
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// 211 SUB CATEGORIES
router.get("/get211SubCategories/:category/:isFrench", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // GET CATEGORIES
    _211.getSubCategories(req.params.category, req.params.isFrench, (result) => {
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// 211 RESULTS
router.get("/get211Results/:category/:subCategory/:age/:isFrench", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // GET CATEGORIES
    _211.getResults(req.params.category, req.params.subCategory, req.params.age, req.params.isFrench, (result) => {
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// APP STATS
router.get("/appStats/:appName/:actionType/:description", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // IP FROM PROXY
    const ip = req.headers["proxy-ip"] === undefined ? "LOCAL_DEBUGGING" : req.headers["proxy-ip"];

    // INSERT APP STAT
    appStats.insertAppStat(req.params.appName, req.params.actionType, req.params.description, ip);
    res.send("OK");
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET STATS
router.get("/getAppStats/:fromDate/:toDate/:type", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // GET APP STATS
    appStats.getAppStats(req.params.fromDate, req.params.toDate, req.params.type, (result) => {
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET STAT TYPES
router.get("/getAppStatsTypes", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // GET APP STATS
    appStats.getAppStatsTypes((result) => {
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// POST FEEDBACK
router.post("/postFeedback", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // INSERT FEEDBACK
    const id = feedback.insertFeedback(req.body);
    res.send(id);
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET FEEDBACK
//https://opengis.simcoe.ca/api/getFeedback/99471e2e-cf1d-11e9-98ea-005056b2f523
//http://localhost:8085/getFeedback/99471e2e-cf1d-11e9-98ea-005056b2f523
router.get("/getFeedback/:id", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    feedback.getFeedback(req.params.id, (feedback) => {
      res.send(JSON.stringify(feedback));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET CAPTCHA SCORE
router.get("/getCaptchaResponse/:type/:token", function (req, res, next) {
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
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GEOMETRY - BUFFER
router.post("/postBufferGeometry", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // GET BUFFER FROM POSTGRES
    geometry.bufferGeometry(req.body, (result) => {
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GEOMETRY - CENTER
router.post("/postGetGeometryCenter", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // GET CENTER FROM POSTGRES CUSTOM FUNCTION
    geometry.getGeometryCenter(req.body, (result) => {
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// POST MYMAPS
router.post("/postMyMaps", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // INSERT MYMAPS
    myMaps.insertMyMaps(req.body, (id) => {
      res.send(JSON.stringify({ id: id }));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET MYMAPS
router.get("/getMyMaps/:id", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    myMaps.getMyMaps(req.params.id, (result) => {
      if (result === undefined) res.send(JSON.stringify({ error: "ID Not Found" }));

      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET STREET NAMES
router.get("/getStreetNames/:streetName", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    streetAddresses.getStreets(req.params.streetName, (result) => {
      if (result === undefined) res.send(JSON.stringify({ error: "No Streets Found" }));

      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET LOCATION
router.get("/searchById/:id", function (req, res, next) {
  try {
    console.log("in id");
    console.log(req.params.id);
    if (!common.isHostAllowed(req, res)) return;
    search.searchById(req.params.id, (result) => {
      if (result === undefined) res.send(JSON.stringify([]));
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET STREET TYPES
router.get("/getSearchTypes", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    search.getSearchTypes((result) => {
      if (result === undefined) res.send(JSON.stringify([]));
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET WEATHER
router.get("/getCityWeather/:city", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    const city = req.params.city;
    weather.getCityWeather(city, (result) => {
      if (result === undefined) res.send(JSON.stringify([]));
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET MTO LAYER (See mto_config.json for layer names)
// http://localhost:8085/getMTO511Layer/ROADCONDITIONS
router.get("/getMTO511Layer/:layerName", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    mto.getMTOLayer(req.params.layerName, function (response) {
      res.send(response);
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET WAZE ALERT LAYER
// http://localhost:8085/getWazeAlertLayer/Alerts/Hazard
router.get("/getWazeAlertLayer/:category/:type", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    waze.getWazeLayer(req.params.category, req.params.type, function (response) {
      res.send(response);
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET WAZE JAM LAYER
// http://localhost:8085/getWazeJamLayer
router.get("/getWazeJamLayer", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    waze.getWazeLayer("JAMS", "", function (response) {
      res.send(response);
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET WAZE IRREGULAR LAYER
//http://localhost:8085/getWazeIrregularLayer
router.get("/getWazeIrregularLayer", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    waze.getWazeLayer("IRREGULAR", "", function (response) {
      res.send(response);
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET SERVICE PINGER STATUS
router.get("/getIsServicePingerDisabled/:secret", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // CHECK FOR SECRET
    if (req.params.secret !== config.app.servicePingerSecret) {
      res.send({ status: "UnAuthorized" });
      return;
    }

    servicePinger.getPingerStatus((result) => {
      res.send(result);
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET SERVICE PINGER TIME
router.get("/setServicePingerMinutes/:secret/:minutes", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    // CHECK FOR SECRET
    if (req.params.secret !== config.app.servicePingerSecret) {
      res.send({ status: "UnAuthorized" });
      return;
    }

    servicePinger.setServicePingerMinutes(req.params.minutes, (result) => {
      res.send(result);
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET PROPERTY REPORT
// http://localhost:8085/getPropertyReportInfo
router.get("/getPropertyReportInfo/:arn", function (req, res, next) {
  propertyReport.getPropertyReportInfo(req.params.arn, (result) => {
    res.json(result);
    return next();
  });
});

// GET PARCEL IMAGE
// http://localhost:8085/getParcelImage/434101000324801/false/800/800
const got = require("got");
router.get("/getParcelImage/:arn/:overview/:width/:height", function (req, res, next) {
  parcelImageGenerator.getImage(req.params.arn, req.params.overview, req.params.width, req.params.height, (resultUrl) => {
    res.set("Content-Type", "image/jpeg");
    got.stream(resultUrl).pipe(res);
  });
});

module.exports = router;
