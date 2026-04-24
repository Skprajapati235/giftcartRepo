const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
