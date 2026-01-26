const nodemailer = require("nodemailer");

async function sendOtpMail(email, otp) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "PADAM Traders - Email Verification OTP",
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
  });
}

module.exports = sendOtpMail;
