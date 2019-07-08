var express = require('express');
var router = express.Router();
var feedback = require("../helpers/feedback");
const fetch = require('node-fetch');
var bodyParser = require("body-parser");

router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

var urlencodedParser = bodyParser.urlencoded({ limit: '50mb', extended: true });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'opengiswebapi' });
});

// POST FEEDBACK
router.post('/postFeedback', urlencodedParser, function (req, res, next) {

  // INSERT FEEDBACK
  const id = feedback.insertFeedback(req.body);
  res.send(id);
});


// GET FEEDBACK
router.get('/getFeedback/:id', function (req, res, next) {

  // GET FEEDBACK
  feedback.getFeedback(req.params.id, (feedback) => {
    res.send(JSON.stringify(feedback));
  });
});


// GET CAPTCHA SCORE
router.get('/getCaptchaResponse/:type/:token', function (req, res, next) {

  // GET THE PARAMS
  const type = req.params.type;
  const token = req.params.token;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // RECAPTCHA DETAILS
  var secret = '';
  if (type === "DEV")
    secret = '6Ld4tKcUAAAAAI7EqM8PgKhhLtkH5T605FPv6Gsv'; //DEV
  else
    secret = '6LfDs6cUAAAAAG46yXmvCzFWDWdo9pHx5YJFeJDb'; //PRODUCTION

  const captchaUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secret + '&response=' + token;
  fetch(captchaUrl, { method: 'POST' })
    .then(res => res.json()) // expecting a json response
    .then(json => {
      res.send(json);
    });
});

module.exports = router;
