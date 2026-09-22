// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
//   requireTLS: true,
//   family: 4,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
//   socketTimeout: 15000,
// });

// exports.sendOrderNotification = async (order, user) => {
//   try {
//     const itemsList = order.items
//       .map(
//         (item) => {
//           let variantStr = item.selectedVariant ? ` [${item.selectedVariant}]` : '';
//           let egglessStr = item.isEggless ? ' (Eggless)' : '';
//           return `<li>${item.name}${variantStr}${egglessStr} - Quantity: ${item.quantity} - Total: ₹${item.itemTotal}</li>`;
//         }
//       )
//       .join("");

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: "prajapatisonu7897@gmail.com",
//       subject: `New Order Received - Order ID: ${order._id}`,
//       html: `
//         <h2>New Order Details</h2>
//         <p><strong>User:</strong> ${user.name} (${user.email})</p>
//         <p><strong>Order ID:</strong> ${order._id}</p>
//         <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
//         <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
//         <p><strong>Shipping Address:</strong> 
//           ${order.shippingAddress.address} - ${order.shippingAddress.pinCode}
//           <br/><strong>Phone:</strong> ${order.shippingAddress.phone}
//         </p>
//         <h3>Ordered Items:</h3>
//         <ul>${itemsList}</ul>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Order notification email sent successfully");
//   } catch (error) {
//     console.error("Error sending order notification email:", error);
//   }
// };

// exports.sendPasswordResetOtp = async ({ email, name, otp }) => {
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Giftcart password reset OTP",
//       text: `Hi ${name || "there"}, your Giftcart password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
//       html: `<p>Hi ${name || "there"},</p><p>Your Giftcart password reset OTP is:</p><h2>${otp}</h2><p>This OTP expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
//     });
//   } catch (error) {
//     throw new Error("Unable to send OTP email. Please verify the email service configuration and try again.");
//   }
// };


const nodemailer = require("nodemailer");
const { generateActionToken } = require("./orderActionToken");

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "prajapatisonu7897@gmail.com";

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

// Fail loudly and specifically at startup instead of every order silently
// failing to notify. Common causes if this logs an error:
//  - EMAIL_USER / EMAIL_PASS missing or unset in the deployed environment
//  - Using a normal Gmail password instead of a 16-char Gmail "App Password"
//    (Gmail rejects plain-password SMTP logins — this is the #1 cause)
//  - Outbound port 587 blocked by the hosting provider
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error(
        "[email] SMTP connection/auth check FAILED — order emails will not send. Reason:",
        error.code || error.responseCode || "",
        error.message
      );
    } else {
      console.log("[email] SMTP connection verified — ready to send order emails.");
    }
  });
} else {
  console.error(
    "[email] EMAIL_USER and/or EMAIL_PASS are not set in the environment — order emails will not send."
  );
}

function buildActionButton(order, status, label, color) {
  const base = (process.env.BASE_URL || process.env.TRACK_BASE_URL || "").replace(/\/$/, "");
  const token = generateActionToken(order._id, status);
  const url = `${base}/api/order/email-action/${order._id}/${encodeURIComponent(status)}?token=${token}`;
  return `<a href="${url}" target="_blank" style="display:inline-block;margin:4px 6px 0 0;padding:10px 16px;background:${color};color:#ffffff;text-decoration:none;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">${label}</a>`;
}

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

    const base = (process.env.BASE_URL || process.env.TRACK_BASE_URL || "").replace(/\/$/, "");
    let actionButtons = "";
    if (base) {
      actionButtons = `
        <div style="margin-top:18px;">
          ${buildActionButton(order, "Pending", "Pending", "#6B7280")}
          ${buildActionButton(order, "Processing", "Processing", "#2563EB")}
          ${buildActionButton(order, "Delivered", "Delivered", "#16A34A")}
          ${buildActionButton(order, "Cancelled", "Cancel Order", "#DC2626")}
        </div>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888;margin-top:8px;">
          Clicking a button opens a confirmation page — the order status only changes once you confirm there.
        </p>`;
    } else {
      console.warn("[email] BASE_URL / TRACK_BASE_URL not set — order status action buttons were skipped in this email.");
    }

    const mailOptions = {
      from: `"Giftcart Orders" <${process.env.EMAIL_USER}>`,
      to: ADMIN_NOTIFY_EMAIL,
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
        ${actionButtons}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[email] Order notification sent for order ${order._id}`);
  } catch (error) {
    console.error(
      "[email] Error sending order notification email — order:",
      order?._id,
      "| code:",
      error.code || error.responseCode,
      "| message:",
      error.message
    );
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