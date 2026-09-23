// const nodemailer = require("nodemailer");
// const { generateActionToken } = require("./orderActionToken");

// const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "[EMAIL_ADDRESS]";

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

// // Fail loudly and specifically at startup instead of every order silently
// // failing to notify. Common causes if this logs an error:
// //  - EMAIL_USER / EMAIL_PASS missing or unset in the deployed environment
// //  - Using a normal Gmail password instead of a 16-char Gmail "App Password"
// //    (Gmail rejects plain-password SMTP logins — this is the #1 cause)
// //  - Outbound port 587 blocked by the hosting provider
// if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
//   transporter.verify((error) => {
//     if (error) {
//       console.error(
//         "[email] SMTP connection/auth check FAILED — order emails will not send. Reason:",
//         error.code || error.responseCode || "",
//         error.message
//       );
//     } else {
//       console.log("[email] SMTP connection verified — ready to send order emails.");
//     }
//   });
// } else {
//   console.error(
//     "[email] EMAIL_USER and/or EMAIL_PASS are not set in the environment — order emails will not send."
//   );
// }

// function buildActionButton(order, status, label, color) {
//   const base = (process.env.BASE_URL || process.env.TRACK_BASE_URL || "").replace(/\/$/, "");
//   const token = generateActionToken(order._id, status);
//   const url = `${base}/api/order/email-action/${order._id}/${encodeURIComponent(status)}?token=${token}`;
//   return `<a href="${url}" target="_blank" style="display:inline-block;margin:4px 6px 0 0;padding:10px 16px;background:${color};color:#ffffff;text-decoration:none;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">${label}</a>`;
// }

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

//     const base = (process.env.BASE_URL || process.env.TRACK_BASE_URL || "").replace(/\/$/, "");
//     let actionButtons = "";
//     if (base) {
//       actionButtons = `
//         <div style="margin-top:18px;">
//           ${buildActionButton(order, "Pending", "Pending", "#6B7280")}
//           ${buildActionButton(order, "Processing", "Processing", "#2563EB")}
//           ${buildActionButton(order, "Delivered", "Delivered", "#16A34A")}
//           ${buildActionButton(order, "Cancelled", "Cancel Order", "#DC2626")}
//         </div>
//         <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888;margin-top:8px;">
//           Clicking a button opens a confirmation page — the order status only changes once you confirm there.
//         </p>`;
//     } else {
//       console.warn("[email] BASE_URL / TRACK_BASE_URL not set — order status action buttons were skipped in this email.");
//     }

//     const mailOptions = {
//       from: `"Giftcart Orders" <${process.env.EMAIL_USER}>`,
//       to: ADMIN_NOTIFY_EMAIL,
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
//         ${actionButtons}
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`[email] Order notification sent for order ${order._id}`);
//   } catch (error) {
//     console.error(
//       "[email] Error sending order notification email — order:",
//       order?._id,
//       "| code:",
//       error.code || error.responseCode,
//       "| message:",
//       error.message
//     );
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
const dns = require("dns");
const { promisify } = require("util");
const { generateActionToken } = require("./orderActionToken");

const resolve4 = promisify(dns.resolve4);
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "prajapatisonu7897@gmail.com";

// Some hosts (Render included) have no outbound IPv6 route, but smtp.gmail.com
// resolves to an IPv6 address by default -> "connect ENETUNREACH ...:587".
// nodemailer's SMTP transport does NOT support a `family` option to force
// IPv4 (it's silently ignored), so we resolve the hostname to an IPv4
// address ourselves and connect to that IP directly. `tls.servername` keeps
// the original hostname so Gmail's TLS certificate still validates correctly
// against the IP connection.
let transporterPromise = null;

async function buildTransporter() {
  const hostname = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  let connectHost = hostname;
  try {
    const addresses = await resolve4(hostname);
    if (addresses && addresses[0]) {
      connectHost = addresses[0];
    }
  } catch (err) {
    console.warn(
      `[email] Could not resolve ${hostname} to an IPv4 address (${err.message}) — connecting via hostname, which may hit an IPv6-only route.`
    );
  }

  const transporter = nodemailer.createTransport({
    host: connectHost,
    port,
    secure,
    requireTLS: !secure,
    tls: { servername: hostname },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // Fail loudly and specifically instead of every order silently failing to
  // notify. Common causes if this logs an error:
  //  - EMAIL_USER / EMAIL_PASS missing or unset in the deployed environment
  //  - Using a normal Gmail password instead of a 16-char Gmail "App Password"
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
        console.log(`[email] SMTP connection verified (via ${connectHost}) — ready to send order emails.`);
      }
    });
  } else {
    console.error(
      "[email] EMAIL_USER and/or EMAIL_PASS are not set in the environment — order emails will not send."
    );
  }

  return transporter;
}

// Cache the built transporter (and its DNS resolution) for the life of the
// process — rebuilt fresh on every deploy/restart, which is exactly when a
// changed IP would matter.
function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = buildTransporter();
  }
  return transporterPromise;
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

    await (await getTransporter()).sendMail(mailOptions);
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
    // Re-throw so the caller (orderController.sendOrderEmail / orderService's
    // online-payment path) actually knows the send failed, instead of the
    // API responding "success" while no email went out.
    throw error;
  }
};

exports.sendPasswordResetOtp = async ({ email, name, otp }) => {
  try {
    await (await getTransporter()).sendMail({
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