const postgres = require("./postgres");

module.exports = {
  getNAICSSectors: function(callback) {
    const sql = `select code,description from tbl_naics_codes where length(code::varchar(20)) = 2`;
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAll(sql, result => {
      callback(result);
    });
  },

  getNAICSSubSectors: function(callback) {
    const sql = `select code,description from tbl_naics_codes where length(code::varchar(20)) = 2`;
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAll(sql, result => {
      callback(result);
    });
  }
};
