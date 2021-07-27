var nodemailer = require("nodemailer");
const config = require("../config.json");

var transporter = nodemailer.createTransport({
  host: config.emailSMTPServer,
  port: 25,
  secure: false,
  ignoreTLS: true,
  debug: true,
});

module.exports = {
  sendMail(subject, body, isHtml = true, cc = undefined) {
    const validateEmail = (email) => {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };
    var mailOptions = {
      from: config.fromEmail,
      to: config.toEmail,
      subject: subject,
      text: isHtml ? "" : body,
      html: isHtml ? body : "",
    };
    if (cc !== undefined && validateEmail(cc)) mailOptions["cc"] = cc;
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
};
