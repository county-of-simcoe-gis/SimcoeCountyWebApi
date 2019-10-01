var express = require("express");
var router = express.Router();
var routerPromise = require("express-promise-router");
var feedback = require("../helpers/feedback");
var appStats = require("../helpers/appStats");
const fetch = require("node-fetch");
const config = require("../config.json");
const geometry = require("../helpers/geometry");
const myMaps = require("../helpers/myMaps");
const realEstate = require("../helpers/realEstate");
const streetAddresses = require("../helpers/streetAddresses");
const search = require("../helpers/search");
const common = require("../helpers/common");

var request = require("request");

const routeWait = new routerPromise();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "opengiswebapi" });
});

// APP STATS
router.get("/appStats/:appName/:actionType/:description", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  // INSERT APP STAT
  appStats.insertAppStat(req.params.appName, req.params.actionType, req.params.description);
  res.send("OK");
});

// POST FEEDBACK
router.post("/postFeedback", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  // INSERT FEEDBACK
  const id = feedback.insertFeedback(req.body);
  res.send(id);
});

// GET FEEDBACK
//https://opengis.simcoe.ca/api/getFeedback/99471e2e-cf1d-11e9-98ea-005056b2f523
//http://localhost:8085/getFeedback/99471e2e-cf1d-11e9-98ea-005056b2f523
router.get("/getFeedback/:id", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  feedback.getFeedback(req.params.id, feedback => {
    res.send(JSON.stringify(feedback));
  });
});

// GET CAPTCHA SCORE
router.get("/getCaptchaResponse/:type/:token", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  // GET THE PARAMS
  const type = req.params.type;
  const token = req.params.token;

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // RECAPTCHA DETAILS
  var secret = "";
  if (type === "DEV") secret = config.captchaDev;
  //DEV
  else secret = config.captchaProduction; //PRODUCTION

  const captchaUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret + "&response=" + token;
  fetch(captchaUrl, { method: "POST" })
    .then(res => res.json()) // expecting a json response
    .then(json => {
      res.send(json);
    });
});

// GEOMETRY - BUFFER
router.post("/postBufferGeometry", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  // GET BUFFER FROM POSTGRES
  geometry.bufferGeometry(req.body, result => {
    res.send(JSON.stringify(result));
  });
});

// GEOMETRY - CENTER
router.post("/postGetGeometryCenter", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  // GET CENTER FROM POSTGRES CUSTOM FUNCTION
  geometry.getGeometryCenter(req.body, result => {
    res.send(JSON.stringify(result));
  });
});

// POST MYMAPS
router.post("/postMyMaps", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  // INSERT MYMAPS
  myMaps.insertMyMaps(req.body, id => {
    res.send(JSON.stringify({ id: id }));
  });
});

// GET MYMAPS
router.get("/getMyMaps/:id", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  myMaps.getMyMaps(req.params.id, result => {
    if (result === undefined) res.send(JSON.stringify({ error: "ID Not Found" }));

    res.send(JSON.stringify(result));
  });
});

// GET MLS INFO
router.get("/getRealEstateInfo/:id", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  realEstate.getInfo(req.params.id, result => {
    if (result === undefined) res.send(JSON.stringify({ error: "MLS Number Not Found" }));

    res.send(JSON.stringify(result));
  });
});

// GET STREET NAMES
router.get("/getStreetNames/:streetName", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  streetAddresses.getStreets(req.params.streetName, result => {
    if (result === undefined) res.send(JSON.stringify({ error: "No Streets Found" }));

    res.send(JSON.stringify(result));
  });
});

// GET LOCATION
router.get("/searchById/:id", function(req, res, next) {
  console.log("in id");
  console.log(req.params.id);
  if (!common.isHostAllowed(req, res)) return;
  search.searchById(req.params.id, result => {
    if (result === undefined) res.send(JSON.stringify([]));
    res.send(JSON.stringify(result));
  });
});

// GET STREET TYPES
router.get("/getSearchTypes", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;
  search.getSearchTypes(result => {
    if (result === undefined) res.send(JSON.stringify([]));
    res.send(JSON.stringify(result));
  });
});

// GET APP STATS
router.get("/getMapImage", function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;

  //var webshot = require("webshot");

  var app = require("node-server-screenshot");
  app.fromURL("http://localhost:8085/imageGenerator/parcel.html", "test.png", function() {
    //an image of google.com has been saved at ./test.png
  });

  // request.get("http://localhost:8085/imageGenerator/parcel.html", function(error, response) {
  //   res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "no-cache" });
  //   res.end(response.body, "binary");
  //   //res.send(response.body);
  // });

  // router.get("http://localhost:8085/imageGenerator/parcel.html", function(error, res2, body) {
  //   if (!error && res2.statusCode == 200) {
  //     response.setHeader("Content-Type", "image/png");
  //     response.writeHead(200);
  //     response.write(body);
  //     response.end();
  //     res.send("OK");
  //   }
  // });

  // streetAddresses.getStreets(req.params.streetName, result => {
  //   if (result === undefined) res.send(JSON.stringify({ error: "No Streets Found" }));

  //   res.send(JSON.stringify(result));
  // });
});

// GET APP STATS
// router.get("/getAppStats/:streetName", function(req, res, next) {
//   if (!common.isHostAllowed(req, res)) return;

//   streetAddresses.getStreets(req.params.streetName, result => {
//     if (result === undefined) res.send(JSON.stringify({ error: "No Streets Found" }));

//     res.send(JSON.stringify(result));
//   });
// });

module.exports = router;
// module.exports = routeWait;
