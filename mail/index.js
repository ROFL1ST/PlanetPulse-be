const nodemailer = require("nodemailer");
require("dotenv").config();
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
async function sendEmail(email, subject, template, context) {
  try {
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./mail/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./mail/"),
    };
    const transport = nodemailer.createTransport({
      service: process.env.MAIL_HOST,
      logger: true,
      debug: true,
      auth: {
        user: process.env.EMAIL_MAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    transport.use("compile", hbs(handlebarOptions));
    transport.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("ready");
      }
    });

    await transport.sendMail({
      from: "chat@chat.example",
      to: email,
      subject: subject,
      template: template,
      context: context,
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
}

module.exports = { sendEmail };
