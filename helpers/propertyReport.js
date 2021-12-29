const ssrs = require("./ssrs");
const sqlServer = require("./sqlServer");
const ss = new sqlServer({ dbName: "tabular" });

// const reports = new ssrs();
module.exports = {
  getPropertyReportInfo(arn, callback) {
    let values = [{ name: "arn", type: "NVarChar", typeOpts: { length: 250 }, value: arn }];
    const sql = `SELECT * FROM  TABULAR.dbo.view_PropertyReportInfo_New WHERE UniqueMaps = 1 AND ARN = @arn`;
    ss.selectFirstWithValues(sql, values, (result) => {
      console.log(result);

      resultFormatted = {
        ARN: result.ARN,
        PropertyType: result.PropertyDescripter,
        Address: "77 King Road, Tay",
        AssessedValue:
          "iVBORw0KGgoAAAANSUhEUgAAADgAAAAPCAYAAACx+QwLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGUSURBVEhL7dRhUQQxDIbhE4ABDGAAAyhAAQ5wgAUsoAETuMDM0Yfhm8l1sx1+wP2Ae2cyu9s06Ze028N/43bY47CHYdcGJq6G8c+YmzhzgndjfF2+yl4ORNf959cpK98Jd8OOw16HvXy9z6Kehxmv3Ax7H/Y0TNzbMBBpXAyfOGI6zOU3t+aAGD45jHuGlW+DwhSpGwJ1hHh4SsDmAgmq3cvuszpOPOsQU4vSGFogf4TLaf3s8Mq3weQcp7nThFowHaskqdjueIVVgVUoNJsOyJ9i4Tv6Vr4NOWo5Vt3EvQLFEJRdruisfOZ476gFYS6waqnfK98u6bTJtTvYKzDz8i/VRTQuxe/t4FkKlJBAT5M8HZ2KcUkq312kiw3W+fUCddhOpED/xNxx47NIcblMsoN2jdVLRu45NpzlkokA3RMYoZWuwMRZiEjxyIKapGmZE4zln0xjrMtqsVkz+WuOla9FQQQS1V0IxupRCvnP6o6B8L2b2Tp1jeTubmKxXX6sfC0CuuJ+muz0n2U+/hcubDgcPgA7iY5QSvd2CwAAAABJRU5ErkJggg==",
        ReportURL: "http://maps.simcoe.ca/PropertyReports/Report.ashx?Key=sm/BrY8cgzL+jI9BkmKYWP9+/v/wrDQT",
        HasZoning: false,
        EmergencyService: {
          PoliceStation: "Ontario Provincial Police - Southern Georgian Bay Detachment",
          PoliceStationArn: "",
          FireStation: "Tay Fire Station 1 (Waubaushene) (1.51 KM)",
          FireStationArn: "435304000602101",
        },
        WasteCollection: {
          GarbageDay: "Tuesday",
          LandfillLocation_General: "Site 8 Matchedash Transfer Station (20.61 KM)",
          LandfillLocation_GeneralPin: "586000349",
          LandfillLocation_Hazardous: "Site 24 North Simcoe Transfer Station (24.4 KM)",
          LandfillLocation_HazardousPin: "584050160",
          BagTagleLocation1: " (9.17 KM)",
          BagTagleLocation2: "Sunny Convenience (8.96 KM)",
          BagTagleLocation3: "Coldwater Home Hardware (9.17 KM)",
          BagTagleLocation4: null,
          WasteURL: "http://www.simcoe.ca/SolidWasteManagement/Pages/schedules.aspx",
        },
        Schools: {
          CatholicElementry: "St Antoine Daniel Elementary Catholic School",
          CatholicSecondary: "St. Theresa's Catholic High School",
          CatholicBoardWebsiteURL: "http://smcdsb.on.ca",
          PublicElementry: "Tay Shores Ps",
          PublicSecondary: "Georgian Bay Dhs",
          PublicBoardWebsiteURL: "http://scdsb.on.ca",
        },
        Other: {
          Library: "Tay Township Public Library - Waubaushene Branch  (0.96 KM)",
          LibraryUrl: "http://www.tay.library.on.ca/Waubaushene/ ",
          LibraryArn: "435304000649700",
          ClosestFireHydrant: "(0.02 KM)",
          MunicipalAdminCentre: "Township Of Tay (7.53 KM)",
          MunicipalAdminCentreUrl: "http://www.tay.ca/",
          MunicipalAdminCentreArn: "435304000580000",
          ClosestHospital: "Georgian Bay General Hospital",
          ClosestHospitalAddress: null,
          ClosestHospitalUrl: "http://www.gbgh.on.ca/",
        },
      };

      callback(result);
    });
  },

  // async getReport(arn, callback) {
  //   try {
  //     const obj = JSON.parse(body);
  //     const geoJSON = obj.geoJson;
  //     const reportType = obj.reportType;
  //     const reportFormat = obj.reportFormat;

  //     const sql = "select string_agg(arn, '|') AS arns from weblive.sde.teranet_dapf where ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($1), 3857))";
  //     var values = [geoJSON];
  //     const pg = new postgres({ dbName: "weblive" });
  //     pg.selectFirstWithValues(sql, values, (result) => {
  //       if (result.arns === null) {
  //         callback("Zero Records");
  //       } else {
  //         var parameters = [
  //           { Name: "ARNS", Value: result.arns },
  //           { Name: "UsePartnerData", Value: false },
  //         ];

  //         reports.runReport(reportType, parameters, "Mailing_Labels", reportFormat, (fn) => {
  //           console.log("Saved report to: " + fn);
  //           callback(fn);
  //         });
  //       }
  //     });
  //   } catch (error) {
  //     callback(error);
  //   }
  // },
};
