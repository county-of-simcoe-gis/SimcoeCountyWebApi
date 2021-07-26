const postgres = require("./postgres");
const common = require("./common");
const fetch = require("node-fetch");
var xml2js = require("xml2js");
var parser = new xml2js.Parser();

module.exports = {
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
