/** Normalize achievements from API/detail state into plain strings. */
function toAchievementStrings(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((a) => {
        if (a == null) return "";
        if (typeof a === "string") return a.trim();
        if (typeof a === "object") {
          return String(a.title || a.label || a.description || a.name || "").trim();
        }
        return String(a).trim();
      })
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/\n|,|;/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(raw).trim()].filter(Boolean);
}

/** Max achievements shown on resume templates (top items only, keeps layout tidy). */
export const RESUME_ACHIEVEMENTS_MAX = 4;

/** Cap list length so resume layouts stay printable. */
export function limitAchievements(raw, max = RESUME_ACHIEVEMENTS_MAX) {
  return toAchievementStrings(raw).slice(0, max);
}
