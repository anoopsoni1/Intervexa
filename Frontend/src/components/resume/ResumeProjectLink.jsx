/** Clickable project URL for resume templates (screen + print/PDF). */

export function resumeProjectHref(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export default function ResumeProjectLink({ url, className, children }) {
  const href = resumeProjectHref(url);
  if (!href) return null;
  const label =
    children ??
    String(url)
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/$/, "");
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
}
