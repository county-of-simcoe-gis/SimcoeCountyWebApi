var express = require("express");
var routerPromise = require("express-promise-router");
const common = require("../helpers/common");
const search = require("../helpers/search");
const logger = require("../helpers/logger");
const routeWait = new routerPromise();

/* GET users listing. */
routeWait.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// SEARCH
routeWait.get("/search", async function (req, res, next) {
  try {
    const keywords = req.query.q;
    const limit = req.query.limit;
    const type = req.query.type;
    const muni = req.query.muni;

    if (!common.isHostAllowed(req, res)) return;
    await search.search(keywords, type, muni, limit, async (result) => {
      if (result === undefined) await res.send(JSON.stringify([]));
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    logger.error(e.stack);
    res.status(500).send();
  }
});

module.exports = routeWait;
