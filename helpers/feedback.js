const email = require("./email");
const postgres = require("./postgres");
//import { Postgres } from "./postgres.js";
const config = require("../config.json");
const common = require("./common");
const mapUrl = config.mapUrl;
const feedbackUrl = config.feedbackUrl;

module.exports = {
  insertFeedback: function(feedback) {
    // FORMAT THE DATE
    var dtString = common.getSqlDateString(new Date());

    // BUILD SQL
    var insertSql = `INSERT INTO public.tbl_os_feedback (rating,for_business_use,email,comments,xminimum,yminimum,xmaximum,ymaximum,centerx,centery,scale,date_created,other_uses,education,recreation,real_estate,business,delivery,economic_development)
    values (${feedback.rating},${feedback.forBusinessUse ? 1 : 0},'${feedback.email}',
    '${feedback.comments}',${feedback.xmin},${feedback.ymin},${feedback.xmax},${feedback.ymax},${feedback.centerX},
    ${feedback.centerY},${feedback.scale},'${dtString}','${feedback.otherUses}',${feedback.education},${feedback.recreation},
    ${feedback.realEstate},${feedback.business},${feedback.delivery},${feedback.economicDevelopment}) RETURNING id;`;

    // INSERT RECORD
    const pg = new postgres({ dbName: "tabular" });
    pg.insertWithReturnId(insertSql, id => {
      var html = feedback.email === "" ? "" : "<div>email: " + feedback.email + "</div>";
      if (feedback.centerX !== null && feedback.centerY !== null && feedback.centerX !== 0 && feedback.centerY !== 0)
        html += "<div>" + mapUrl + "X=" + feedback.centerX + "&Y=" + feedback.centerY + "</div>";

      html += "<div>" + feedbackUrl + "ID=" + id + "</div>";

      email.sendMail("Feedback - opengis.simcoe.ca", html);
    });
  },

  getFeedback: function(id, callback) {
    var sql = `select * from public.tbl_os_feedback  where id = '${id}'`;
    const pg = new postgres({ dbName: "tabular" });
    pg.selectFirst(sql, result => {
      callback(result);
    });
  }
};
