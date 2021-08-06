const mssql = require("./mssql");
const common = require("./common");
const fetch = require("node-fetch");
var xml2js = require("xml2js");
var parser = new xml2js.Parser();

module.exports = {
  getRadarImages: function (fromDate, toDate, callback) {
    const db = new mssql({ dbName: "tabular" });
    const values = [
      { name: "fromDate", type: "DateTime", value: fromDate },
      { name: "toDate", type: "DateTime", value: toDate },
    ];
    const sqlQuery = `SELECT [RADAR_CODE],[RADAR_DESCRIPTION],[RADAR_DATE],[JS_MAPIMAGE],[FILE_NAME],datediff(minute,'2015-1-1',[RADAR_DATE]) as TIME_ID 
                      FROM dbo.tbl_Weather_Radar_Current_Images 
                      WHERE [RADAR_DATE] BETWEEN @fromDate AND @toDate
                      ORDER BY RADAR_DATE`;
    //console.log(sqlQuery);
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
        parser.parseString(responseText, function (err, result) {
          callback(result);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
