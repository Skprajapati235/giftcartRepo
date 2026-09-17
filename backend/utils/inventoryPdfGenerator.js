const PDFDocument = require("pdfkit");

/**
 * Generate a styled PDF Inventory Audit Report
 * @param {Array} items - List of inventory items
 * @param {Object} summary - Summary KPI metrics
 * @param {WritableStream} stream - Output stream (usually Express res)
 */
exports.generateInventoryPDF = (items, summary, stream) => {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4 provides 841.89 x 595.28 points — ideal for tables
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 36, bottom: 36, left: 36, right: 36 },
        bufferPages: true,
      });

      doc.pipe(stream);

      const pageWidth = 841.89;
      const pageHeight = 595.28;
      const contentWidth = pageWidth - 72; // 769.89

      // --- Header ---
      doc.rect(36, 36, contentWidth, 54).fill("#0F172A");

      doc
        .fillColor("#FFFFFF")
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("GIFTORA INVENTORY AUDIT REPORT", 50, 48);

      const dateStr = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#94A3B8")
        .text(`Generated on: ${dateStr} • Admin Inventory Audit`, 50, 70);

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#38BDF8")
        .text("CONFIDENTIAL", pageWidth - 150, 56, { align: "right" });

      // --- KPI Summary Cards ---
      const kpiTop = 100;
      const cardWidth = (contentWidth - 40) / 5; // 5 cards
      const cardHeight = 44;

      const kpis = [
        { label: "Total Items", value: `${summary.totalProducts || items.length}`, color: "#3B82F6" },
        { label: "Stock Units", value: `${summary.totalStock || 0}`, color: "#10B981" },
        { label: "Total Valuation", value: `INR ${(summary.totalValueSelling || 0).toLocaleString("en-IN")}`, color: "#8B5CF6" },
        { label: "Low Stock Alerts", value: `${summary.lowStockCount || 0}`, color: "#F59E0B" },
        { label: "Out of Stock", value: `${summary.outOfStockCount || 0}`, color: "#EF4444" },
      ];

      kpis.forEach((kpi, index) => {
        const x = 36 + index * (cardWidth + 10);
        doc.roundedRect(x, kpiTop, cardWidth, cardHeight, 4).fillAndStroke("#F8FAFC", "#E2E8F0");
        doc.rect(x, kpiTop, 4, cardHeight).fill(kpi.color);

        doc
          .fillColor("#64748B")
          .fontSize(8)
          .font("Helvetica")
          .text(kpi.label.toUpperCase(), x + 10, kpiTop + 8);

        doc
          .fillColor("#0F172A")
          .fontSize(12)
          .font("Helvetica-Bold")
          .text(kpi.value, x + 10, kpiTop + 22);
      });

      // --- Table Columns Layout ---
      const tableTop = 158;
      const columns = [
        { key: "sku", label: "SKU", width: 75, align: "left" },
        { key: "name", label: "PRODUCT NAME", width: 175, align: "left" },
        { key: "category", label: "CATEGORY", width: 95, align: "left" },
        { key: "spec", label: "SPEC / STEMS", width: 85, align: "left" },
        { key: "price", label: "MRP (INR)", width: 65, align: "right" },
        { key: "salePrice", label: "SALE (INR)", width: 65, align: "right" },
        { key: "stock", label: "STOCK", width: 55, align: "center" },
        { key: "status", label: "STATUS", width: 75, align: "center" },
        { key: "valuation", label: "VALUATION (INR)", width: 79, align: "right" },
      ];

      const drawTableHeader = (y) => {
        doc.rect(36, y, contentWidth, 22).fill("#1E293B");
        let x = 36;
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#F8FAFC");
        columns.forEach((col) => {
          doc.text(col.label, x + 4, y + 7, { width: col.width - 8, align: col.align });
          x += col.width;
        });
      };

      drawTableHeader(tableTop);

      let currentY = tableTop + 22;
      const rowHeight = 20;

      items.forEach((item, i) => {
        // Page break if row will exceed bottom margin
        if (currentY + rowHeight > pageHeight - 50) {
          doc.addPage();
          currentY = 36;
          drawTableHeader(currentY);
          currentY += 22;
        }

        // Alternating row background
        if (i % 2 === 0) {
          doc.rect(36, currentY, contentWidth, rowHeight).fill("#F8FAFC");
        }

        let x = 36;
        doc.font("Helvetica").fontSize(7.5).fillColor("#1E293B");

        const specText = item.flowerCount || item.weight || (item.flowerCountOptions?.length ? `${item.flowerCountOptions.length} Sizes` : "—");
        const categoryName = item.category?.name || "Uncategorized";

        // Row cells
        columns.forEach((col) => {
          let text = "";
          if (col.key === "sku") text = item.sku || "—";
          else if (col.key === "name") text = (item.name || "").length > 32 ? (item.name || "").slice(0, 30) + "…" : item.name;
          else if (col.key === "category") text = categoryName.length > 16 ? categoryName.slice(0, 14) + "…" : categoryName;
          else if (col.key === "spec") text = specText;
          else if (col.key === "price") text = `${item.price || 0}`;
          else if (col.key === "salePrice") text = `${item.salePrice || item.price || 0}`;
          else if (col.key === "stock") text = `${item.stock}`;
          else if (col.key === "status") text = item.stockStatusLabel || "In Stock";
          else if (col.key === "valuation") text = `${(item.totalValuation || 0).toLocaleString("en-IN")}`;

          // Status cell styling
          if (col.key === "status") {
            let badgeBg = "#DCFCE7";
            let badgeText = "#15803D";
            if (item.stockStatus === "out_of_stock") {
              badgeBg = "#FEE2E2";
              badgeText = "#B91C1C";
            } else if (item.stockStatus === "low_stock") {
              badgeBg = "#FEF3C7";
              badgeText = "#B45309";
            }
            doc.roundedRect(x + 4, currentY + 3, col.width - 8, rowHeight - 6, 2).fill(badgeBg);
            doc.font("Helvetica-Bold").fontSize(7).fillColor(badgeText);
            doc.text(text, x + 4, currentY + 6, { width: col.width - 8, align: "center" });
            doc.font("Helvetica").fontSize(7.5).fillColor("#1E293B");
          } else if (col.key === "stock") {
            if (item.stockStatus === "out_of_stock") doc.font("Helvetica-Bold").fillColor("#EF4444");
            else if (item.stockStatus === "low_stock") doc.font("Helvetica-Bold").fillColor("#F59E0B");
            else doc.font("Helvetica-Bold").fillColor("#10B981");
            doc.text(text, x + 4, currentY + 6, { width: col.width - 8, align: col.align });
            doc.font("Helvetica").fillColor("#1E293B");
          } else {
            doc.text(text, x + 4, currentY + 6, { width: col.width - 8, align: col.align });
          }

          x += col.width;
        });

        // Thin bottom border
        doc.moveTo(36, currentY + rowHeight).lineTo(36 + contentWidth, currentY + rowHeight).strokeColor("#E2E8F0").stroke();

        currentY += rowHeight;
      });

      // --- Footer for All Pages ---
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#94A3B8")
          .text(
            `Giftora Inventory Management System • Generated on ${dateStr}`,
            36,
            pageHeight - 24,
            { align: "left" }
          );

        doc.text(
          `Page ${i + 1} of ${totalPages}`,
          pageWidth - 100,
          pageHeight - 24,
          { align: "right" }
        );
      }

      if (stream.on) {
        stream.on("finish", resolve);
        stream.on("error", reject);
      } else {
        doc.on("end", resolve);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
