var express = require("express");
var router = express.Router();
var feedback = require("../helpers/feedback");
var appStats = require("../helpers/appStats");
const fetch = require("node-fetch");
const config = require("../config.json");
const geometry = require("../helpers/geometry");
const myMaps = require("../helpers/myMaps");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "opengiswebapi" });
});

// APP STATS
router.get("/appStats/:appName/:actionType/:description", function(req, res, next) {
  // CHECK THE CALLER
  if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
    res.send("Unauthorized Domain!");
    return;
  }

  // INSERT APP STAT
  appStats.insertAppStat(req.params.appName, req.params.actionType, req.params.description);
  res.send("OK");
});

// POST FEEDBACK
router.post("/postFeedback", function(req, res, next) {
  // CHECK THE CALLER
  if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
    res.send("Unauthorized Domain!");
    return;
  }

  // INSERT FEEDBACK
  const id = feedback.insertFeedback(req.body);
  res.send(id);
});

// GET FEEDBACK
router.get("/getFeedback/:id", function(req, res, next) {
  // CHECK THE CALLER
  if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
    res.send("Unauthorized Domain!");
    return;
  }

  feedback.getFeedback(req.params.id, feedback => {
    res.send(JSON.stringify(feedback));
  });
});

// GET CAPTCHA SCORE
router.get("/getCaptchaResponse/:type/:token", function(req, res, next) {
  // CHECK THE CALLER
  if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
    res.send("Unauthorized Domain!");
    return;
  }

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
  // CHECK THE CALLER
  if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
    res.send("Unauthorized Domain!");
    return;
  }

  // GET BUFFER FROM POSTGRES
  geometry.bufferGeometry(req.body, result => {
    res.send(JSON.stringify(result));
  });
});

// POST MYMAPS
router.post("/postMyMaps", function(req, res, next) {
  // CHECK THE CALLER
  if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
    res.send("Unauthorized Domain!");
    return;
  }

  // INSERT MYMAPS
  myMaps.insertMyMaps(req.body, id => {
    res.send(JSON.stringify({ id: id }));
  });
});

// GET MYMAPS
router.get("/getMyMaps/:id", function(req, res, next) {
  // CHECK THE CALLER
  if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
    res.send("Unauthorized Domain!");
    return;
  }

  myMaps.getMyMaps(req.params.id, result => {
    res.send(JSON.stringify(result));
  });
});

module.exports = router;
