var express = require("express");
//var router = express.Router();
var routerPromise = require("express-promise-router");
const common = require("../helpers/common");
const search = require("../helpers/search");
const geoserverRest = require("../helpers/geoserverRest");

const routeWait = new routerPromise();

/* GET users listing. */
routeWait.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

routeWait.get("/getLayer", async function(req, res, next) {
  if (!common.isHostAllowed(req, res)) return;
  await geoserverRest.getLayer(async result => {
    if (result === undefined) await res.send(JSON.stringify([]));
    res.send(JSON.stringify(result));
  });
});

// SEARCH
routeWait.get("/search", async function(req, res, next) {
  const keywords = req.query.q;
  const limit = req.query.limit;
  const type = req.query.type;
  const muni = req.query.muni;

  if (!common.isHostAllowed(req, res)) return;
  await search.search(keywords, type, muni, limit, async result => {
    if (result === undefined) await res.send(JSON.stringify([]));
    res.send(JSON.stringify(result));
  });
});
// routeWait.get("/search/:keywords/:type?/:muni?/:limit?", async function(req, res, next) {
//   //console.log(req.params.limit);
//   if (!common.isHostAllowed(req, res)) return;
//   await search.search(req.params.keywords, req.params.type, req.params.muni, req.params.limit, async result => {
//     if (result === undefined) await res.send(JSON.stringify([]));
//     res.send(JSON.stringify(result));
//   });
// });

module.exports = routeWait;
