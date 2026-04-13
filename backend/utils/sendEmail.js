const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL, // Must be provided in .env
        pass: process.env.ADMIN_EMAIL_PASSWORD, // App password
      },
    });

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

module.exports = sendEmail;
