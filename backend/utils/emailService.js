const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  requireTLS: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

exports.sendOrderNotification = async (order, user) => {
  try {
    const itemsList = order.items
      .map(
        (item) => {
          let variantStr = item.selectedVariant ? ` [${item.selectedVariant}]` : '';
          let egglessStr = item.isEggless ? ' (Eggless)' : '';
          return `<li>${item.name}${variantStr}${egglessStr} - Quantity: ${item.quantity} - Total: ₹${item.itemTotal}</li>`;
        }
      )
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "prajapatisonu7897@gmail.com",
      subject: `New Order Received - Order ID: ${order._id}`,
      html: `
        <h2>New Order Details</h2>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Shipping Address:</strong> 
          ${order.shippingAddress.address} - ${order.shippingAddress.pinCode}
          <br/><strong>Phone:</strong> ${order.shippingAddress.phone}
        </p>
        <h3>Ordered Items:</h3>
        <ul>${itemsList}</ul>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Order notification email sent successfully");
  } catch (error) {
    console.error("Error sending order notification email:", error);
  }
};

exports.sendPasswordResetOtp = async ({ email, name, otp }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Giftcart password reset OTP",
      text: `Hi ${name || "there"}, your Giftcart password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
      html: `<p>Hi ${name || "there"},</p><p>Your Giftcart password reset OTP is:</p><h2>${otp}</h2><p>This OTP expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    throw new Error("Unable to send OTP email. Please verify the email service configuration and try again.");
  }
};
