var express = require("express");
var router = express.Router();

const mapSettings = require("../helpers/mapSettings");
const common = require("../helpers/common");

// GET MAP SETTINGS
router.get("/getMap/:id", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    mapSettings.getMap(req.params.id, (result) => {
      if (result === undefined) {
        res.json({ error: "ID Not Found" });
      } else {
        res.json(result);
      }
      return next();
    });
  } catch (e) {
    console.error(e.stack);
    res.status(500).send();
    next();
  }
});

// GET DEFAULT MAP SETTINGS
router.get("/getDefaultMap", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    mapSettings.getDefaultMap((result) => {
      if (result === undefined) res.send(JSON.stringify({ error: "ID Not Found" }));

      res.send(JSON.stringify(result));
    });
  } catch (e) {
    console.error(e.stack);
    res.status(500).send();
  }
});

module.exports = router;
