/**
 * Parse languageProficiency into lines for resume layouts (string, array of strings, or objects).
 */
export function parseLanguageProficiencyList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (item == null) return "";
        if (typeof item === "string") return item.trim();
        if (typeof item === "object") {
          const name = item.language ?? item.name ?? item.label ?? "";
          const level = item.level ?? item.proficiency ?? "";
          const line = [name, level].filter(Boolean).join(level && name ? " — " : "");
          return line.trim() || String(item.value ?? "").trim();
        }
        return String(item).trim();
      })
      .filter(Boolean);
  }
  const s = String(raw).trim();
  if (!s) return [];
  return s.split(/\n/).map((l) => l.trim()).filter(Boolean);
}
