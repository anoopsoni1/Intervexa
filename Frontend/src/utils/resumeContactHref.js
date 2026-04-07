/**
 * Normalize resume contact fields for use in <a href>. Values often omit https://.
 */
export function resumeExternalHref(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://")) return s;
  if (lower.startsWith("//")) return `https:${s}`;
  return `https://${s}`;
}

export function resumeTelHref(phone) {
  const s = String(phone ?? "").trim();
  if (!s) return "";
  const cleaned = s.replace(/\s/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

export function resumeMailtoHref(email) {
  const s = String(email ?? "").trim();
  if (!s) return "";
  return `mailto:${s}`;
}

/** Use on http(s) links only (opens in a new tab). */
export function resumeHttpNewTabProps(href) {
  const h = String(href ?? "");
  if (/^https?:\/\//i.test(h)) return { target: "_blank", rel: "noopener noreferrer" };
  return {};
}
