const sql = require("mssql");

const config = require("../config").sqlServer;
module.exports = class SqlServer {
  constructor(opt) {
    let conInfo = null;
    if (opt.dbName === "tabular") conInfo = config.connectionTabular;
    else if (opt.dbName === "weblive") conInfo = config.connectionWebLive;

    // const sqlConStringTemplate = (userName, password, server, db) => `mssql://${userName}:${password}@${server}/${db}`;
    // this.sqlConString = sqlConStringTemplate(conInfo.user, conInfo.password, conInfo.host, conInfo.database);

    // promise style:
    // this.pool = new sql.ConnectionPool(this.sqlConString);
    this.pool = new sql.ConnectionPool({
      user: conInfo.user,
      password: conInfo.password,
      server: conInfo.host,
      database: conInfo.database,
      options: {
        trustServerCertificate: true,
      },
    });
    this.poolConnect = this.pool.connect();

    this.pool.on("error", (err) => {
      console.log("Error Connecting to Sql Server");
    });
  }

  select(sqlString, callback) {
    if (sqlString.includes("'")) sqlString.replace("''");
    this.poolConnect.then((pool) => {
      pool.request().query(sqlString, (err, result) => {
        if (err !== null) console.dir(err);

        callback(result);
        sql.close();
      });
    });
  }

  // RETURN FIRST RECORD
  selectFirst(sqlString, callback) {
    try {
      this.poolConnect.then((pool) => {
        const request = pool.request();
        request.query(sqlString, (err, res) => {
          if (err !== null) console.dir(err);
          if (!res) {
            callback({ error: "Query returned ZERO records." });
          } else {
            callback(res.recordset[0]);
          }
          sql.close();
        });
      });
    } catch (err) {
      callback({ error: "Query failed!" });
    }
  }
  // RETURN MULTIPLE RECORDS
  selectAll(sqlString, callback) {
    try {
      this.poolConnect.then((pool) => {
        const request = pool.request();
        request.query(sqlString, (err, res) => {
          if (err !== null) console.dir(err);
          if (!res) {
            callback({ error: "Query returned ZERO records." });
          } else {
            callback(res.recordset);
          }
          sql.close();
        });
      });
    } catch (err) {
      callback({ error: "Query failed!" });
    }
  }
  // RETURN MULTIPLE RECORDS
  selectAllWithValues(sqlString, values, callback) {
    try {
      this.poolConnect.then((pool) => {
        const request = pool.request();
        values.forEach((item) => {
          request.input(item.name, this.getSqlType(item.type, item.typeOpts), item.value);
        });
        request.query(sqlString, (err, res) => {
          if (err !== null) console.dir(err);
          if (!res) {
            callback({ error: "Query returned ZERO records." });
          } else {
            callback(res.recordset);
          }
        });
      });
    } catch (err) {
      callback({ error: "Query failed!" });
    } finally {
      sql.close();
    }
  }

  selectFirstWithValues(sqlString, values, callback) {
    try {
      this.poolConnect.then((pool) => {
        const request = pool.request();
        values.forEach((item) => {
          request.input(item.name, this.getSqlType(item.type, item.typeOpts), item.value);
        });
        request.query(sqlString, (err, res) => {
          if (err !== null) console.dir(err);
          if (!res) {
            callback({ error: "Query returned ZERO records." });
          } else {
            callback(res.recordset[0]);
          }
        });
      });
    } catch (err) {
      callback({ error: "Query failed!" });
    } finally {
      sql.close();
    }
  }
  executeQueryWithValues(sqlString, values, callback) {
    try {
      this.poolConnect.then((pool) => {
        const request = pool.request();
        values.forEach((item) => {
          request.input(item.name, this.getSqlType(item.type, item.typeOpts), item.value);
        });
        request.query(sqlString, (err, res) => {
          if (err !== null) console.dir(err);
          if (!res) {
            callback(err);
          } else {
            callback(res.recordset);
          }
        });
      });
    } catch (err) {
      callback({ error: "Query failed!" });
    } finally {
      sql.close();
    }
  }

  executeQuery(sqlString, callback) {
    this.poolConnect.then((pool) => {
      pool.request().query(sqlString, (err, result) => {
        if (err !== null) {
          console.dir(err);
          callback(err);
          return;
        }

        callback(result);
        sql.close();
      });
    });
  }

  getSqlType(type, opts = undefined) {
    let precision = 0;
    let scale = 0;
    let length = 0;
    if (opts) {
      if (opts.precision) precision = opts.precision;
      if (opts.scale) scale = opts.scale;
      if (opts.length) length = opts.length;
    }

    switch (type) {
      case "Bit":
        return sql.Bit;
      case "BigInt":
        return sql.BigInt;
      case "Decimal":
        return sql.Decimal(precision, scale);
      case "Float":
        return sql.Float;
      case "Int":
        return sql.Int;
      case "Money":
        return sql.Money;
      case "Numeric":
        return sql.Numeric(precision, scale);
      case "SmallInt":
        return sql.SmallInt;
      case "SmallMoney":
        return sql.SmallMoney;
      case "Real":
        return sql.Real;
      case "TinyInt":
        return sql.TinyInt;
      case "Char":
        return sql.Char(length);
      case "NChar":
        return sql.NChar(length);
      case "Text":
        return sql.Text;
      case "NText":
        return sql.NText;
      case "VarChar":
        return sql.VarChar(length);
      case "NVarChar":
        return sql.NVarChar(length);
      case "Xml":
        return sql.Xml;
      case "Time":
        return sql.Time(scale);
      case "Date":
        return sql.Date;
      case "DateTime":
        return sql.DateTime;
      case "DateTime2":
        return sql.DateTime2(scale);
      case "DateTimeOffset":
        return sql.DateTimeOffset(scale);
      case "SmallDateTime":
        return sql.SmallDateTime;
      case "UniqueIdentifier":
        return sql.UniqueIdentifier;
      case "Variant":
        return sql.Variant;
      case "Binary":
        return sql.Binary;
      case "VarBinary":
        return sql.VarBinary(length);
      case "Image":
        return sql.Image;
      case "UDT":
        return sql.UDT;
      case "Geography":
        return sql.Geography;
      case "Geometry":
        return sql.Geometry;
      default:
        return sql.Text;
    }
  }
};
