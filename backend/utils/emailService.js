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
const axios = require("axios");
const dns = require("dns");
const { promisify } = require("util");
const { generateActionToken } = require("./orderActionToken");

const resolve4 = promisify(dns.resolve4);
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "prajapatisonu7897@gmail.com";

// --- Primary send path: Brevo's HTTPS email API -----------------------
// Render's free tier (and several other hosts' free/hobby tiers) blocks ALL
// outbound SMTP ports (25, 465, 587) at the network level as of Sept 2025 —
// no SMTP config fix can work around that, since it's a platform firewall,
// not a DNS/reachability issue. Sending over HTTPS (port 443) via Brevo's
// API sidesteps the block entirely. This path is used whenever
// BREVO_API_KEY is set; otherwise we fall back to plain SMTP (works fine
// locally, or on a paid Render plan / any host that allows SMTP egress).
async function sendViaBrevoApi({ to, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
  const senderName = process.env.BREVO_SENDER_NAME || "Giftcart Orders";

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL (or EMAIL_USER) must be set to send via the Brevo API.");
  }

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );
  } catch (err) {
    // Surface Brevo's actual rejection reason (e.g. unverified sender) instead
    // of a generic axios error.
    const apiMessage = err.response?.data?.message || err.response?.data?.code;
    const wrapped = new Error(apiMessage ? `Brevo API error: ${apiMessage}` : err.message);
    wrapped.code = err.response?.status || err.code;
    throw wrapped;
  }
}

function usingBrevoApi() {
  return Boolean(process.env.BREVO_API_KEY);
}

// --- Fallback send path: plain SMTP (nodemailer) -----------------------
// Some hosts have no outbound IPv6 route, but smtp.gmail.com resolves to an
// IPv6 address by default -> "connect ENETUNREACH ...:587". nodemailer's
// SMTP transport does NOT support a `family` option to force IPv4 (it's
// silently ignored), so we resolve the hostname to an IPv4 address ourselves
// and connect to that IP directly. `tls.servername` keeps the original
// hostname so the TLS certificate still validates correctly against the IP
// connection. This path is only reached when BREVO_API_KEY is not set.
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
    const itemsSubtotal = (order.items || []).reduce(
      (sum, item) => sum + (Number(item.itemTotal) || (Number(item.price || 0) * Number(item.quantity || 1))),
      0
    );
    const slotCharge = Number(order.deliverySlot?.extraCharge || 0);
    const addonsTotal = (order.addons || []).reduce(
      (sum, a) => sum + (Number(a.price || 0) * (Number(a.quantity) || 1)),
      0
    );
    const couponDiscount = Number(order.discountAmount || 0);
    const grandTotal = Number(order.totalAmount != null ? order.totalAmount : (itemsSubtotal + slotCharge + addonsTotal - couponDiscount));

    const itemsRows = (order.items || [])
      .map((item) => {
        let variantStr = item.selectedVariant ? ` [${item.selectedVariant}]` : '';
        let egglessStr = item.isEggless ? ' (Eggless)' : '';
        let cakeMsgStr = item.messageOnCake ? `<br/><span style="color:#db2777;font-size:12px;">🎂 Cake text: "${item.messageOnCake}"</span>` : '';
        return `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 12px;color:#1e293b;font-weight:500;">
              ${item.name}${variantStr}${egglessStr}${cakeMsgStr}
            </td>
            <td style="padding:10px 12px;color:#475569;text-align:center;">${item.quantity}</td>
            <td style="padding:10px 12px;color:#1e293b;text-align:right;font-weight:600;">₹${Number(item.itemTotal || (item.price * item.quantity)).toFixed(2)}</td>
          </tr>
        `;
      })
      .join("");

    const addonsSection = (order.addons || []).length > 0
      ? `
        <div style="margin-top:16px;">
          <h4 style="margin:0 0 8px;color:#334155;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Celebration Add-ons</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            ${order.addons
              .map(
                (a) => `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:6px 12px;color:#475569;">${a.name} (x${a.quantity || 1})</td>
                  <td style="padding:6px 12px;color:#db2777;text-align:right;font-weight:600;">+₹${(Number(a.price || 0) * (Number(a.quantity) || 1)).toFixed(2)}</td>
                </tr>`
              )
              .join("")}
          </table>
        </div>`
      : "";

    const slotSection = order.deliverySlot?.slotName
      ? `
        <div style="margin-top:14px;background:#f8fafc;padding:12px 14px;border-radius:8px;font-size:13px;color:#334155;">
          <strong>🗓️ Delivery Window:</strong> ${order.deliverySlot.slotName} (${order.deliverySlot.timeRange || ""})
          ${order.deliverySlot.deliveryDate ? ` • <strong>Date:</strong> ${order.deliverySlot.deliveryDate}` : ""}
          ${slotCharge > 0 ? ` • <span style="color:#db2777;font-weight:600;">+₹${slotCharge.toFixed(2)}</span>` : ""}
        </div>`
      : "";

    const cakeAndCardMsg = [
      order.messageOnCake ? `<p style="margin:4px 0;"><strong>🎂 Message on Cake:</strong> "${order.messageOnCake}"</p>` : "",
      order.cardMessage ? `<p style="margin:4px 0;"><strong>💌 Card Message:</strong> "${order.cardMessage}"</p>` : "",
      order.recipientName ? `<p style="margin:4px 0;"><strong>Recipient:</strong> ${order.recipientName}${order.senderName ? ` (From: ${order.senderName})` : ""}</p>` : "",
    ].filter(Boolean).join("");

    const base = (process.env.BASE_URL || process.env.TRACK_BASE_URL || "").replace(/\/$/, "");
    let actionButtons = "";
    if (base) {
      actionButtons = `
        <div style="margin-top:20px;padding-top:16px;border-top:1px dashed #cbd5e1;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#475569;">Admin Quick Actions:</p>
          <div>
            ${buildActionButton(order, "Received", "Received", "#64748B")}
            ${buildActionButton(order, "Pending", "Pending", "#6B7280")}
            ${buildActionButton(order, "In Kitchen", "In Kitchen", "#0F766E")}
            ${buildActionButton(order, "Processing", "Processing", "#2563EB")}
            ${buildActionButton(order, "Packed", "Packed", "#7C3AED")}
            ${buildActionButton(order, "Out for Delivery", "Out for Delivery", "#D97706")}
            ${buildActionButton(order, "Shipping", "Shipping", "#0284C7")}
            ${buildActionButton(order, "Delivered", "Delivered", "#16A34A")}
            ${buildActionButton(order, "Cancelled", "Cancel Order", "#DC2626")}
          </div>
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#94a3b8;margin-top:8px;">
            Clicking an action button opens a confirmation page before updating the status.
          </p>
        </div>`;
    }

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
          .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #db2777 0%, #be185d 100%); color: #ffffff; padding: 24px 28px; }
          .content { padding: 24px 28px; }
          .price-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .price-row td { padding: 6px 0; font-size: 13px; color: #475569; }
          .total-row td { padding: 12px 0 4px; font-size: 16px; font-weight: bold; color: #0f172a; border-top: 2px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">GiftFestive Orders</h1>
            <p style="margin:6px 0 0;font-size:14px;opacity:0.95;">Order Confirmation #${String(order._id).slice(-8).toUpperCase()}</p>
          </div>

          <div class="content">
            <div style="background:#f1f5f9;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:13px;line-height:1.6;">
              <p style="margin:0;"><strong>Customer:</strong> ${user?.name || order.shippingAddress?.fullName || "Valued Customer"} (${user?.email || "N/A"})</p>
              <p style="margin:4px 0 0;"><strong>Phone:</strong> ${order.shippingAddress?.phone || user?.mobileNumber || "N/A"}</p>
              <p style="margin:4px 0 0;"><strong>Payment:</strong> <span style="display:inline-block;padding:2px 8px;border-radius:6px;background:#e0f2fe;color:#0369a1;font-weight:bold;font-size:12px;">${order.paymentMethod || "Online"}</span> • Status: <strong>${order.paymentStatus || "Pending"}</strong></p>
              <p style="margin:4px 0 0;"><strong>Shipping To:</strong> ${order.shippingAddress?.address || [order.shippingAddress?.houseNo, order.shippingAddress?.street, order.shippingAddress?.landmark].filter(Boolean).join(", ")} - ${order.shippingAddress?.pinCode || ""}</p>
            </div>

            ${cakeAndCardMsg ? `<div style="background:#fdf2f8;border-left:4px solid #db2777;padding:12px 16px;border-radius:6px;margin-bottom:20px;font-size:13px;color:#831843;">${cakeAndCardMsg}</div>` : ""}

            <h3 style="margin:0 0 10px;font-size:15px;color:#0f172a;">Ordered Items</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:left;">
                  <th style="padding:8px 12px;color:#475569;">Item</th>
                  <th style="padding:8px 12px;color:#475569;text-align:center;">Qty</th>
                  <th style="padding:8px 12px;color:#475569;text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            ${addonsSection}
            ${slotSection}

            <!-- Price Breakdown -->
            <div style="margin-top:22px;border-top:1px solid #e2e8f0;padding-top:14px;">
              <table class="price-table">
                <tr class="price-row">
                  <td>Items Subtotal:</td>
                  <td style="text-align:right;font-weight:600;">₹${itemsSubtotal.toFixed(2)}</td>
                </tr>
                ${slotCharge > 0 ? `
                <tr class="price-row">
                  <td>Delivery Window Surcharge:</td>
                  <td style="text-align:right;font-weight:600;color:#db2777;">+₹${slotCharge.toFixed(2)}</td>
                </tr>` : ""}
                ${addonsTotal > 0 ? `
                <tr class="price-row">
                  <td>Celebration Add-ons:</td>
                  <td style="text-align:right;font-weight:600;color:#db2777;">+₹${addonsTotal.toFixed(2)}</td>
                </tr>` : ""}
                ${couponDiscount > 0 ? `
                <tr class="price-row" style="background:#ecfdf5;">
                  <td style="color:#059669;font-weight:bold;padding:6px 8px;border-radius:4px;">
                    🎉 Coupon Discount (${order.couponCode || "APPLIED"}):
                  </td>
                  <td style="text-align:right;font-weight:bold;color:#059669;padding:6px 8px;">
                    -₹${couponDiscount.toFixed(2)}
                  </td>
                </tr>` : ""}
                <tr class="total-row">
                  <td>Grand Total:</td>
                  <td style="text-align:right;color:#db2777;font-size:18px;">₹${grandTotal.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            ${actionButtons}
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `Order #${String(order._id).slice(-8).toUpperCase()} - ₹${grandTotal.toFixed(2)} - ${order.paymentMethod} (${user?.name || "Customer"})`;

    const recipientEmails = [ADMIN_NOTIFY_EMAIL];
    if (user?.email && user.email !== ADMIN_NOTIFY_EMAIL && !recipientEmails.includes(user.email)) {
      recipientEmails.push(user.email);
    }

    for (const toEmail of recipientEmails) {
      const mailOptions = {
        from: `"GiftFestive Orders" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        html,
      };

      try {
        await (usingBrevoApi()
          ? sendViaBrevoApi({ to: toEmail, subject: mailOptions.subject, html: mailOptions.html })
          : (await getTransporter()).sendMail(mailOptions));
        console.log(`[email] Order notification sent to ${toEmail} for order ${order._id}`);
      } catch (sendErr) {
        console.error(`[email] Failed sending to ${toEmail}:`, sendErr.message);
      }
    }
  } catch (error) {
    console.error(
      "[email] Error sending order notification email — order:",
      order?._id,
      "| code:",
      error.code || error.responseCode,
      "| message:",
      error.message
    );
    throw error;
  }
};

exports.sendPasswordResetOtp = async ({ email, name, otp }) => {
  const subject = "Giftcart password reset OTP";
  const text = `Hi ${name || "there"}, your Giftcart password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`;
  const html = `<p>Hi ${name || "there"},</p><p>Your Giftcart password reset OTP is:</p><h2>${otp}</h2><p>This OTP expires in 10 minutes. If you did not request this, you can ignore this email.</p>`;

  try {
    if (usingBrevoApi()) {
      await sendViaBrevoApi({ to: email, subject, html, text });
    } else {
      await (await getTransporter()).sendMail({ from: process.env.EMAIL_USER, to: email, subject, text, html });
    }
  } catch (error) {
    console.error("[email] Error sending OTP email:", error.code, error.message);
    throw new Error("Unable to send OTP email. Please verify the email service configuration and try again.");
  }
};