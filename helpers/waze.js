// IMPORTS
var polyline = require("@mapbox/polyline");
var GeoJSON = require("geojson");
var request = require("request");
var moment = require("moment");

// WAZE URL API
var wazeURL =
  "https://na-georss.waze.com/rtserver/web/TGeoRSS?tk=ccp_partner&ccp_partner_name=The%20Corporation%20of%20the%20County%20of%20Simcoe&format=JSON&types=traffic,alerts,irregularities&polygon=-80.252000,43.898000;-80.416000,44.961000;-78.873000,44.992000;-78.840000,44.324000;-79.488000,44.028000;-80.252000,43.898000;-80.252000,43.898000";
module.exports = {
  // MAIN FUNCTION
  getWazeLayer: function (category, type, callback) {
    // GET POINT ALERT LAYER
    if (category.toUpperCase() == "ALERTS") {
      getWazeAlertLayer(type, function (response) {
        callback(response);
      });
    }

    // GET LINE JAM LAYER
    if (category.toUpperCase() == "JAMS") {
      getWazeJamsLayer(function (response) {
        callback(response);
      });
    }

    // GET LINE JAM LAYER
    if (category.toUpperCase() == "IRREGULAR") {
      getWazeIrregularLayer(function (response) {
        callback(response);
      });
    }
  },
};

// LINE IRREGULAR LAYER
function getWazeIrregularLayer(callback) {
  request({ uri: wazeURL }, function (error, response, body) {
    var allWaze = JSON.parse(body);
    var irregular = allWaze.irregularities;

    // NOTHING TO REPORT
    if (irregular != undefined) {
      irregular.forEach(function (element) {
        var newLine = [];
        element.line.forEach(function (coords) {
          var line = [coords.x, coords.y];
          newLine.push(line);
        });
        element.lineGeo = newLine;

        // ROUND SPEED
        element.speedKMH = Math.round(element.speed * 1.6);

        // CHANGE DELAY TO MINUTES
        if (element.delay != -1) element.delay = Math.round(element.delaySeconds / 60);

        // CONVERT UNIX TIME
        var date = new Date(element.updateDateMillis); // The 0 there is the key, which sets the date to the epoch
        element.date = moment(date).format("YYYY-MM-DD HH:MM:SS A");

        // DELETE PROPERTIES
        delete element.location;
        delete element.pubMillis;
        delete element.line;
      });

      // CONVERT THE ARRAY TO GEOJSON
      var geo = GeoJSON.parse(irregular, { LineString: "lineGeo" });
      //console.log(JSON.stringify(geo));

      // CALLBACK
      callback(geo);
    } else callback([]);
  });
}

// LINE JAMS LAYER
function getWazeJamsLayer(callback) {
  request({ uri: wazeURL }, function (error, response, body) {
    var allWaze = JSON.parse(body);
    var jams = allWaze.jams;
    jams.forEach(function (element) {
      var newLine = [];
      element.line.forEach(function (coords) {
        var line = [coords.x, coords.y];
        newLine.push(line);
      });
      element.lineGeo = newLine;

      // ROUND SPEED
      element.speedKMH = Math.round(element.speedKMH);

      // CHANGE DELAY TO MINUTES
      if (element.delay != -1) element.delay = Math.round(element.delay / 60);

      // CONVERT UNIX TIME
      var date = new Date(element.pubMillis); // The 0 there is the key, which sets the date to the epoch

      //locale.format(date, { datePattern: "yyyy-MM-dd HH:mm:ss", selector: "date" })
      element.date = moment(date).format("YYYY-MM-DD HH:MM:SS A");

      // DELETE PROPERTIES
      delete element.location;
      delete element.pubMillis;
      delete element.line;
    });

    // CONVERT THE ARRAY TO GEOJSON
    var geo = GeoJSON.parse(jams, { LineString: "lineGeo" });
    //console.log(JSON.stringify(geo));

    // CALLBACK
    callback(geo);
  });
}

// POINT ALERTS LAYERS
function getWazeAlertLayer(type, callback) {
  request({ uri: wazeURL }, function (error, response, body) {
    var allWaze = JSON.parse(body);
    var alerts = allWaze.alerts;
    var wazeByType = [];
    alerts.forEach(function (element) {
      // FILTERS
      if (type.toUpperCase() == "HAZARD" && element.type.toUpperCase() != "WEATHERHAZARD" && element.type.toUpperCase() != "HAZARD") {
        return;
      } else if (type.toUpperCase() != "HAZARD" && element.type.toUpperCase() != type.toUpperCase()) {
        return;
      }

      // SET X Y
      element.longitude = element.location.x;
      element.latitude = element.location.y;

      // CONVERT UNIX TIME
      var date = new Date(element.pubMillis); // The 0 there is the key, which sets the date to the epoch

      //locale.format(date, { datePattern: "yyyy-MM-dd HH:mm:ss", selector: "date" })
      element.date = moment(date).format("YYYY-MM-DD HH:MM:SS A");

      // DELETE PROPERTIES
      delete element.location;
      delete element.pubMillis;

      wazeByType.push(element);
    });

    // CONVERT THE ARRAY TO GEOJSON
    var geo = GeoJSON.parse(wazeByType, { Point: ["latitude", "longitude"] });
    //console.log(JSON.stringify(geo));

    // CALLBACK
    callback(geo);
  });
}
