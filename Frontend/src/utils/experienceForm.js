/**
 * Experience entries in the API are multiline strings:
 * Line 0: job title
 * Line 1: company (optional)
 * Line 2: dates [| location] — location may include "· Remote" / "· Hybrid"
 * Line 3+: bullets
 *
 * Legacy saves: line 0 = role only, line 1+ = bullets (no company/meta rows).
 */

export function emptyExperienceEntry() {
  return {
    jobTitle: "",
    company: "",
    dates: "",
    location: "",
    arrangement: "onsite",
    bullets: [""],
  };
}

/** Split meta line "Dates | Location" */
export function splitExperienceMeta(meta) {
  const s = String(meta || "").trim();
  if (!s) return { dates: "", locationPart: "" };
  const pipe = s.indexOf("|");
  if (pipe >= 0) {
    return { dates: s.slice(0, pipe).trim(), locationPart: s.slice(pipe + 1).trim() };
  }
  return { dates: s, locationPart: "" };
}

/** @param {string} arrangement — "onsite" | "remote" | "hybrid" */
export function buildExperienceMetaLine(dates, location, arrangement) {
  const d = String(dates || "").trim();
  const loc = String(location || "").trim();
  const arr = arrangement || "onsite";

  let locOut = loc;
  if (arr === "remote") {
    locOut = loc ? `${loc} · Remote` : "Remote";
  } else if (arr === "hybrid") {
    locOut = loc ? `${loc} · Hybrid` : "Hybrid";
  }

  if (d && locOut) return `${d} | ${locOut}`;
  if (d) return d;
  return locOut;
}

function stripArrangementSuffix(part) {
  let s = String(part || "").trim();
  s = s.replace(/\s*·\s*(Remote|Hybrid)\s*$/i, "").trim();
  s = s.replace(/\s*\|\s*(Remote|Hybrid)\s*$/i, "").trim();
  return s;
}

function arrangementFromLocationPart(locationPart) {
  const p = String(locationPart || "");
  if (/hybrid/i.test(p)) return "hybrid";
  if (/remote/i.test(p)) return "remote";
  return "onsite";
}

/** True if line 2 looks like dates/meta, not a bullet. */
function lineLooksLikeMeta(line) {
  if (!line || !String(line).trim()) return false;
  const s = String(line).trim();
  if (s.includes("|")) return true;
  return /\d{4}|present|current|\bjan\b|\bfeb\b|\bmar\b|\bapr\b|\bmay\b|\bjun\b|\bjul\b|\baug\b|\bsep\b|\boct\b|\bnov\b|\bdec\b|–|—|\d{1,2}\/\d{4}/i.test(s);
}

/**
 * @param {object} exp — form row (may include legacy `role`)
 */
export function normalizeExperienceFormItem(exp) {
  const base = emptyExperienceEntry();
  if (!exp || typeof exp !== "object") return base;
  const jobTitle = String(exp.jobTitle || exp.role || "").trim();
  return {
    jobTitle,
    company: String(exp.company || "").trim(),
    dates: String(exp.dates || "").trim(),
    location: String(exp.location || "").trim(),
    arrangement: ["remote", "hybrid", "onsite"].includes(exp.arrangement) ? exp.arrangement : "onsite",
    bullets: Array.isArray(exp.bullets) && exp.bullets.length ? exp.bullets.map((b) => String(b ?? "")) : [""],
  };
}

/**
 * Parse API / saved multiline string into form row.
 */
export function experienceStringToFormEntry(str) {
  const lines = String(str || "")
    .split("\n")
    .map((l) => l.replace(/^\s*[•\-*]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length === 0) return emptyExperienceEntry();

  const third = lines[2];
  const hasStructuredHeader =
    lines.length >= 3 && third !== undefined && lineLooksLikeMeta(third);

  if (hasStructuredHeader) {
    const jobTitle = lines[0] || "";
    const company = lines[1] || "";
    const meta = lines[2] || "";
    const bullets = lines.length > 3 ? lines.slice(3) : [""];
    const { dates, locationPart } = splitExperienceMeta(meta);
    const arrangement = arrangementFromLocationPart(locationPart);
    const location = stripArrangementSuffix(locationPart);
    return { jobTitle, company, dates, location, bullets, arrangement };
  }

  const jobTitle = lines[0] || "";
  const bullets = lines.length > 1 ? lines.slice(1) : [""];
  return {
    jobTitle,
    company: "",
    dates: "",
    location: "",
    arrangement: "onsite",
    bullets,
  };
}

/**
 * Serialize one form row to API string.
 */
export function formExperienceToString(exp) {
  const e = normalizeExperienceFormItem(exp);
  const jobTitle = e.jobTitle;
  const bullets = e.bullets.map((b) => (b || "").trim()).filter(Boolean);

  const hasStructure = !!(e.company || e.dates || e.location || e.arrangement !== "onsite");
  const meta = buildExperienceMetaLine(e.dates, e.location, e.arrangement);

  if (!hasStructure) {
    if (!jobTitle && bullets.length === 0) return "";
    if (!jobTitle) return bullets.join("\n");
    if (!bullets.length) return jobTitle;
    return [jobTitle, ...bullets].join("\n");
  }

  const parts = [jobTitle, e.company || "", meta || ""];
  const noBullets = !bullets.length;
  if (noBullets) return parts.join("\n");
  return `${parts.join("\n")}\n${bullets.join("\n")}`;
}
