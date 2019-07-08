var email = require("./email");
var postgres = require("./postgres");

const mapUrl = 'https://opengis.simcoe.ca/?';
const feedbackUrl = 'https://opengis.simcoe.ca/feedback?';

module.exports = {
  insertFeedback: function(feedback){

    // FORMAT THE DATE
    var dt = new Date();
    var dtstring = dt.getFullYear()
        + '-' + this.pad2(dt.getMonth()+1)
        + '-' + this.pad2(dt.getDate())
        + ' ' + this.pad2(dt.getHours())
        + ':' + this.pad2(dt.getMinutes())
        + ':' + this.pad2(dt.getSeconds());

    // BUILD SQL
    var insertSql = `INSERT INTO public.tbl_os_feedback (rating,for_business_use,email,comments,xminimum,yminimum,xmaximum,ymaximum,centerx,centery,scale,date_created,other_uses,education,recreation,real_estate,business,delivery,economic_development) 
    values (${feedback.rating},${feedback.forBusinessUse ? 1 : 0},'${feedback.email}','${feedback.comments}',${feedback.xmin},${feedback.ymin},${feedback.xmax},${feedback.ymax},${feedback.centerX},${feedback.centerY},${feedback.scale},'${dtstring}','${feedback.otherUses}',${feedback.education},${feedback.recreation},${feedback.realEstate},${feedback.business},${feedback.delivery},${feedback.economicDevelopment}) RETURNING id;`;

    // INSERT RECORD
    postgres.insertWithReturnId(insertSql, (id) => {
      var html = feedback.email === '' ? '': '<div>email: ' + feedback.email + '</div>';
      if (feedback.centerX !== null  && feedback.centerY !== null && feedback.centerX !== 0  && feedback.centerY !== 0)
         html += '<div>' + mapUrl + 'X=' + feedback.centerX + '&Y=' + feedback.centerY + '</div>';

      html += '<div>' + feedbackUrl + 'ID=' + id  + '</div>';
      
      email.sendMail("Feedback - opengis.simcoe.ca", html);
    });

  },

  getFeedback: function(id, callback){
    var sql = `select * from public.tbl_os_feedback  where id = '${id}'`;

    postgres.selectFirst(sql, (result) => {
      callback(result);
    });

  },

  pad2(number) {
   
    var str = '' + number;
    while (str.length < 2) {
        str = '0' + str;
    }
   
    return str;
  }

}


