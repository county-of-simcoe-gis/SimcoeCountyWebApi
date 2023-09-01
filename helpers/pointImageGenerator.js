const got = require("got");
const sqlServer = require("./sqlServer");
const ss = new sqlServer({ dbName: "weblive" });

module.exports = {
  getImage(mls, overview, width, height, callback) {
    // POINT TEMPLATE
    const pointURLTemplate = (serviceUrl, bBox, pointLayerId, mls, width, height) =>
      `${serviceUrl}export?bbox=${bBox}&bboxSR=3857&layers=&layerDefs=%7B${pointLayerId}%3A"MLSNO+%3D+%27${mls}%27"%7D&size=${width},${height}&format=jpg&transparent=true&dpi=96&f=image`;
    const pointOverviewURLTemplate = (serviceUrl, bBox, pointLayerId, mls, width, height) =>
      `${serviceUrl}export?bbox=${bBox}&bboxSR=3857&layers=&layerDefs=%7B${pointLayerId}%3A"MLSNO+%3D+%27${mls}%27"%7D&size=${width},${height}&format=jpg&transparent=true&dpi=96&f=image`;
    // BBOX TEMPLATE
    const bBoxTemplate = (minX, maxX, minY, maxY) => `${minX},${minY},${maxX},${maxY}`;

    // SERVICE URLS
    const serviceUrlPoint = "https://maps.simcoe.ca/arcgis/rest/services/TestServices/MLS_Image_Report/MapServer/";
    const serviceUrlOverview = "https://maps.simcoe.ca/arcgis/rest/services/SimcoeCounty/ParcelImageOverview_Report_MLS/MapServer/";

    // LAYER ID OF POINT
    const pointLayerId = 0;

    let serviceUrl = serviceUrlPoint;
    let bBox = "";
    if (overview === "true") {
      serviceUrl = serviceUrlOverview;
      bBox = bBoxTemplate(-8942711.7848, -8805736.6301, 5465832.4289, 5599902.9765);

      // CALLBACK URL
      var callbackUrl = pointOverviewURLTemplate(serviceUrl, bBox, pointLayerId, mls, width, height);
      callback(callbackUrl);
    } else {
      // GET ARN FROM SQL
      let values = [{ name: "mlsno", type: "NVarChar", typeOpts: { length: 250 }, value: mls }];
      const sql = `SELECT Shape.STBuffer(50).STEnvelope().ToString() as WKT from WEBLIVE.GIS.SC_MLS_POINTS_V2 WHERE MLSNO = @mlsno`;
      ss.selectFirstWithValues(sql, values, (result) => {
        console.log(result);
        if (!result || result.error) {
          console.error("No result");
          callback("");
        } else {
          if (!result.WKT) {
            console.error("WKT not found");
            callback();
          } else {
            var wkt = result.WKT;
            wkt = wkt.replace("POLYGON ((", "");
            wkt = wkt.replace("))", "");
            wkt = wkt.replaceAll(",", "");
            wktParts = wkt.split(" ");
            // BUILD EXTENT
            minX = wktParts[0];
            maxX = wktParts[2];
            minY = wktParts[1];
            maxY = wktParts[5];
            bBox = bBoxTemplate(minX, maxX, minY, maxY);

            // CALLBACK URL
            var callbackUrl = pointURLTemplate(serviceUrl, bBox, pointLayerId, mls, width, height);
            callback(callbackUrl);
          }
        }
      });
    }
  },
};
