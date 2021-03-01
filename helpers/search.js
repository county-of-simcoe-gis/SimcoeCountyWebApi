const postgres = require("./postgres");
const common = require("./common");
const fetch = require("node-fetch");
const searchConfig = require("./searchConfig.json");

const viewBox = searchConfig.OSMViewBox;
const useESRIGeocoder = searchConfig.useESRIGeocoder;
const useOSMSearch = searchConfig.useOSMSearch;

const geocodeUrlTemplate = (limit, keywords) =>
  `https://maps.simcoe.ca/arcgis/rest/services/SimcoeUtilities/AddressLocator/GeocodeServer/findAddressCandidates?f=json&maxLocations=${limit}&outFields=House,StreetName,SufType,City&Street=${keywords}`;
const osmUrlTemplateViewBox = (viewBox, limit, keywords) => `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&viewbox=${viewBox}&bounded=1&limit=${limit}&q=${keywords}`;
const osmUrlTemplateNoViewBox = (limit, keywords) => `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ca&limit=${limit}&q=${keywords}`;

module.exports = {
  search: async function (keywords, type = undefined, muni = undefined, limit = 10, callback) {
    try{
      // MINIMUM 1 CHAR
      if (keywords.length < 2) {
        callback([]);
        return;
      }

      const parts = keywords.split(" ");
      const isFirstWordNumeric = !isNaN(parts[0]);

      // FIRST PART IS NUMBER, ASSUME ADDRESS
      let allValues = [];
      let addresses = [];
      if (isFirstWordNumeric) {
        addresses = await this._searchAddress(keywords, muni, type, limit);

        // FALL BACK TO GEOCODE
        if (useESRIGeocoder && addresses.length === 0 && (type === "Address" || type === undefined || type === "All")) {
          const geocodeResult = await this._getJSON(geocodeUrlTemplate(limit, keywords));
          if (geocodeResult === undefined) callback([]);
          const candidates = geocodeResult.candidates;
          if (candidates === undefined) callback([]);
          candidates.forEach((candidate) => {
            if (candidate.score > 10) {
              const searchObj = {
                name: this._toTitleCase(candidate.address),
                type: "Geocode",
                municipality: this._toTitleCase(candidate.attributes.City),
                location_id: null,
                x: candidate.location.x,
                y: candidate.location.y,
              };
              addresses.push(searchObj);
            }
          });
        }
      }

      allValues.push(...addresses);
      // FILL IN THE SEARCH WITH OTHERS
      if (allValues.length < limit) {
        const numRecordsToReturn = limit - allValues.length;
        let nonAddresses = await this._searchNonAddress(keywords, type, muni, limit);
        allValues.push(...nonAddresses);
      }

      // // FILL IN THE SEARCH WITH OSM, ONLY IF NO RESULTS
      if ((useOSMSearch && allValues.length === 0) || type === "Open Street Map" || (allValues.length === 0 && type === "All")) {
        const numRecordsToReturn = limit - allValues.length;
        let osmPlaces = await this._searchOsm(keywords, type, numRecordsToReturn);
        allValues.push(...osmPlaces);
      }

      callback(allValues);
    }catch (e) {
      callback([]);
    }
  },

  searchById: function (id, callback) {
    const values = [id];
    const sql = `select * from public.tbl_search  where location_id = $1;`;
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAllWithValues(sql, values, (result) => {
      callback(result[0]);
    });
  },

  getSearchTypes: function (callback) {
    const sql = "select distinct(type) from public.tbl_search order by type";
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAll(sql, (result) => {
      let types = [];
      if (result.length >0 ){
        result.forEach((type) => {
          types.push(type.type);
        });
        
      }
      callback(types);
    });
  },

  _searchAddress: async function (value, muni = undefined, type = undefined, limit = 10) {
    const values = [value];

    if (type === "All" || type === "undefined") type = undefined;

    let sql = `select name,type,municipality,location_id from public.tbl_search  where name ilike $1 || '%' and type = 'Address'`;
    if (muni !== undefined && muni !== "undefined") {
      sql += " and municipality = '" + muni + "'";
    }

    if (type !== undefined && type !== "undefined") {
      sql += " and type = '" + type + "'";
    }

    sql += " limit " + limit + ";";

    const pg = new postgres({ dbName: "tabular" });
    const pgResult = await pg.selectAllWithValuesWait(sql, values);
    return pgResult;
  },

  _searchNonAddress: async function (value, type = undefined, muni = undefined, limit = 10) {
    if (type === "undefined" || type === "All") type = undefined;
    if (muni === "undefined") muni = undefined;

    const values = [value, limit];
    let sql = "";
    if (muni === undefined && type === undefined)
      sql = `select name,type,municipality,location_id from public.tbl_search  where name ilike $1 || '%' and type <> 'Address' order by priority limit $2;`;
    if (muni !== undefined && type === undefined) {
      values.push(muni);
      sql = `select name,type,municipality,location_id from public.tbl_search  where name ilike $1 || '%' and type <> 'Address' and municipality = $3 limit $2;`;
    } else if (muni !== undefined && type !== undefined) {
      values.push(muni);
      values.push(type);
      sql = `select name,type,municipality,location_id from public.tbl_search  where name ilike '%' || $1 || '%' and type = $4 and municipality = $3 and type <> 'Address' limit $2;`;
    } else if (muni === undefined && type !== undefined) {
      values.push(type);
      sql = `select name,type,municipality,location_id from public.tbl_search  where name ilike '%' || $1 || '%' and type = $3 and type <> 'Address' limit $2;`;
    }

    const pg = new postgres({ dbName: "tabular" });
    const pgResult = await pg.selectAllWithValuesWait(sql, values);
    return pgResult;
  },

  _searchOsm: async function (keywords, type = undefined, limit = 10) {
    if (type === "undefined") type = undefined;
    console.log(type);
    if (type !== "All" && type !== "Open Street Map") return [];

    console.log("in OSM");
    let osmUrl = osmUrlTemplateViewBox(viewBox, limit, keywords);
    let osmResult = await this._getJSON(osmUrl);
    let osmPlaces = [];
    if (osmResult.length > 0) {
      osmResult.forEach((osm) => {
        //console.log(osm);
        let city = "";
        if (osm.address.city !== undefined) city = osm.address.city;
        else city = osm.address.town;
        const searchObj = {
          name: osm.display_name,
          type: this._toTitleCase(osm.type + " - Open Street Map"),
          municipality: this._toTitleCase(city),
          location_id: null,
          x: osm.lon,
          y: osm.lat,
          place_id: osm.place_id,
        };
        osmPlaces.push(searchObj);
      });
    } else {
      // QUERY EVERYTHING
      // let osmResult = await this._getJSON(osmUrlTemplateNoViewBox(limit, keywords));
      // osmResult.forEach(osm => {
      //   //console.log(osm);
      //   let city = "";
      //   if (osm.address.city !== undefined) city = osm.address.city;
      //   else if (osm.address.town !== undefined) city = osm.address.town;
      //   else city = osm.address.state;
      //   const searchObj = { name: osm.display_name, type: this._toTitleCase(osm.type + " - Open Street Map"), municipality: this._toTitleCase(city), location_id: null, x: osm.lon, y: osm.lat, place_id: osm.place_id };
      //   osmPlaces.push(searchObj);
      // });
    }

    console.log(osmPlaces.length);
    return osmPlaces;
  },

  _isFirstWordNumeric: function (value) {
    return typeof value == "number";
  },

  async _getJSON(url, callback) {
    try {
      const response = await fetch(url);
      const json = await response.json();
      return json;
    } catch (error) {
      console.log(error);
      return {};
    }

    // const data = await fetch(url)
    //   .then(async res => {
    //     const resp = await res.json();
    //     return resp;
    //   })
    //   .catch(err => {
    //     console.log("Error: ", err);
    //   });
    // if (callback !== undefined) {
    //   //console.log(data);
    //   callback(data);
    // }

    //return await data;
  },

  _toTitleCase(str) {
    if (str === undefined) return ``;
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },
};
