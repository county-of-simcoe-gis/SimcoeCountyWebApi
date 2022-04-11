var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  try {
    res.send("respond with a resource");
  } catch (e) {
    console.error(e.stack);
    res.status(500).send();
  }
});

router.get("/test", function (req, res, next) {
  try {
    console.log("test");
    throw "OOPS!";
    res.send("respond with a resource");
  } catch (e) {
    console.error(e.stack);
    res.status(500).send();
  }
});

module.exports = router;
