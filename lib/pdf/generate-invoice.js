import { renderModernTemplate } from "./templates/modern";
import { renderGstClassicTemplate } from "./templates/gst-classic";

export const AVAILABLE_TEMPLATES = [
  { id: "modern", label: "Modern" },
  { id: "gst_classic", label: "GST Classic (India)" },
];

/**
 * Builds an invoice PDF and returns the jsPDF document (caller decides
 * whether to .save() it, open it in a new tab, etc).
 *
 * @param {object} data - { invoice, items, business, settings }
 * @param {string} template - one of AVAILABLE_TEMPLATES ids, default "modern"
 */
export async function generateInvoicePDF(data, template = "modern") {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  if (template === "gst_classic") {
    await renderGstClassicTemplate(doc, data);
  } else {
    renderModernTemplate(doc, data);
  }

  return doc;
}
