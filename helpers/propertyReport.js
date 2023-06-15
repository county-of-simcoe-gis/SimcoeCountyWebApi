const sqlServer = require("./sqlServer");
const ss = new sqlServer({ dbName: "tabular" });
const { createCanvas } = require("canvas");
const postgres = require("./postgres");

module.exports = {
  async getPropertyReportInfo(arn, callback) {
    if (arn) {
      let values = [{ name: "arn", type: "NVarChar", typeOpts: { length: 250 }, value: arn }];
      const sql = `SELECT * FROM  TABULAR.dbo.view_PropertyReportInfo_New WHERE UniqueMaps = 1 AND ARN = @arn`;
      let broadbandSpeed = "";
      const broadbandSql = `select potential_coverage,
                                    case potential_coverage 
                                      when 'Up to or exceeds 50 Mbps Down/10 Mbps Up' then 1
                                      when 'Up to 25 Mbps Down/5 Mbps Up' then 2 
                                      when 'Up to 10 Mbps Down/2 Mbps Up' then 3
                                      when 'Up to 5 Mbps Down/1 Mbps Up' then 4 
                                      when 'Less than 5 Mbps Down/1 Mbps Up' then 5 
                                      else 6 
	                                  end order_field 
                            from public.ssmatview_can_isp_combined_parcels where arn = $1 order by order_field limit 1`;
      var broadbandValues = [arn];
      const pg = new postgres({ dbName: "weblive" });
      try {
        const broadbandResult = await pg.selectAllWithValuesWait(broadbandSql, broadbandValues);
        if (broadbandResult[0]) broadbandSpeed = broadbandResult[0].potential_coverage;
        else broadbandSpeed = "No information available";
      } catch (e) {
        console.dir(e);
      }

      const barrieMsg = "Please contact City of Barrie.";
      const orilliaMsg = "Please contact City of Orillia.";
      const getAssessedValueImage = (value) => {
        const assessedValueFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
        const assessedValueCanvas = createCanvas(300, 15);
        const assessedValueTextContext = assessedValueCanvas.getContext("2d");
        assessedValueTextContext.textAlign = "left";
        assessedValueTextContext.fillStyle = "#fff";
        assessedValueTextContext.fillRect(0, 0, assessedValueCanvas.width, assessedValueCanvas.height);
        assessedValueTextContext.fillStyle = "#000";
        assessedValueTextContext.font = `normal 10px Arial`;
        assessedValueTextContext.textBaseline = "top";
        if (isNaN(value)) assessedValueTextContext.fillText(value, 0, 0);
        else assessedValueTextContext.fillText(value > 0 ? assessedValueFormatter.format(value) : "unknown", 0, 0);
        return assessedValueCanvas.toDataURL();
      };
      ss.selectFirstWithValues(sql, values, (result) => {
        if (!result) {
          console.log("Property not found");
          callback({});
        } else {
          try {
            resultFormatted = {
              ARN: result.ARN,
              PropertyType: result.ARN.substring(0, 4) === "4342" ? "N/A" : result.PropertyDescripter,
              Address: result.StNum || result.FullName || result.Muni ? `${result.StNum}  ${result.FullName}, ${result.Muni}` : `(Not Available)`,
              AssessedValue: getAssessedValueImage(result.ARN.substring(0, 4) === "4342" ? "N/A" : result.AssessedValue),
              ReportURL: result.REPORT_PUBLIC,
              HasZoning: result.HasZoning,
              EmergencyService: {
                PoliceStation: result.POLICE_NAME,
                PoliceStationArn: result.POLICE_ARN,
                FireStation: `${result.FIREHALL_STATION_NAME} (${result.FIREHALL_KM} KM)`,
                FireStationArn: result.FIREHALL_ARN,
              },
              WasteCollection:
                result.ARN.substring(0, 4) == "4342"
                  ? {
                      GarbageDay: barrieMsg,
                      LandfillLocation_General: barrieMsg,
                      LandfillLocation_GeneralPin: barrieMsg,
                      LandfillLocation_Hazardous: barrieMsg,
                      LandfillLocation_HazardousPin: barrieMsg,
                      BagTagleLocation1: barrieMsg,
                      BagTagleLocation2: barrieMsg,
                      BagTagleLocation3: barrieMsg,
                      WasteURL: barrieMsg,
                    }
                  : result.ARN.substring(0, 4) == "4352"
                  ? {
                      GarbageDay: orilliaMsg,
                      LandfillLocation_General: orilliaMsg,
                      LandfillLocation_GeneralPin: orilliaMsg,
                      LandfillLocation_Hazardous: orilliaMsg,
                      LandfillLocation_HazardousPin: orilliaMsg,
                      BagTagleLocation1: orilliaMsg,
                      BagTagleLocation2: orilliaMsg,
                      BagTagleLocation3: orilliaMsg,
                      WasteURL: orilliaMsg,
                    }
                  : {
                      GarbageDay: result.REGULAR_COLLECTION_DAY,
                      LandfillLocation_General: `${result.LANDFILL_CLOSEST_NAME} (${result.LANDFILL_CLOSEST_KM}) KM)`,
                      LandfillLocation_GeneralPin: result.LANDFILL_CLOSEST_PIN,
                      LandfillLocation_Hazardous: `${result.LANDFILL_HAZARD_NAME} (${result.LANDFILL_HAZARD_KM} KM)`,
                      LandfillLocation_HazardousPin: result.LANDFILL_HAZARD_PIN,
                      BagTagleLocation1: `${result.BAG_TAG1_NAME} (${result.BAG_TAG1_KM} KM)`,
                      BagTagleLocation2: `${result.BAG_TAG2_NAME} (${result.BAG_TAG2_KM} KM)`,
                      BagTagleLocation3: `${result.BAG_TAG3_NAME} (${result.BAG_TAG3_KM} KM)`,
                      WasteURL: "http://www.simcoe.ca/SolidWasteManagement/Pages/schedules.aspx",
                    },
              Schools: {
                CatholicElementry: result.SCHOOL_CATHOLIC_ELEMENTARY,
                CatholicSecondary: result.SCHOOL_CATHOLIC_SECONDARY,
                CatholicBoardWebsiteURL: "http://smcdsb.on.ca",
                PublicElementry: result.SCHOOL_PUBLIC_ELEMENTARY,
                PublicSecondary: result.SCHOOL_PUBLIC_SECONDARY,
                PublicBoardWebsiteURL: "http://scdsb.on.ca",
              },
              Other: {
                Library: `${result.LIBRARY_NAME} (${result.LIBRARY_KM} KM)`,
                LibraryUrl: result.LIBRARY_URL,
                LibraryArn: result.LIBRARY_ARN,
                ClosestFireHydrant:
                  result.ARN.substring(0, 4) == "4342" ? barrieMsg : result.ARN.substring(0, 4) == "4352" ? orilliaMsg : result.FIRE_HYDRANT_KM ? `(${result.FIRE_HYDRANT_KM} KM)` : "Greater than 2",
                MunicipalAdminCentre: `${result.ADMIN_NAME} (${result.ADMIN_KM} KM)`,
                MunicipalAdminCentreUrl: result.ADMIN_URL,
                MunicipalAdminCentreArn: result.ADMIN_ARN,
                ClosestHospital: result.HOSPITAL_NAME,
                ClosestHospitalAddress: result.HOSPITAL_URL,
                ClosestHospitalUrl: result.HOSPITAL_URL,
                BroadbandSpeed: broadbandSpeed,
              },
            };
            //console.log(resultFormatted);
            callback(resultFormatted);
          } catch (e) {
            console.dir(e);
            callback({});
          }
        }
      });
    } else {
      callback({});
    }
  },
};
