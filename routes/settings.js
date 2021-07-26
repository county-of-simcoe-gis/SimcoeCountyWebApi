var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");

const mapSettings = require("../helpers/mapSettings");
const common = require("../helpers/common");
const logger = require("../helpers/logger");
const config = require("../config.json");

// GET MAP SETTINGS
router.get("/getMap/:id", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;

    mapSettings.getMap(req.params.id, (result) => {
      if (result === undefined) res.send(JSON.stringify({ error: "ID Not Found" }));

      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
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
    logger.error(e.stack);
    res.status(500).send();
  }
});

// GET ARCGIS TOKEN
router.get("/arcgisToken", function (req, res, next) {
  try {
    if (!common.isHostAllowed(req, res)) return;
    const arcGISConfig = config["arcgis"];
    if (arcGISConfig === undefined) res.status(404).send();

    let ipAddress = req.connection.remoteAddress;
    const body = {
      username: arcGISConfig.username,
      password: arcGISConfig.password,
      client: "ip",
      ip: ipAddress,
    };
    var formBody = [];
    for (var property in body) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(body[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(arcGISConfig.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formBody,
    })
      .then((res) => res.json()) // expecting a json response
      .then((json) => {
        res.send(json);
      })
      .catch((error) => {
        console.error(url, error);
        logger.error(e.stack);
        res.status(500).send();
      });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

module.exports = router;
