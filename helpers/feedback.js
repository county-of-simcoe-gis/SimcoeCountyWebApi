const email = require("./email");
const postgres = require("./postgres");
//import { Postgres } from "./postgres.js";
const config = require("../config.json");
const common = require("./common");
const mapSettings = require("./mapSettings");

const mapUrl = config.mapUrl;
const feedbackUrl = config.feedbackUrl;

module.exports = {
  insertFeedback: function (feedback) {
    console.log(feedback);
    // FORMAT THE DATE
    var dtString = common.getSqlDateString(new Date());

    // BUILD SQL
    var insertSql = `INSERT INTO public.tbl_os_feedback (rating,for_business_use,email,comments,xminimum,yminimum,xmaximum,ymaximum,centerx,centery,scale,date_created,other_uses,education,recreation,real_estate,business,delivery,economic_development,report_problem,my_maps_id,feature_id) 
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING id;`;
    var values = [
      feedback.rating,
      feedback.forBusinessUse ? 1 : 0,
      feedback.email,
      feedback.comments,
      feedback.xmin,
      feedback.ymin,
      feedback.xmax,
      feedback.ymax,
      feedback.centerX,
      feedback.centerY,
      feedback.scale,
      dtString,
      feedback.otherUses,
      feedback.education,
      feedback.recreation,
      feedback.realEstate,
      feedback.business,
      feedback.delivery,
      feedback.economicDevelopment,
      feedback.reportProblem,
      feedback.myMapsId,
      feedback.featureId,
    ];
    // INSERT RECORD
    const pg = new postgres({ dbName: "tabular" });
    pg.insertWithReturnId(insertSql, values, (id) => {
      var html =
        feedback.email === "" ? "" : "<div>email: " + feedback.email + "</div>";
      html += "<div>" + feedbackUrl + "ID=" + id + "</div>";
      if (feedback.centerX !== null && feedback.centerY !== null)
        html +=
          "<div>" +
          mapUrl +
          "X=" +
          feedback.centerX +
          "&Y=" +
          feedback.centerY +
          "</div>";

      if (feedback.myMapsId !== null)
        html +=
          "<div>" +
          mapUrl +
          "TAB=MyMaps&MY_MAPS_ID=" +
          feedback.myMapsId +
          "&MY_MAPS_FEATURE_ID=" +
          feedback.featureId +
          "</div>";
      if (feedback.map_id !== undefined) {
        mapSettings.getMap(feedback.map_id, (response) => {
          const map_settings = JSON.parse(
            JSON.parse(JSON.stringify(response)).json
          );

          email.sendMail(
            "Feedback - opengis.simcoe.ca",
            html,
            true,
            map_settings.feedback_contact
          );
        });
      } else email.sendMail("Feedback - opengis.simcoe.ca", html);
    });
  },

  getFeedback: function (id, callback) {
    var sql = `select * from public.tbl_os_feedback  where id = $1`;
    var values = [id];
    const pg = new postgres({ dbName: "tabular" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },
};
