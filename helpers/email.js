var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const config = require('../config-secure.json')

var transporter = nodemailer.createTransport(smtpTransport({
  host: config.emailSMTPServer,
  port: 25,
  // auth: {
  //     user: 'username@mysmtpserver.com',
  //     pass: 'mypasswd'
  // },            
  // authMethod:'NTLM',
  secure:false,
  ignoreTLS:true,
  debug:true
}));

module.exports = {
  sendMail(subject, body, isHtml = true){

    console.log("email")
    var mailOptions = {
      from: config.fromEmail,
      to: config.toEmail,
      subject: subject,
      text: isHtml ? "" :body,
      html: isHtml ? body : ""
    };
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
  
}
