import { amountToWords } from "../number-to-words";

/**
 * Rasterizes an SVG data URL into a PNG data URL via an offscreen canvas.
 * jsPDF's addImage cannot embed SVG directly — only raster formats — so
 * any SVG upload must be converted first or it silently fails to render.
 */
function svgDataUrlToPngDataUrl(svgDataUrl, targetWidth = 300) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = targetWidth / (img.width || targetWidth);
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = Math.max(1, Math.round((img.height || targetWidth) * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = svgDataUrl;
  });
}

/**
 * Loads an image URL into a base64 data URL for jsPDF's addImage, along
 * with the format jsPDF needs ("PNG" or "JPEG") read from the data URL's
 * mime type rather than assumed — using the wrong format string is a
 * common cause of addImage silently failing. SVG uploads are rasterized
 * to PNG first, since jsPDF cannot embed SVG directly.
 * Returns null on any failure (missing image, CORS, network) so callers
 * can gracefully skip rendering it rather than throwing.
 */
async function loadImageAsDataUrl(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    if (!dataUrl) return null;

    if (/^data:image\/svg\+xml/i.test(dataUrl)) {
      const pngDataUrl = await svgDataUrlToPngDataUrl(dataUrl);
      if (!pngDataUrl) return null;
      return { dataUrl: pngDataUrl, format: "PNG" };
    }

    const mimeMatch = /^data:image\/(png|jpe?g|webp);/i.exec(dataUrl);
    const format = mimeMatch && /jpe?g/i.test(mimeMatch[1]) ? "JPEG" : "PNG";
    return { dataUrl, format };
  } catch {
    return null;
  }
}

/**
 * "GST Classic" template — a traditional Indian Tax Invoice layout with
 * borders, an item table, CGST/SGST breakdown, and amount in words.
 *
 * NOTE ON TAX SPLIT: the schema has no `state` field for business or
 * customer, so this cannot determine intrastate (CGST+SGST) vs interstate
 * (IGST) automatically. It defaults to the common same-state case and
 * splits the existing tax_total evenly into CGST + SGST. Nothing about
 * tax calculation itself is changed — this is presentation-only. Add a
 * `state` column to `business` and `customers` later if IGST detection
 * is needed.
 *
 * Signature: async (doc, { invoice, items, business, settings }) => void
 */
export async function renderGstClassicTemplate(doc, { invoice, items, business, settings }) {
  const currency = settings?.currency || "Rs.";
  const marginX = 12;
  const pageWidth = 210;
  const contentRight = pageWidth - marginX;

  doc.setDrawColor(0);
  doc.setLineWidth(0.2);

  let y = 12;
  const topY = y;

  // ---- Header ----
  let textX = marginX + 3;
  const logo = await loadImageAsDataUrl(settings?.logo_url);
  if (logo) {
    try {
      doc.addImage(logo.dataUrl, logo.format, marginX + 2, y, 20, 20);
      textX = marginX + 26;
    } catch {
      // Unsupported/corrupt image data — skip the logo, keep text layout.
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(business?.name || "Business Name", textX, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let headerY = y + 11;
  if (business?.location) {
    const locationLines = doc.splitTextToSize(business.location, contentRight - textX - 30);
    doc.text(locationLines, textX, headerY);
    headerY += locationLines.length * 4;
  }
  const contactLine = [business?.phone, business?.email].filter(Boolean).join("  |  ");
  if (contactLine) { doc.text(contactLine, textX, headerY); headerY += 4; }
  if (settings?.gst_number) {
    doc.setFont("helvetica", "bold");
    doc.text(`GSTIN: ${settings.gst_number}`, textX, headerY);
    doc.setFont("helvetica", "normal");
    headerY += 4;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TAX INVOICE", contentRight, y + 8, { align: "right" });
  doc.setFont("helvetica", "normal");

  y = Math.max(headerY, y + 24) + 2;
  doc.line(marginX, y, contentRight, y);
  y += 5;

  // ---- Invoice info row ----
  doc.setFontSize(9);
  doc.text(`Invoice No: ${invoice.invoice_number}`, marginX + 2, y);
  doc.text(`Invoice Date: ${new Date(invoice.created_at).toLocaleDateString("en-IN")}`, contentRight, y, {
    align: "right",
  });
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text(`Status: ${invoice.status === "void" ? "VOID" : "Generated"}`, marginX + 2, y);
  doc.setFont("helvetica", "normal");
  y += 4;
  doc.line(marginX, y, contentRight, y);
  y += 6;

  // ---- Bill To ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Bill To", marginX + 2, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const customer = invoice.customers || {};
  doc.setFontSize(9.5);
  doc.text(customer.name || "", marginX + 2, y);
  y += 4.5;
  doc.setFontSize(8.5);
  if (customer.address) {
    const addressLines = doc.splitTextToSize(customer.address, contentRight - marginX - 4);
    doc.text(addressLines, marginX + 2, y);
    y += addressLines.length * 4;
  }
  const custContact = [customer.phone, customer.email].filter(Boolean).join("  |  ");
  if (custContact) { doc.text(custContact, marginX + 2, y); y += 4; }

  y += 3;
  doc.line(marginX, y, contentRight, y);
  y += 6;

  // ---- Item table ----
  const cols = [
    { key: "sr", label: "Sr", w: 8, align: "left" },
    { key: "item", label: "Item", w: 62, align: "left" },
    { key: "qty", label: "Qty", w: 14, align: "right" },
    { key: "unit", label: "Unit", w: 14, align: "left" },
    { key: "rate", label: "Rate", w: 22, align: "right" },
    { key: "tax", label: "Tax %", w: 16, align: "right" },
    { key: "amount", label: "Amount", w: 26, align: "right" },
  ];
  const tableLeft = marginX;
  const tableWidth = cols.reduce((s, c) => s + c.w, 0);
  const headerH = 7;

  function drawRow(cells, rowY, rowH, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    let x = tableLeft;
    cols.forEach((c, i) => {
      const val = cells[i] ?? "";
      const tx = c.align === "right" ? x + c.w - 2 : x + 2;
      doc.text(String(val), tx, rowY + rowH - 2.5, { align: c.align === "right" ? "right" : "left" });
      x += c.w;
    });
  }

  doc.setFontSize(8.5);
  doc.rect(tableLeft, y, tableWidth, headerH);
  drawRow(cols.map((c) => c.label), y, headerH, true);
  let colX = tableLeft;
  cols.forEach((c) => {
    doc.line(colX, y, colX, y + headerH);
    colX += c.w;
  });
  doc.line(colX, y, colX, y + headerH);
  y += headerH;

  const rowH = 7;
  items.forEach((item, idx) => {
    if (y + rowH > 275) {
      doc.addPage();
      y = 15;
    }
    doc.rect(tableLeft, y, tableWidth, rowH);
    let cx = tableLeft;
    cols.forEach((c) => {
      doc.line(cx, y, cx, y + rowH);
      cx += c.w;
    });
    doc.line(cx, y, cx, y + rowH);

    drawRow(
      [
        idx + 1,
        item.product_name,
        item.quantity,
        "Nos",
        Number(item.unit_price).toFixed(2),
        `${Number(item.tax_percent).toFixed(1)}%`,
        Number(item.line_total).toFixed(2),
      ],
      y,
      rowH
    );
    y += rowH;
  });

  y += 6;

  // ---- Totals ----
  const totalsX = contentRight - 70;
  const taxTotal = Number(invoice.tax_total) || 0;
  const cgst = taxTotal / 2;
  const sgst = taxTotal / 2;
  const preRoundTotal = Number(invoice.grand_total);
  const roundedTotal = Math.round(preRoundTotal);
  const roundOff = Number((roundedTotal - preRoundTotal).toFixed(2));

  function totalLine(label, value, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 9);
    doc.text(label, totalsX, y);
    doc.text(`${currency} ${Number(value).toFixed(2)}`, contentRight, y, { align: "right" });
    y += 5.5;
  }

  totalLine("Subtotal", invoice.subtotal);
  totalLine("CGST", cgst);
  totalLine("SGST", sgst);
  if (Number(invoice.discount_total) > 0) totalLine("Discount", -Number(invoice.discount_total));
  totalLine("Round Off", roundOff);
  doc.line(totalsX, y, contentRight, y);
  y += 4;
  totalLine("Grand Total", roundedTotal, true);
  y += 3;

  // ---- Amount in words ----
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  const words = amountToWords(roundedTotal);
  const wrapped = doc.splitTextToSize(`Amount in Words: ${words}`, contentRight - marginX - 4);
  doc.text(wrapped, marginX + 2, y);
  y += wrapped.length * 4 + 4;
  doc.setFont("helvetica", "normal");

  doc.line(marginX, y, contentRight, y);
  y += 6;

  // ---- Footer ----
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions", marginX + 2, y);
  doc.setFont("helvetica", "normal");
  y += 4;
  const terms = [
    "1. Goods once sold will not be taken back.",
    "2. Interest will be charged on overdue bills.",
    "3. Subject to local jurisdiction only.",
  ];
  const termsBlockTop = y;
  terms.forEach((t) => {
    doc.text(t, marginX + 2, y);
    y += 4;
  });
  const termsBlockBottom = y;

  // Signature block (right side) — anchored to the same vertical band as
  // the terms block (not stacked below it), so the two sit side by side
  // instead of the page growing taller than it needs to.
  const sig = await loadImageAsDataUrl(settings?.signature_url);
  const sigLineY = termsBlockTop + 10;
  if (sig) {
    try {
      doc.addImage(sig.dataUrl, sig.format, contentRight - 40, sigLineY - 14, 30, 12);
    } catch {
      // Unsupported/corrupt image data — fall back to a blank signature line only.
    }
  }
  doc.line(contentRight - 45, sigLineY, contentRight - 2, sigLineY);
  doc.setFontSize(8);
  doc.text(`For ${business?.name || "the Business"}`, contentRight - 2, sigLineY + 4, { align: "right" });
  doc.text("Authorized Signatory", contentRight - 2, sigLineY + 8, { align: "right" });

  y = Math.max(termsBlockBottom, sigLineY + 8) + 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.text("Thank you for your business!", pageWidth / 2, y, { align: "center" });

  // Outer border for the whole page content
  doc.setLineWidth(0.3);
  doc.rect(marginX - 2, topY - 2, contentRight - marginX + 4, y - topY + 6);
}
