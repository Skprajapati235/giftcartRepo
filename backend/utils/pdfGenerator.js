const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateInvoicePDF = (order, stream) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      doc.pipe(stream);

      // --- Header ---
      doc
        .fillColor("#444444")
        .fontSize(20)
        .text("INVOICE", 50, 57)
        .fontSize(10)
        .text("Giftcart Ltd.", 200, 50, { align: "right" })
        .text("123 Gifting Lane", 200, 65, { align: "right" })
        .text("Gifting City, GC 12345", 200, 80, { align: "right" })
        .moveDown();

      // --- Line ---
      doc.moveTo(50, 110).lineTo(550, 110).strokeColor("#cccccc").stroke();

      // --- Order Info ---
      const customerInfoTop = 130;
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Order Number:", 50, customerInfoTop)
        .font("Helvetica")
        .text(order.orderId || order._id, 150, customerInfoTop)
        .font("Helvetica-Bold")
        .text("Order Date:", 50, customerInfoTop + 15)
        .font("Helvetica")
        .text(new Date(order.createdAt).toLocaleDateString(), 150, customerInfoTop + 15)
        .font("Helvetica-Bold")
        .text("Payment Status:", 50, customerInfoTop + 30)
        .font("Helvetica")
        .text(order.paymentStatus, 150, customerInfoTop + 30);

      // --- Customer Info ---
      doc
        .font("Helvetica-Bold")
        .text("Bill To:", 300, customerInfoTop)
        .font("Helvetica")
        .text(order.shippingAddress?.fullName || order.user?.name || "Customer", 300, customerInfoTop + 15)
        .text(order.shippingAddress?.address || "", 300, customerInfoTop + 30)
        .text(
          `${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.pincode || ""}`,
          300,
          customerInfoTop + 45
        )
        .text(order.shippingAddress?.phone || order.user?.mobileNumber || "", 300, customerInfoTop + 60)
        .moveDown();

      // --- Table Header ---
      const invoiceTableTop = 230;
      doc.font("Helvetica-Bold");
      doc.text("Item", 50, invoiceTableTop);
      doc.text("Price", 280, invoiceTableTop, { width: 90, align: "right" });
      doc.text("Quantity", 370, invoiceTableTop, { width: 90, align: "right" });
      doc.text("Line Total", 460, invoiceTableTop, { width: 90, align: "right" });
      doc.moveTo(50, invoiceTableTop + 15).lineTo(550, invoiceTableTop + 15).strokeColor("#cccccc").stroke();

      // --- Table Rows ---
      doc.font("Helvetica");
      let position = invoiceTableTop + 30;
      
      const items = order.items || [];
      items.forEach((item, i) => {
        const title = item.product?.title || item.productName || "Product";
        const price = item.price || 0;
        const qty = item.quantity || 1;
        const lineTotal = price * qty;
        
        // Variant Info
        let variantText = "";
        if (item.selectedWeight) variantText += `Weight: ${item.selectedWeight.weight} `;
        if (item.selectedFlavor) variantText += `Flavor: ${item.selectedFlavor} `;

        doc.fontSize(10).text(title, 50, position, { width: 200 });
        doc.text("₹" + price.toFixed(2), 280, position, { width: 90, align: "right" });
        doc.text(qty, 370, position, { width: 90, align: "right" });
        doc.text("₹" + lineTotal.toFixed(2), 460, position, { width: 90, align: "right" });
        
        position += 15;
        if (variantText) {
            doc.fontSize(8).fillColor("gray").text(variantText, 50, position, { width: 200 });
            position += 15;
            doc.fillColor("#444444"); // reset color
        }
        
        position += 10;

        // Add page if table is too long
        if (position > 700) {
            doc.addPage();
            position = 50;
        }
      });

      doc.moveTo(50, position).lineTo(550, position).strokeColor("#cccccc").stroke();
      position += 20;

      // --- Totals ---
      const subtotal = order.totalAmount || items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
      const discount = order.discount || 0;
      const finalAmount = order.finalAmount || (subtotal - discount);

      doc.font("Helvetica-Bold").text("Subtotal:", 350, position, { width: 100, align: "right" });
      doc.font("Helvetica").text("₹" + subtotal.toFixed(2), 460, position, { width: 90, align: "right" });
      position += 20;

      if (discount > 0) {
          doc.font("Helvetica-Bold").text("Discount:", 350, position, { width: 100, align: "right" });
          doc.font("Helvetica").text("- ₹" + discount.toFixed(2), 460, position, { width: 90, align: "right" });
          position += 20;
      }

      doc.font("Helvetica-Bold").text("Total:", 350, position, { width: 100, align: "right" });
      doc.font("Helvetica-Bold").text("₹" + finalAmount.toFixed(2), 460, position, { width: 90, align: "right" });

      // --- Footer ---
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Thank you for your business.", 50, 750, { align: "center", width: 500 });

      doc.end();

      stream.on("finish", () => resolve(true));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};
