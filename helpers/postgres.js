const { Pool } = require("pg");
const config = require("../config.js");

module.exports = class Postgres {
  constructor(opt) {
    let conInfo = null;
    if (opt.dbName === "tabular") conInfo = config.postGres.connectionTabular;
    else if (opt.dbName === "weblive") conInfo = config.postGres.connectionWeblive;

    this.dbName = opt.dbName;
    this.pool = new Pool({
      user: conInfo.user,
      host: conInfo.host,
      database: conInfo.database,
      password: conInfo.password,
      port: conInfo.port,
    });

    // Error logging for pool events
    this.pool.on("error", (err, client) => {
      console.error(`[POSTGRES-${this.dbName.toUpperCase()}] Pool error:`, {
        error: err.message,
        stack: err.stack,
        time: new Date().toISOString(),
      });
    });
  }

  _logError(error, sql, values, method) {
    const truncatedSql = sql.length > 200 ? sql.substring(0, 200) + "..." : sql;

    console.error(`[POSTGRES-${this.dbName.toUpperCase()}] ${method} ERROR:`, {
      error: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      sql: truncatedSql,
      parameters: values || [],
      stack: error.stack,
      time: new Date().toISOString(),
    });
  }

  // INSERT RECORD
  executeSqlWithValues(sql, values, callback) {
    this.pool.query(sql, values, (err, res) => {
      if (err) {
        this._logError(err, sql, values, "executeSqlWithValues");
        if (callback !== undefined) callback({ result: err.stack });
      } else {
        if (callback !== undefined) callback({ result: "OK", rowsAffected: res.rowCount });
      }
    });
  }

  // INSERT RECORD AND RETURN ID OF NEW RECORD
  insertWithReturnId(sql, values, callback) {
    this.pool.query(sql, values, (err, res) => {
      if (err) {
        this._logError(err, sql, values, "insertWithReturnId");
        callback({ error: err.message });
      } else {
        const id = res.rows[0].id;
        callback(id);
      }
    });
  }

  // RETURN FIRST RECORD
  selectFirst(sql, callback) {
    this.pool.query(sql, (err, res) => {
      if (err) {
        this._logError(err, sql, null, "selectFirst");
        callback({ error: err.message });
        return;
      }

      if (res === undefined || !res.rows || res.rows.length === 0) {
        callback({ error: "Query returned ZERO records." });
        return;
      }

      const row = res.rows[0];
      callback(row);
    });
  }

  // RETURN FIRST RECORD USING VALUES
  selectFirstWithValues(sql, values, callback) {
    this.pool.query(sql, values, (err, res) => {
      if (err) {
        this._logError(err, sql, values, "selectFirstWithValues");
        callback({ error: err.message });
        return;
      }

      if (res === undefined || !res.rows || res.rows.length === 0) {
        callback({ error: "Query returned ZERO records." });
        return;
      }

      const row = res.rows[0];
      callback(row);
    });
  }

  // RETURN MULTIPLE RECORDS
  selectAll(sql, callback) {
    this.pool.query(sql, (err, res) => {
      if (err) {
        this._logError(err, sql, null, "selectAll");
        callback({ error: err.message });
        return;
      }

      if (res === undefined || !res.rows) {
        callback({ error: "Query returned ZERO records." });
        return;
      }

      callback(res.rows);
    });
  }

  // RETURN MULTIPLE RECORDS
  selectAllWithValues(sql, values, callback) {
    this.pool.query(sql, values, (err, res) => {
      if (err) {
        this._logError(err, sql, values, "selectAllWithValues");
        callback({ error: err.message });
        return;
      }

      if (res === undefined || !res.rows) {
        callback({ error: "Query returned ZERO records." });
        return;
      }

      callback(res.rows);
    });
  }

  // RETURN MULTIPLE RECORDS (ASYNC WITH WAIT)
  async selectAllWithValuesWait(sql, values, callback) {
    const client = await this.pool.connect();

    try {
      try {
        const res = await client.query(sql, values);
        return res.rows;
      } catch (err) {
        this._logError(err, sql, values, "selectAllWithValuesWait");
        throw err;
      }
    } finally {
      client.release();
    }
  }
};
