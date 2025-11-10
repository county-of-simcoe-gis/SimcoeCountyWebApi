const sqlServer = require("./sqlServer");
const fetch = require("./fetchWrapper");
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
    // Use the new /today/ path structure for current weather data
    const baseUrl = `https://dd.weather.gc.ca/today/citypage_weather/ON/`;
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
        // Match any href containing .xml (handles URL-encoded characters)
        const linkRegex = /<a href="([^"]+\.xml)"[^>]*>/gi;
        const matches = [...responseText.matchAll(linkRegex)];

        if (matches.length === 0) {
          callback(null);
          return;
        }

        // Find the file that contains the specific city code
        // Handle both formats: "s0000451" or just "0000451"
        // Also handle URL-encoded underscores where s0000451 might appear as s0000451 or %73%30%30%30%30%34%35%31
        const cityCode = city.startsWith("s") ? city : `s${city.padStart(7, "0")}`;

        // Check for both regular and URL-encoded versions
        const cityFile = matches.find((match) => {
          const href = match[1];
          // Decode the URL to check for the city code
          const decodedHref = decodeURIComponent(href);
          return decodedHref.includes(cityCode) && decodedHref.includes("en.xml");
        });

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
        // Get current UTC hour
        const now = new Date();
        const currentUtcHour = now.getUTCHours();
        const currentHourString = currentUtcHour.toString().padStart(2, "0");

        // Check if the current hour directory exists
        const linkRegex = /<a href="(\d+)\/">\d+\/</g;
        const matches = [...responseText.matchAll(linkRegex)];
        const availableHours = matches.map((match) => parseInt(match[1], 10));

        let selectedHour;
        if (availableHours.includes(currentUtcHour)) {
          // Use current UTC hour if available
          selectedHour = currentHourString;
        } else {
          // Fallback to the highest numbered directory (most recent)
          console.log(`Current UTC hour ${currentHourString} not found, using latest available`);
          selectedHour = Math.max(...availableHours)
            .toString()
            .padStart(2, "0");
        }

        // Construct full URL to the selected hour directory
        const fullDirectoryUrl = url.endsWith("/") ? url + selectedHour + "/" : url + "/" + selectedHour + "/";
        callback(fullDirectoryUrl);
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
