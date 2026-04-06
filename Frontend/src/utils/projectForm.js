/**
 * Projects in the API are string[]. Each entry is multiline:
 *   Line 1: title
 *   Line 2: optional LINK:https://... or a single-line URL
 *   Rest: description (multiline OK)
 */

export function emptyProjectEntry() {
  return { title: "", link: "", description: "" };
}

function isUrlOnlyLine(s) {
  const t = String(s || "").trim();
  if (!t) return false;
  if (/^https?:\/\/\S+$/i.test(t)) return true;
  if (/^www\.\S+$/i.test(t)) return true;
  return false;
}

export function projectStringToFormEntry(str) {
  const raw = String(str || "");
  if (!raw.trim()) return emptyProjectEntry();
  const lines = raw.split("\n");
  const title = (lines[0] || "").trim();
  let link = "";
  let descStart = 1;
  if (lines.length > 1) {
    const second = (lines[1] || "").trim();
    if (/^LINK:/i.test(second)) {
      link = second.replace(/^LINK:/i, "").trim();
      descStart = 2;
    } else if (isUrlOnlyLine(second)) {
      link = second.trim();
      descStart = 2;
    }
  }
  const description = lines.slice(descStart).join("\n").trim();
  return { title, link, description };
}

export function normalizeProjectFormItem(p) {
  if (p == null) return emptyProjectEntry();
  if (typeof p === "string") return projectStringToFormEntry(p);
  if (typeof p === "object" && !Array.isArray(p)) {
    const title = String(p.title || p.name || p.label || "").trim();
    const link = String(p.link || p.url || p.href || p.repo || p.github || "").trim();
    const description = String(p.description || p.summary || p.details || p.body || "").trim();
    if (!title && !link && !description && (p.title != null || Object.keys(p).length === 0)) {
      return emptyProjectEntry();
    }
    return { title, link, description };
  }
  return projectStringToFormEntry(String(p));
}

export function formProjectToString(p) {
  const { title, link, description } = normalizeProjectFormItem(p);
  const parts = [];
  if (title) parts.push(title);
  if (link) parts.push(`LINK:${String(link).trim()}`);
  if (description) parts.push(description);
  return parts.join("\n");
}

/** Single parser for all resume/portfolio layouts. */
export function parseProjectForResume(raw) {
  return normalizeProjectFormItem(raw);
}
