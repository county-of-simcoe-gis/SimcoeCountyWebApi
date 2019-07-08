var postgres = require("./postgres");
const common = require("./common");

module.exports = {
  insertAppStat: function(appName, actionType, description) {
    // FORMAT THE DATE
    var dtString = common.getSqlDateString(new Date());

    // BUILD SQL
    var insertSql = `INSERT INTO public.tbl_app_stats (app_name,action_type,action_description,action_date) 
    values ('${appName}','${actionType}','${description}','${dtString}');`;

    // INSERT RECORD
    postgres.insert(insertSql);
  }
};
