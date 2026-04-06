/**
 * Remove markdown-style **bold** markers (keeps the text inside). Strips any stray **.
 */
export function stripBoldAsterisks(input) {
  if (input == null) return input;
  let out = String(input);
  let prev;
  do {
    prev = out;
    out = out.replace(/\*\*([\s\S]*?)\*\*/g, "$1");
  } while (out !== prev);
  return out.replace(/\*\*/g, "");
}

export function sanitizeProjectItem(p) {
  if (p == null) return p;
  if (typeof p === "string") return stripBoldAsterisks(p);
  if (typeof p === "object" && !Array.isArray(p)) {
    const o = { ...p };
    for (const k of ["title", "description", "label", "name", "link", "url", "href"]) {
      if (o[k] != null && typeof o[k] === "string") o[k] = stripBoldAsterisks(o[k]);
    }
    return o;
  }
  return stripBoldAsterisks(String(p));
}

/** Normalize project entries from API / AI / parse (string or { title, description, ... }). */
export function sanitizeProjectsArray(projects) {
  if (!Array.isArray(projects)) return projects;
  return projects.map(sanitizeProjectItem);
}
