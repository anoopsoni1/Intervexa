import "../config/puppeteerCacheEnv.js";
import puppeteer from "puppeteer";
import { Asynchandler } from "../utils/Asynchandler.js";
import { incrementResumePdfExportCounts } from "./resume.controller.js";

/**
 * POST body: { html: string, css?: string }
 * Renders with print CSS (Chromium) so PDF matches ResumeView layout.
 * Increments resumesGeneratedToday + resumesDownloadedToday once per successful PDF (single DB write).
 */
export const generateResumePDF = Asynchandler(async (req, res) => {
  const { html, css } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!html || typeof html !== "string") {
    return res.status(400).json({ message: "HTML content is required" });
  }

  const safeCss = typeof css === "string" ? css : "";
  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${safeCss}</style></head><body>${html}</body></html>`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(doc, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.emulateMediaType("print");
    try {
      await page.evaluate(() => document.fonts?.ready);
    } catch {
      /* ignore */
    }

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();
    browser = null;
    if (userId) {
      await incrementResumePdfExportCounts(userId);
    }
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Intervexa Resume.pdf`,
    });
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF", error: error.message });
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
});
