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
    const baseUrl = `https://dd.weather.gc.ca/citypage_weather/ON/`;
    this.getCurrentHour(baseUrl, (highestLink) => {
      this.getWeatherLink(highestLink, city, (weatherLink) => {
        if (weatherLink) {
          this.getWeather(weatherLink, callback);
        } else {
          console.error("Weather link not found for city:", city);
          callback(null);
        }
      });
    });
  },
  getWeatherLink(highestLink, city, callback) {
    fetch(highestLink)
      .then((response) => {
        return response.text();
      })
      .then((responseText) => {
        // Extract XML files that contain the city code
        const linkRegex = /<a href="([^"]*MSC_CitypageWeather_s\d+_en\.xml)">[^<]*<\/a>/g;
        const matches = [...responseText.matchAll(linkRegex)];

        if (matches.length === 0) {
          callback(null);
          return;
        }

        // Find the file that contains the specific city code
        // Handle both formats: "s0000451" or just "0000451"
        const cityCode = city.startsWith("s") ? city : `s${city.padStart(7, "0")}`;
        const cityFile = matches.find((match) => match[1].includes(cityCode));

        if (cityFile) {
          // Construct the full URL by combining the base URL with the filename
          const baseUrl = highestLink.endsWith("/") ? highestLink : highestLink + "/";
          const fullUrl = baseUrl + cityFile[1];
          callback(fullUrl);
        } else {
          callback(null);
        }
      })
      .catch((error) => {
        console.error(error);
        callback(null);
      });
  },

  getWeather(url, callback) {
    fetch(url)
      .then((response) => {
        return response.text();
      })
      .then((responseText) => {
        callback(parser.parse(responseText));
      })
      .catch((error) => {
        console.error(error);
        callback(null);
      });
  },

  getCurrentHour(url, callback) {
    fetch(url)
      .then((response) => {
        return response.text();
      })
      .then((responseText) => {
        const highestLink = this.getHighestNumberedLink(responseText);
        // Construct full URL to the highest numbered directory
        const fullDirectoryUrl = url.endsWith("/") ? url + highestLink : url + "/" + highestLink;
        callback(fullDirectoryUrl);
      })
      .catch((error) => {
        console.error(error);
      });
  },

  getHighestNumberedLink(html) {
    // Extract all numbered directory links from the HTML
    // Simple regex to match: <a href="15/">15/</a>
    const linkRegex = /<a href="(\d+)\/">\d+\/</g;
    const matches = [...html.matchAll(linkRegex)];

    if (matches.length === 0) {
      console.log("No numbered directory links found");
      return null;
    }

    // Extract the numbers and find the highest one
    const numbers = matches.map((match) => parseInt(match[1], 10));
    const highestNumber = Math.max(...numbers);
    return `${highestNumber.toString().padStart(2, "0")}/`;
  },
};
