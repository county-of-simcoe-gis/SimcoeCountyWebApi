var express = require("express");
var router = express.Router();
var feedback = require("../helpers/feedback");
var appStats = require("../helpers/appStats");
const fetch = require("node-fetch");
const config = require("../config.json");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "opengiswebapi" });
});

// APP STATS
router.get("/appStats/:appName/:actionType/:description", function(req, res, next) {
  console.log(req.params.appName);
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
  else secret = config.captachProduction; //PRODUCTION

  const captchaUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret + "&response=" + token;
  fetch(captchaUrl, { method: "POST" })
    .then(res => res.json()) // expecting a json response
    .then(json => {
      res.send(json);
    });
});

module.exports = router;
