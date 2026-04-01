/** Normalize resume `data` from get-detail / portfolio view into structured sections. */

/**
 * Detail API may return `experience` as strings (upload flow) or `{ role, bullets }[]` (form flow).
 */
export function normalizeExperienceToStrings(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (item == null) return "";
      if (typeof item === "string") return String(item).trim();
      if (typeof item === "object") {
        const lines = [];
        if (item.role) lines.push(String(item.role).trim());
        if (item.company) lines.push(String(item.company).trim());
        if (item.dateLine || item.dates) lines.push(String(item.dateLine || item.dates).trim());
        const bullets = Array.isArray(item.bullets) ? item.bullets : [];
        bullets.forEach((b) => {
          const t = String(b || "").trim().replace(/^\s*[-•·]\s*/, "");
          if (t) lines.push(t);
        });
        return lines.join("\n");
      }
      return String(item).trim();
    })
    .filter(Boolean);
}

export function parseExperienceEntry(entry) {
  const lines = String(entry || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    company: lines[1] || "",
    dateLine: lines[2] || "",
    bullets: lines.slice(3),
  };
}

export function parseExperienceList(raw) {
  const list = Array.isArray(raw) ? raw.filter(Boolean) : [];
  return list.map(parseExperienceEntry).filter((item) => item.title || item.company || item.dateLine || item.bullets.length);
}

export function parseEducationBlocks(education) {
  if (!education || !String(education).trim()) return [];
  return String(education)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
      return {
        degree: lines[0] || "",
        school: lines[1] || "",
        dateLine: lines[2] || "",
      };
    })
    .filter((e) => e.degree || e.school || e.dateLine);
}

export function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((s) => (typeof s === "string" ? s : s?.label || ""))
    .map((s) => String(s).trim())
    .filter(Boolean);
}

export function normalizeStringList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v || "").trim()).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  return [];
}

export function languageLines(languageProficiency) {
  if (!languageProficiency || !String(languageProficiency).trim()) return [];
  return String(languageProficiency)
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}
