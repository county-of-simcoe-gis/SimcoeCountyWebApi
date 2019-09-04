var express = require("express");
var router = express.Router();
var feedback = require("../helpers/feedback");
var appStats = require("../helpers/appStats");
const fetch = require("node-fetch");
const config = require("../config.json");
const geometry = require("../helpers/geometry");
const myMaps = require("../helpers/myMaps");
const realEstate = require("../helpers/realEstate");
const streetAddresses = require("../helpers/streetAddresses");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "opengiswebapi" });
});

// APP STATS
router.get("/appStats/:appName/:actionType/:description", function(req, res, next) {
  if (!isAllowed(req, res)) return;

  // INSERT APP STAT
  appStats.insertAppStat(req.params.appName, req.params.actionType, req.params.description);
  res.send("OK");
});

// POST FEEDBACK
router.post("/postFeedback", function(req, res, next) {
  if (!isAllowed(req, res)) return;

  // INSERT FEEDBACK
  const id = feedback.insertFeedback(req.body);
  res.send(id);
});

// GET FEEDBACK
router.get("/getFeedback/:id", function(req, res, next) {
  if (!isAllowed(req, res)) return;

  feedback.getFeedback(req.params.id, feedback => {
    res.send(JSON.stringify(feedback));
  });
});

// GET CAPTCHA SCORE
router.get("/getCaptchaResponse/:type/:token", function(req, res, next) {
  if (!isAllowed(req, res)) return;

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
  if (!isAllowed(req, res)) return;

  // GET BUFFER FROM POSTGRES
  geometry.bufferGeometry(req.body, result => {
    res.send(JSON.stringify(result));
  });
});

// POST MYMAPS
router.post("/postMyMaps", function(req, res, next) {
  if (!isAllowed(req, res)) return;

  // INSERT MYMAPS
  myMaps.insertMyMaps(req.body, id => {
    res.send(JSON.stringify({ id: id }));
  });
});

// GET MYMAPS
router.get("/getMyMaps/:id", function(req, res, next) {
  if (!isAllowed(req, res)) return;

  myMaps.getMyMaps(req.params.id, result => {
    if (result === undefined) res.send(JSON.stringify({ error: "ID Not Found" }));

    res.send(JSON.stringify(result));
  });
});

// GET MLS INFO
router.get("/getRealEstateInfo/:id", function(req, res, next) {
  if (!isAllowed(req, res)) return;

  realEstate.getInfo(req.params.id, result => {
    if (result === undefined) res.send(JSON.stringify({ error: "MLS Number Not Found" }));

    res.send(JSON.stringify(result));
  });
});

// GET STREET NAMES
router.get("/getStreetNames/:streetName", function(req, res, next) {
  if (!isAllowed(req, res)) return;

  streetAddresses.getStreets(req.params.streetName, result => {
    if (result === undefined) res.send(JSON.stringify({ error: "No Streets Found" }));

    res.send(JSON.stringify(result));
  });
});

// GET APP STATS
// router.get("/getAppStats/:streetName", function(req, res, next) {
//   if (!isAllowed(req, res)) return;

//   streetAddresses.getStreets(req.params.streetName, result => {
//     if (result === undefined) res.send(JSON.stringify({ error: "No Streets Found" }));

//     res.send(JSON.stringify(result));
//   });
// });

function isAllowed(req, res) {
  // CHECK THE CALLER
  if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
    res.send("Unauthorized Domain!");
    return false;
  }

  return true;
}
module.exports = router;
