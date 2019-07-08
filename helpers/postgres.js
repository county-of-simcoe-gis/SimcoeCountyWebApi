const { Pool } = require("pg");
const config = require("../config.json");

const conInfo = config.postgresConnection;
const pool = new Pool({
  user: conInfo.user,
  host: conInfo.host,
  database: conInfo.database,
  password: conInfo.password,
  port: conInfo.port
});

module.exports = {
  // INSERT RECORD AND RETURN ID OF NEW RECORD
  insert: function(sql, callback) {
    console.log(sql);
    pool.query(sql, (err, res) => {
      console.log(err ? { result: err.stack } : { result: "OK" });
    });
  },

  // INSERT RECORD AND RETURN ID OF NEW RECORD
  insertWithReturnId: function(sql, callback) {
    pool.query(sql, (err, res) => {
      const id = res.rows[0].id;
      callback(id);
    });
  },

  // RETURN FIRST RECORD
  selectFirst: function(sql, callback) {
    pool.query(sql, (err, res) => {
      const row = res.rows[0];
      callback(row);
    });
  }
};
