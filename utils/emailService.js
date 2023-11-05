const nodemailer = require("nodemailer");
const sendMailHtml = require("./sendMailHtml");
const dotenv = require("dotenv");
dotenv.config()

const EMAIL_USER = process.env.SEND_EMAIL
const EMAIL_PASSWORD = process.env.SEND_EMAIL_PASSWORD

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});
const sendEmailService = async (order) => {
  const info = await transporter.sendMail({
    from: `"Apple Shop" <${EMAIL_USER}>`, // sender address
    to: order.user.email, // list of receivers
    subject: "Confirmed successfully ✔", // Subject line
    text: "Your orders", // plain text body
    html: sendMailHtml(order), // html body
  });
  return info;
};

module.exports = sendEmailService;
