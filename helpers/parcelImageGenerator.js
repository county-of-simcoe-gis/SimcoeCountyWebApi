const got = require("got").default;
const sqlServer = require("./sqlServer");
const ss = new sqlServer({ dbName: "weblive" });

module.exports = {
  getImage(arn, overview, width, height, callback) {
    // PARCEL TEMPLATE
    const parcelURLTemplate = (serviceUrl, bBox, parcelLayerId, arn, width, height) =>
      `${serviceUrl}export?bbox=${bBox}&layers=&layerDefs=%7B${parcelLayerId}%3A%22ARN+%3D+%27${arn}%27%22%7D&size=${width},${height}&format=jpg&transparent=true&dpi=96&f=image`;

    // BBOX TEMPLATE
    const bBoxTemplate = (minX, maxX, minY, maxY) => `${minX},${minY},${maxX},${maxY}`;

    // SERVICE URLS
    const serviceUrlParcel = "https://maps.simcoe.ca/arcgis/rest/services/Public/ParcelImage_Report/MapServer/";
    const serviceUrlOverview = "https://maps.simcoe.ca/arcgis/rest/services/Public/ParcelImageOverview_Report/MapServer/";

    // LAYER ID OF PARCEL
    const parcelLayerId = 0;

    let serviceUrl = serviceUrlParcel;
    let bBox = "";
    if (overview === "true") {
      serviceUrl = serviceUrlOverview;
      bBox = bBoxTemplate(-8942711.7848, -8805736.6301, 5465832.4289, 5599902.9765);

      // CALLBACK URL
      var callbackUrl = parcelURLTemplate(serviceUrl, bBox, parcelLayerId, arn, width, height);
      callback(callbackUrl);
    } else {
      // GET ARN FROM SQL
      let values = [{ name: "arn", type: "NVarChar", typeOpts: { length: 250 }, value: arn }];
      const sql = `SELECT geometry::EnvelopeAggregate(Shape).ToString() as WKT from WEBLIVE.GIS.TERANET_DAPF WHERE ARN = @arn`;
      ss.selectFirstWithValues(sql, values, (result) => {
        if (result.error) {
          console.error(result.error);
          callback();
        } else {
          if (!result.WKT) {
            console.error("WKT not found");
            callback();
          } else {
            var wkt = result.WKT;
            wkt = wkt.replace("POLYGON ((", "");
            wkt = wkt.replace("))", "");
            wkt = wkt.replace(",", "");
            wktParts = wkt.split(" ");

            // BUILD EXTENT
            minX = wktParts[0];
            maxX = wktParts[2];
            minY = wktParts[1];
            maxY = wktParts[5];
            bBox = bBoxTemplate(minX, maxX, minY, maxY);

            // CALLBACK URL
            var callbackUrl = parcelURLTemplate(serviceUrl, bBox, parcelLayerId, arn, width, height);
            callback(callbackUrl);
          }
        }
      });
    }
  },
};
