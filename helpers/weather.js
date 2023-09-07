const sqlServer = require("./sqlServer");
const fetch = require("node-fetch");
const { XMLParser } = require("fast-xml-parser");
const options = {
  ignoreAttributes: false, // Ignore the XML attributes
  numberParseOptions: {
    leadingZeros: false,
  },
  attributeNamePrefix: "", // Default is an underscore. Set to null to disable it
  attributesGroupName: "$", // XML node attributes group name prefix
};
const parser = new XMLParser(options);

module.exports = {
  getRadarImages: function (fromDate, toDate, callback) {
    const db = new sqlServer({ dbName: "tabular" });

    const values = [
      { name: "fromDate", type: "NVarChar", typeOpts: { length: 50 }, value: fromDate },
      { name: "toDate", type: "NVarChar", typeOpts: { length: 50 }, value: toDate },
    ];
    const sqlQuery = `SELECT [RADAR_CODE],[RADAR_DESCRIPTION],[RADAR_DATE],[JS_MAPIMAGE],[FILE_NAME],datediff(minute,'2015-1-1',[RADAR_DATE]) as TIME_ID 
                      FROM dbo.tbl_Weather_Radar_Current_Images 
                      WHERE [RADAR_DATE] BETWEEN @fromDate AND @toDate
                      ORDER BY RADAR_DATE`;

    db.selectAllWithValues(sqlQuery, values, (result) => {
      callback(result);
    });
  },
  getCityWeather: function (city, callback) {
    // XML2JSON OPTIONS
    var options = {
      object: true,
      reversible: false,
      coerce: false,
      sanitize: true,
      trim: true,
      arrayNotation: false,
      alternateTextNode: false,
    };

    const url = (city) => `https://dd.weather.gc.ca/citypage_weather/xml/ON/${city}_e.xml`;
    return fetch(url(city))
      .then((response) => {
        return response.text();
      })
      .then((responseText) => {
        callback(parser.parse(responseText));
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
