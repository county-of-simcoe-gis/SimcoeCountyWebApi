const postgres = require("./postgres");
const common = require("./common");

module.exports = {
  getPingerStatus: function (callback) {
    var sql = `select * from public.tbl_service_pinger where id = 1`;
    const pg = new postgres({ dbName: "tabular" });
    pg.selectFirst(sql, (result) => {
      if (result.disable_minutes === null) callback({ status: false });
      else callback({ status: true });
    });
  },

  setServicePingerMinutes: function (minutes, callback) {
    // FORMAT THE DATE
    var dtString = common.getSqlDateString(new Date());

    // BUILD SQL
    var sql = `UPDATE public.tbl_service_pinger SET disable_minutes = $1,last_update = $2 where id = 1;`;
    if (minutes === 0) sql = `UPDATE public.tbl_service_pinger SET disable_minutes = null,last_update = null where id = 1;`;

    var values = [minutes, dtString];
    // INSERT RECORD
    const pg = new postgres({ dbName: "tabular" });
    pg.executeSqlWithValues(sql, values, (result) => {
      callback(result);
    });

    // SET IT BACK TO NULL
    if (minutes !== 0) {
      setTimeout(() => {
        sql = `UPDATE public.tbl_service_pinger SET disable_minutes = null,last_update = null where id = 1;`;
        pg.executeSqlWithValues(sql, [], (result) => {
          console.log("setting service pinger back to null");
        });
      }, minutes * 60000);
    }
  },
};
