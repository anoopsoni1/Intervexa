/**
 * Build HTML + CSS for server-side visual PDF (Puppeteer + Tailwind + print rules).
 */

function doubleRaf() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function cssTextFromStyleSheet(sheet) {
  try {
    const rules = sheet?.cssRules;
    if (!rules) return "";
    let out = "";
    for (let i = 0; i < rules.length; i++) {
      out += rules[i].cssText + "\n";
    }
    return out;
  } catch {
    return "";
  }
}

/**
 * Collect CSS from document stylesheets (Tailwind + inline). Cross-origin sheets are skipped unless fetchable same-origin.
 */
export async function collectDocumentCss() {
  const parts = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let text = await cssTextFromStyleSheet(sheet);
    if (!text.trim() && sheet.href) {
      try {
        const res = await fetch(sheet.href, { credentials: "same-origin" });
        if (res.ok) text = await res.text();
      } catch {
        /* ignore */
      }
    }
    if (text.trim()) parts.push(text);
  }

  return parts.join("\n\n");
}

const INNER_WRAP_CLASS =
  "resume-content-fit w-full origin-top-left flex flex-col justify-start items-stretch min-h-0";

function applyResetLayoutStyles(host) {
  host.style.cssText = [
    "transform: none",
    "width: 100%",
    "max-width: 100%",
    "position: relative",
    "left: 0",
    "top: 0",
    "flex: 1",
  ].join("; ");
}

/**
 * @param {HTMLElement} contentHost — `.resume-content-fit` ref (layout + footer).
 * @param {string} onePageWrapperClass — Tailwind classes for outer wrapper (letter page).
 * @param {string} printCssExtra — contents of resumePrintPdf.css (print + @page).
 */
export async function buildVisualResumePdfPayload(contentHost, onePageWrapperClass, printCssExtra) {
  if (!contentHost || !(contentHost instanceof HTMLElement)) {
    throw new Error("Missing resume content");
  }

  const saved = contentHost.style.cssText;
  applyResetLayoutStyles(contentHost);

  await doubleRaf();

  const inner = contentHost.innerHTML;
  contentHost.style.cssText = saved;

  const sheetCss = await collectDocumentCss();
  const html = `<div class="${onePageWrapperClass.replace(/"/g, "")}"><div class="${INNER_WRAP_CLASS}" style="transform:none!important;width:100%!important;max-width:100%!important;position:relative!important;">${inner}</div></div>`;

  const css = `${sheetCss}\n\n${printCssExtra || ""}\n\nbody{margin:0;padding:0;background:#fff;}`;

  return { html, css };
}
