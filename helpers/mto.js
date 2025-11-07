// IMPORTS
var polyline = require("@mapbox/polyline");
var GeoJSON = require("geojson");
const fetch = require("./fetchWrapper");

var moment = require("moment");

// GET CONFIG
var mtoSites = require("./mto_config.json");

module.exports = {
  // MAIN FUNCTION
  getMTOLayer: function (layerName, callback) {
    // GET LAYER DETAILS FROM CONFIG
    var layerDetails = mtoSites.sites[layerName];
    if (layerDetails == undefined) return null;

    if (layerDetails.geoType == "POINT") {
      // GET POINT LAYER
      getMTOPointLayer(layerDetails.url, function (response) {
        callback(response);
      });
    } else if (layerDetails.geoType == "POLYLINE") {
      // GET POLYLINE LAYER
      getMTOPolylineLayer(layerDetails.url, mtoSites.sites["roadConditionAreas"], function (response) {
        callback(response);
      });
    } else {
      //GET ALERTS (NO GEOMETRY)
      getMTOAlerts(layerDetails.url, function (response) {
        callback(response);
      });
    }
  },
};

//ALERTS
function getMTOAlerts(url, callback) {
  fetch(url)
    .then((res) => res.json()) // expecting a json response
    .then((json) => {
      callback(json);
    });
}

//POLYLINE LAYERS
function getMTOPolylineLayer(url, locations, callback) {
  fetch(url)
    .then((res) => res.json()) // expecting a json response
    .then((json) => {
      var allMTO = json;
      var allMTOWithGeoJSON = [];
      allMTO.forEach(function (element) {
        // ONLY RETURN ROADS WITH SOME COVER
        var mainCondition = element.Condition[0].toUpperCase();
        var visibility = element.Visibility.toUpperCase();

        //if (mainCondition.indexOf('SNOW') != -1 || mainCondition.indexOf('ICE') != -1 || visibility.indexOf('POOR') != -1) {
        if (mainCondition.indexOf("SNOW") != -1 || mainCondition.indexOf("ICE") != -1) {
          // DECODE POLYLINE TO GEOJSON
          var geoJSON = polyline.toGeoJSON(element.EncodedPolyline);
          element.geoJSON = geoJSON;

          // DELETE THE ENCODED POLYLINE
          delete element.EncodedPolyline;

          // SET TO ENGLISH ONLY
          var englishDescription = "";
          if (element.LocationDescription != undefined) {
            englishDescription = element.LocationDescription.split("|")[0];
            element.LocationDescription = englishDescription;

            // ONLY USE THE ROADS FOUND IN CONFIG
            if (locations.indexOf(englishDescription) != -1) {
              // PUSH TO NEW ARRAY
              allMTOWithGeoJSON.push(element);
            }
          } else {
            // PUSH TO NEW ARRAY
            allMTOWithGeoJSON.push(element);
          }
        }
      });

      if (allMTOWithGeoJSON.length > 0) {
        // CONVERT THE ARRAY TO GEOJSON
        var geo = GeoJSON.parse(allMTOWithGeoJSON, { GeoJSON: "geoJSON" });

        // CALLBACK
        callback(geo);
      } else callback([]);
    });
}

// POINT LAYERS
function getMTOPointLayer(url, callback) {
  fetch(url)
    .then((res) => res.json()) // expecting a json response
    .then((json) => {
      var allMTO = json;
      var mto = [];
      allMTO.forEach(function (rec) {
        var isIn = isInCounty(rec.Longitude, rec.Latitude);
        if (isIn) {
          // PLANNED EVENTS
          if (rec.PlannedEndDate != undefined) {
            // CONVERT UNIX TIME
            var startDate = new Date(rec.StartDate * 1000); // The 0 there is the key, which sets the date to the epoch
            var endDate = new Date(rec.PlannedEndDate * 1000); // The 0 there is the key, which sets the date to the epoch
            var now = new Date();

            if (now >= startDate && now <= endDate) {
              rec.startDate = moment(startDate).format("YYYY-MM-DD HH:MM:SS A");
              rec.endDate = moment(endDate).format("YYYY-MM-DD HH:MM:SS A");

              mto.push(rec);
            }
          } else {
            mto.push(rec);
          }
        }
      });

      //ADD CUSTOM CAMERAS
      if (url.toUpperCase().indexOf("CAMERA") != -1) {
        // GREY COUNTY
        mto.push({ Description: "Roundabout at Gord Canning Drive and Grey County Road 19", Latitude: 44.4967, Longitude: -80.3018, Url: "https://www.grey.ca/cameras/roundabout.jpg" });
        mto.push({ Description: "Grey County Road 124 and Grey Road 4", Latitude: 44.3409, Longitude: -80.249, Url: "https://www.grey.ca/cameras/124-4.jpg" });
        mto.push({ Description: "Grey County Road 124 and Grey County Road 9", Latitude: 44.2675, Longitude: -80.2323, Url: "https://www.grey.ca/cameras/124-9.jpg" });

        // YORK REGION
        mto.push({ Description: "Highway 11 and Bathurst Street", Latitude: 44.105, Longitude: -79.5189, Url: "https://ww6.yorkmaps.ca/webtrafficimages/loc124.jpg" });
        mto.push({ Description: "King Road and Duffering Street", Latitude: 44.0763, Longitude: -79.5387, Url: "https://ww6.yorkmaps.ca/webtrafficimages/loc153.jpg" });
        mto.push({ Description: "Highway 27 and Highway 9", Latitude: 44.0111, Longitude: -79.6786, Url: "https://ww6.yorkmaps.ca/webtrafficimages/loc126.jpg" });

        // DUFFERIN COUNTY
        mto.push({ Description: "County Road 18 and 5th Sideroad", Latitude: 43.9725, Longitude: -79.992, Url: "http://cameras.dufferincounty.ca/airport-5.jpg" });
        mto.push({ Description: "County Road 21 and County Road 24", Latitude: 44.2169, Longitude: -80.2199, Url: "http://cameras.dufferincounty.ca/124-21.jpg" });

        // DURHAM
        mto.push({
          Description: "Highway 48 and Simcoe Street",
          Latitude: 44.4252,
          Longitude: -79.1226,
          Url: "https://apps.durham.ca/Applications/Traffic/TrafficWatch/TrafficWatchData/10152339.jpg",
        });
      }

      // CONVERT THE ARRAY TO GEOJSON
      var geo = GeoJSON.parse(mto, { Point: ["Latitude", "Longitude"] });

      // CALLBACK
      callback(geo);
    });
}

function getGreyCountyCameras() {
  var cam1 = { Description: "Roundabout at Gord Canning Drive and Grey County Road 19", Latitude: 44.4967, Longitude: -80.3018, Url: "https://www.grey.ca/cameras/roundabout.jpg" };
  var cam2 = { Description: "Grey County Road 124 and Grey Road 4", Latitude: 44.3409, Longitude: -80.249, Url: "https://www.grey.ca/cameras/124-4.jpg" };
  var cam3 = { Description: "Grey County Road 124 and Grey County Road 9", Latitude: 44.2675, Longitude: -80.2323, Url: "https://www.grey.ca/cameras/124-9.jpg" };
}

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function isInCounty(long, lat) {
  if (long > -80.5 && long < -79 && lat > 43.9 && lat < 45) return true;
  else return false;
}
