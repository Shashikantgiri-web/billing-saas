/**
 * "Modern" invoice template — a simple, clean layout (the original design).
 * Signature: (doc, { invoice, items, business, settings }) => void
 * Draws directly onto the passed jsPDF `doc` instance.
 */
export function renderModernTemplate(doc, { invoice, items, business, settings }) {
  const currency = settings?.currency || "";
  let y = 20;

  doc.setFontSize(16);
  doc.text(business?.name || "Invoice", 14, y);
  y += 8;
  doc.setFontSize(10);
  if (business?.email) { doc.text(business.email, 14, y); y += 5; }
  if (business?.phone) { doc.text(business.phone, 14, y); y += 5; }
  if (settings?.gst_number) { doc.text(`GST: ${settings.gst_number}`, 14, y); y += 5; }

  y += 5;
  doc.setFontSize(12);
  doc.text(`Invoice ${invoice.invoice_number}`, 14, y);
  doc.text(new Date(invoice.created_at).toLocaleDateString(), 150, y);
  y += 6;
  if (invoice.customer_invoice_number) {
    doc.setFontSize(9);
    doc.text(`Ref: ${invoice.customer_invoice_number}`, 150, y);
    y += 6;
  } else {
    y += 2;
  }

  doc.setFontSize(10);
  doc.text("Bill To:", 14, y);
  y += 5;
  doc.text(invoice.customers?.name || "", 14, y);
  y += 5;
  if (invoice.customers?.email) { doc.text(invoice.customers.email, 14, y); y += 5; }
  if (invoice.customers?.phone) { doc.text(invoice.customers.phone, 14, y); y += 5; }

  const showKg = invoice.measurement_unit === "kg" || invoice.measurement_unit === "both";
  const showLiter = invoice.measurement_unit === "liter" || invoice.measurement_unit === "both";

  y += 8;
  doc.setFontSize(10);
  let colX = { item: 14, qty: 90, kg: 108, liter: 122, price: 138, tax: 160, total: 178 };
  if (!showKg && !showLiter) colX = { item: 14, qty: 100, price: 125, tax: 150, total: 175 };
  else if (showKg && !showLiter) colX = { item: 14, qty: 90, kg: 110, price: 132, tax: 158, total: 178 };
  else if (!showKg && showLiter) colX = { item: 14, qty: 90, liter: 110, price: 132, tax: 158, total: 178 };

  doc.text("Item", colX.item, y);
  doc.text("Qty", colX.qty, y);
  if (showKg) doc.text("Kg", colX.kg, y);
  if (showLiter) doc.text("Liter", colX.liter, y);
  doc.text("Price", colX.price, y);
  doc.text("Tax%", colX.tax, y);
  doc.text("Total", colX.total, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;

  let totalQty = 0;
  let totalAmount = 0;
  items.forEach((item) => {
    totalQty += Number(item.quantity || 0);
    totalAmount += Number(item.line_total || 0);
    doc.text(item.product_name, colX.item, y);
    doc.text(String(item.quantity), colX.qty, y);
    if (showKg) doc.text(item.kg_value != null ? Number(item.kg_value).toFixed(3) : "—", colX.kg, y);
    if (showLiter) doc.text(item.liter_value != null ? Number(item.liter_value).toFixed(3) : "—", colX.liter, y);
    doc.text(Number(item.unit_price).toFixed(2), colX.price, y);
    doc.text(Number(item.tax_percent).toFixed(2), colX.tax, y);
    doc.text(Number(item.line_total).toFixed(2), colX.total, y);
    y += 6;
  });

  y += 1;
  doc.line(14, y, 196, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Total", colX.item, y);
  doc.text(String(totalQty), colX.qty, y);
  doc.text(totalAmount.toFixed(2), colX.total, y);
  doc.setFont("helvetica", "normal");
  y += 4;
  doc.line(14, y, 196, y);
  y += 8;

  const preRoundTotal = Number(invoice.grand_total);
  const roundedTotal = Math.round(preRoundTotal);
  const roundOff = Number((roundedTotal - preRoundTotal).toFixed(2));

  doc.text(`Subtotal: ${currency} ${Number(invoice.subtotal).toFixed(2)}`, 140, y); y += 6;
  doc.text(`Tax: ${currency} ${Number(invoice.tax_total).toFixed(2)}`, 140, y); y += 6;
  doc.text(`Discount: ${currency} ${Number(invoice.discount_total).toFixed(2)}`, 140, y); y += 6;
  doc.text(`Round Off: ${currency} ${roundOff.toFixed(2)}`, 140, y); y += 6;
  doc.setFontSize(12);
  doc.text(`Grand Total: ${currency} ${roundedTotal.toFixed(2)}`, 140, y);
  y += 12;

  const terms =
    Array.isArray(settings?.terms_conditions) && settings.terms_conditions.length > 0
      ? settings.terms_conditions
      : [];
  if (terms.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    terms.forEach((term) => {
      const line = `${term.order}. ${term.text}`;
      const wrapped = doc.splitTextToSize(line, 182);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 4;
    });
  }
}
