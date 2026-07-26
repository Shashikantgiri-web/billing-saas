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
  y += 8;

  doc.setFontSize(10);
  doc.text("Bill To:", 14, y);
  y += 5;
  doc.text(invoice.customers?.name || "", 14, y);
  y += 5;
  if (invoice.customers?.email) { doc.text(invoice.customers.email, 14, y); y += 5; }
  if (invoice.customers?.phone) { doc.text(invoice.customers.phone, 14, y); y += 5; }

  y += 8;
  doc.setFontSize(10);
  doc.text("Item", 14, y);
  doc.text("Qty", 100, y);
  doc.text("Price", 125, y);
  doc.text("Tax%", 150, y);
  doc.text("Total", 175, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;

  items.forEach((item) => {
    doc.text(item.product_name, 14, y);
    doc.text(String(item.quantity), 100, y);
    doc.text(Number(item.unit_price).toFixed(2), 125, y);
    doc.text(Number(item.tax_percent).toFixed(2), 150, y);
    doc.text(Number(item.line_total).toFixed(2), 175, y);
    y += 6;
  });

  y += 4;
  doc.line(14, y, 196, y);
  y += 8;

  doc.text(`Subtotal: ${currency} ${Number(invoice.subtotal).toFixed(2)}`, 140, y); y += 6;
  doc.text(`Tax: ${currency} ${Number(invoice.tax_total).toFixed(2)}`, 140, y); y += 6;
  doc.text(`Discount: ${currency} ${Number(invoice.discount_total).toFixed(2)}`, 140, y); y += 6;
  doc.setFontSize(12);
  doc.text(`Grand Total: ${currency} ${Number(invoice.grand_total).toFixed(2)}`, 140, y);
}
