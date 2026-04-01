import { createWorker } from "tesseract.js";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const MIN_NATIVE_TEXT_LEN = 72;
const MAX_OCR_PAGES = 15;
const PDF_RENDER_SCALE = 2;

function normalizeForMeasure(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

/**
 * True when PDF text layer is missing or too sparse (typical scanned PDF).
 */
export function shouldFallbackToOcr(text) {
  const t = normalizeForMeasure(text);
  if (t.length < MIN_NATIVE_TEXT_LEN) return true;
  const alnum = (t.match(/[a-zA-Z0-9]/g) || []).length;
  if (t.length > 24 && alnum / t.length < 0.25) return true;
  return false;
}

/** OCR a single image buffer (PNG, JPEG, WebP, etc.). */
async function recognizeBuffer(worker, buffer) {
  const {
    data: { text },
  } = await worker.recognize(buffer);
  return (text || "").trim();
}

/**
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
export async function ocrImageBuffer(buffer) {
  const lang = process.env.OCR_LANG || "eng";
  const worker = await createWorker(lang);
  try {
    return await recognizeBuffer(worker, buffer);
  } finally {
    await worker.terminate().catch(() => {});
  }
}

/**
 * Render each PDF page to a bitmap and run Tesseract (scanned PDFs).
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>}
 */
export async function ocrPdfBuffer(pdfBuffer) {
  const lang = process.env.OCR_LANG || "eng";
  const worker = await createWorker(lang);
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.449/standard_fonts/",
    });
    const pdf = await loadingTask.promise;
    const numPages = Math.min(pdf.numPages, MAX_OCR_PAGES);
    const parts = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
      const w = Math.max(1, Math.ceil(viewport.width));
      const h = Math.max(1, Math.ceil(viewport.height));
      const canvas = createCanvas(w, h);
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      const pngBuffer = canvas.toBuffer("image/png");
      const pageText = await recognizeBuffer(worker, pngBuffer);
      if (pageText) parts.push(pageText);
    }

    if (pdf.numPages > MAX_OCR_PAGES) {
      parts.push(
        `\n[Note: Only the first ${MAX_OCR_PAGES} pages were OCR-scanned; this PDF has ${pdf.numPages} pages.]`
      );
    }

    return parts.join("\n\n").trim();
  } finally {
    await worker.terminate().catch(() => {});
  }
}
