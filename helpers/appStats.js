const postgres = require("./postgres");
const common = require("./common");

module.exports = {
  insertAppStat: function (appName, actionType, description, ip) {
    // FORMAT THE DATE
    var dtString = common.getSqlDateString(new Date());

    // BUILD SQL
    var insertSql = `INSERT INTO public.tbl_app_stats (app_name,action_type,action_description,action_date,ip) 
    values ('${appName}','${actionType}','${description}','${dtString}','${ip}');`;

    // INSERT RECORD
    const pg = new postgres({ dbName: "tabular" });
    pg.insert(insertSql);
  },

  getAppStats: function (fromDate, toDate, type, callback) {
    //select date_day,total from public.get_app_stats('2019-09-01','2019-10-8', 'STARTUP_MAP_LOAD');
    const sqlTemplate = (fromDate, toDate, type) => `select x,y from public.get_app_statsxy('${fromDate}','${toDate}', '${type}');`;
    const sql = sqlTemplate(fromDate, toDate, type);
    console.log(sql);
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAll(sql, (result) => {
      callback(result);
    });
  },

  getAppStatsTypes: function (callback) {
    const sql = "select value as label, value from ((select distinct(action_type) as value from view_app_stats ass where action_type <> '_' order by action_type)) cc";
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAll(sql, (result) => {
      callback(result);
    });
  },
};
