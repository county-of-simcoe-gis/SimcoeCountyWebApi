const sql = require("mssql");
const config = require("../config.json");

module.exports = class MSSql {
  constructor(opt) {
    let conInfo = null;
    if (opt.dbName === "tabular") conInfo = config.sqlServerConnectionTabular;
    else if (opt.dbName === "weblive") conInfo = config.sqlServerConnectionWeblive;
    this.sqlConfig = {
      server: conInfo.host,
      user: conInfo.user,
      password: conInfo.password,
      database: conInfo.database,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: conInfo.encrypt === undefined ? false : conInfo.encrypt,
      },
    };
  }

  // RETURN FIRST RECORD
  selectFirst(sqlString, callback) {
    console.log(sqlString);
    sql
      .connect(this.sqlConfig)
      .then((pool) => {
        return pool.request().query(sqlString);
      })
      .then((res) => {
        if (res === undefined) {
          callback({ error: "Query returned ZERO records." });
          return;
        }
        callback(res.recordset[0]);
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  }
  // RETURN MULTIPLE RECORDS
  selectAll(sqlString, callback) {
    console.log(sqlString);
    sql
      .connect(this.sqlConfig)
      .then((pool) => {
        return pool.request().query(sqlString);
      })
      .then((res) => {
        if (res === undefined) {
          callback({ error: "Query returned ZERO records." });
          return;
        }
        callback(res.recordset);
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  }
  // RETURN MULTIPLE RECORDS
  selectAllWithValues(sqlString, values, callback) {
    sql
      .connect(this.sqlConfig)
      .then((pool) => {
        const request = pool.request();
        values.forEach((item) => {
          request.input(item.name, this.getSqlType(item.type, item.typeOpts), item.value);
        });
        return request.query(sqlString);
      })
      .then((res) => {
        if (res === undefined) {
          callback({ error: "Query returned ZERO records." });
          return;
        }
        callback(res.recordset);
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  }

  getSqlType(type, opts = undefined) {
    const { precision, scale, length } = opts;
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
