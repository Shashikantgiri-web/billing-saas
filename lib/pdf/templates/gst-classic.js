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
  const currency = settings?.currency
