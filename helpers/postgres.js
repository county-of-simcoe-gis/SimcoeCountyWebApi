const { Pool } = require("pg");
const config = require("../config.json");

module.exports = class Postgres {
  constructor(opt) {
    let conInfo = null;
    if (opt.dbName === "tabular") conInfo = config.postgresConnectionTabular;
    else if (opt.dbName === "weblive") conInfo = config.postgresConnectionWeblive;

    this.pool = new Pool({
      user: conInfo.user,
      host: conInfo.host,
      database: conInfo.database,
      password: conInfo.password,
      port: conInfo.port
    });
  }

  // INSERT RECORD AND RETURN ID OF NEW RECORD
  insert(sql, callback) {
    this.pool.query(sql, (err, res) => {
      console.log(err ? { result: err.stack } : { result: "OK" });
    });
  }

  // INSERT RECORD AND RETURN ID OF NEW RECORD
  insertWithReturnId(sql, callback) {
    this.pool.query(sql, (err, res) => {
      const id = res.rows[0].id;
      callback(id);
    });
  }

  // RETURN FIRST RECORD
  selectFirst(sql, callback) {
    this.pool.query(sql, (err, res) => {
      if (res === undefined) {
        callback({ error: "Query returned ZERO records." });
        return;
      }

      const row = res.rows[0];
      callback(row);
    });
  }

  // RETURN FIRST RECORD
  selectAll(sql, callback) {
    this.pool.query(sql, (err, res) => {
      if (res === undefined) {
        callback({ error: "Query returned ZERO records." });
        return;
      }

      callback(res.rows);
    });
  }
};
