const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAILEMAIL,
    pass: process.env.GMAILPASS
  }
})

module.exports = transporter;