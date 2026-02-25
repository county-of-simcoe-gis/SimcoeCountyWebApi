/**
 * MTO (Ministry of Transportation Ontario) 511 Service
 * Fetches traffic data from 511on.ca API and converts to GeoJSON
 */

const polyline = require("@mapbox/polyline");
const GeoJSON = require("geojson");
const fetch = require("./fetchWrapper");

// GET CONFIG
const mtoSites = require("./mto_config.json");

// Road condition areas from config
const roadConditionAreas = mtoSites.sites["roadConditionAreas"];

/**
 * Check if coordinates are within Simcoe County bounds
 */
function isInCounty(long, lat) {
  return long > -80.5 && long < -79 && lat > 43.9 && lat < 45;
}

/**
 * Format Unix timestamp to readable date string
 */
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/**
 * Fetch MTO alerts (no geometry)
 */
async function getMTOAlerts(url) {
  const response = await fetch(url);
  return response.json();
}

/**
 * Fetch MTO polyline layer data (road conditions, HOV lanes)
 */
async function getMTOPolylineLayer(url) {
  const response = await fetch(url);
  const allMTO = await response.json();
  const allMTOWithGeoJSON = [];

  for (const element of allMTO) {
    // Only return roads with snow or ice conditions
    const mainCondition = element.Condition[0]?.toUpperCase() || "";

    if (mainCondition.includes("SNOW") || mainCondition.includes("ICE")) {
      // Decode polyline to GeoJSON
      const geoJSONGeom = polyline.toGeoJSON(element.EncodedPolyline);
      element.geoJSON = geoJSONGeom;

      // Delete the encoded polyline
      delete element.EncodedPolyline;

      // Set to English only (split bilingual description)
      if (element.LocationDescription !== undefined) {
        const englishDescription = element.LocationDescription.split("|")[0];
        element.LocationDescription = englishDescription;

        // Only use the roads found in config
        if (roadConditionAreas.includes(englishDescription)) {
          allMTOWithGeoJSON.push(element);
        }
      } else {
        allMTOWithGeoJSON.push(element);
      }
    }
  }

  if (allMTOWithGeoJSON.length > 0) {
    return GeoJSON.parse(allMTOWithGeoJSON, { GeoJSON: "geoJSON" });
  }

  return [];
}

/**
 * Fetch MTO point layer data (cameras, events, construction, etc.)
 */
async function getMTOPointLayer(url) {
  const response = await fetch(url);
  const isCameraLayer = url.toUpperCase().includes("CAMERA");

  if (isCameraLayer) {
    // Handle camera data with Views array
    const allCameras = await response.json();
    const cameras = [];

    for (const camera of allCameras) {
      const isIn = isInCounty(camera.Longitude, camera.Latitude);
      if (isIn && camera.Views && camera.Views.length > 0) {
        // Use the first enabled view
        const primaryView = camera.Views.find((v) => v.Status === "Enabled") || camera.Views[0];

        cameras.push({
          Longitude: camera.Longitude,
          Latitude: camera.Latitude,
          Location: camera.Location,
          Description: camera.Location,
          Url: primaryView.Url,
        });
      }
    }

    return GeoJSON.parse(cameras, { Point: ["Latitude", "Longitude"] });
  } else {
    // Handle other point layers (events, construction, etc.)
    const allMTO = await response.json();
    const mto = [];
    const now = new Date();

    for (const rec of allMTO) {
      const isIn = isInCounty(rec.Longitude, rec.Latitude);
      if (isIn) {
        // Handle planned events with date range
        if (rec.PlannedEndDate !== undefined && rec.StartDate !== undefined) {
          const startDate = new Date(rec.StartDate * 1000);
          const endDate = new Date(rec.PlannedEndDate * 1000);

          if (now >= startDate && now <= endDate) {
            rec.startDate = formatDate(rec.StartDate);
            rec.endDate = formatDate(rec.PlannedEndDate);
            mto.push(rec);
          }
        } else {
          mto.push(rec);
        }
      }
    }

    return GeoJSON.parse(mto, { Point: ["Latitude", "Longitude"] });
  }
}

/**
 * Main function to get MTO layer data by layer name
 * @param {string} layerName - Layer name (EVENTS, CONSTRUCTION, CAMERAS, ROADCONDITIONS, etc.)
 * @returns {Promise<Object|Array|null>} GeoJSON FeatureCollection or empty array
 */
async function getMTOLayer(layerName) {
  const layerDetails = mtoSites.sites[layerName.toUpperCase()];

  if (!layerDetails) {
    return null;
  }

  switch (layerDetails.geoType) {
    case "POINT":
      return getMTOPointLayer(layerDetails.url);
    case "POLYLINE":
      return getMTOPolylineLayer(layerDetails.url);
    case "NONE":
      return getMTOAlerts(layerDetails.url);
    default:
      return null;
  }
}

module.exports = {
  getMTOLayer,
};
