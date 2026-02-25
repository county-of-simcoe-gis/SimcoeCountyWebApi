const SqlServer = require("../../../helpers/sqlServer");

module.exports = (baseRoute, middleWare, router) => {
  router.get(baseRoute + "/roadclosures", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Waze']
      #swagger.path = '/public/waze/roadclosures'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Get Waze Road Closures'
    */
    try {
      const db = new SqlServer({ dbName: "tabular" });
      const sql = `SELECT [id]
                        ,[type]
                        ,[subtype]
                        ,[polyline]
                        ,[street]
                        ,[starttime]
                        ,[endtime]
                        ,[description]
                        ,[direction]
                   FROM [TABULAR].[dbo].[ssview_wazeroadclosures_wgs84]`;

      db.selectAll(sql, (result) => {
        if (result === undefined || result.error) {
          res.send([]);
        } else {
          res.send(result);
        }
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500);
      res.send();
      return next();
    }
  });
};
