/**
 * Resume 15 — Modern two-column (≈2/3 + 1/3): teal accents, wavy deco,
 * header with initial + contact; Experience & Projects (main); sidebar:
 * Certifications, Education, Publications, Skills (horizontal underlined), Volunteering.
 */

import { Mail, MapPin, Phone, Calendar, Linkedin, Github } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-lg rounded-none sm:rounded-md overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased font-sans relative";

const TEAL = "#0f7668";
const TEAL_SOFT = "rgba(15, 118, 104, 0.12)";

function cleanLink(url) {
  return String(url || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function firstLetterFromName(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "?";
  const m = s.match(/[\p{L}\p{N}]/u);
  if (m) return m[0].toUpperCase();
  return s[0].toUpperCase();
}

function normalizeLines(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }
  return [];
}

function parseExperience(entry) {
  if (typeof entry === "object" && entry !== null) {
    const bullets = Array.isArray(entry.bullets) ? entry.bullets.map((b) => String(b || "").trim()).filter(Boolean) : [];
    return {
      title: String(entry.role || entry.jobTitle || entry.title || "").trim(),
      company: String(entry.company || "").trim(),
      dates: String(entry.dates || entry.dateLine || entry.datesOrLocation || "").trim(),
      location: String(entry.location || entry.city || "").trim(),
      bullets,
    };
  }
  const lines = String(entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    company: lines[1] || "",
    dates: lines[2] || "",
    location: "",
    bullets: lines.slice(3).map((b) => b.replace(/^\s*[•\-*]\s*/, "").trim()).filter(Boolean),
  };
}

function parseEducationBlocks(education) {
  if (!education || !String(education).trim()) return [];
  return String(education)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const gpaLine = lines.find((l) => /cgpa|\bgpa\b/i.test(l)) || "";
      const datesLine =
        lines.find(
          (l) =>
            !/cgpa|gpa/i.test(l) &&
            (/\d{4}\s*[—–-]\s*\d{4}/i.test(l) ||
              /\d{4}\s*[—–-]\s*present/i.test(l) ||
              /^\w{3,9}\s+\d{4}/i.test(l) ||
              /\d{4}/.test(l))
        ) || "";
      const rest = lines.filter((l) => l !== gpaLine && l !== datesLine);
      const degree = rest[0] || "";
      const school = rest[1] || "";
      const extra = rest.slice(2).join(" ").trim();
      return { degree, school, datesLoc: datesLine, gpa: gpaLine.replace(/^(cgpa|gpa)\s*[:\s]*/i, "").trim() || gpaLine, extra };
    });
}

function parseCertification(cert) {
  const lines = String(cert || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return { title: lines[0] || "", body: lines.slice(1).join(" ").trim() };
}

function flattenSkillInputs(skills) {
  if (!Array.isArray(skills)) return [];
  const rows = [];
  for (const s of skills) {
    if (s == null) continue;
    if (typeof s === "string") {
      s.split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => rows.push(line));
      continue;
    }
    rows.push(s);
  }
  return rows;
}

/** Horizontal underlined units: category lines stay one unit; plain comma lists split. */
function skillUnderlineItems(skills) {
  const out = [];
  for (const s of flattenSkillInputs(skills)) {
    if (s == null) continue;
    if (typeof s === "object" && !Array.isArray(s)) {
      const cat = String(s.category || s.label || s.name || "").trim();
      const val = String(s.items || s.value || s.skills || "").trim();
      if (cat && val) out.push(`${cat}: ${val}`);
      else {
        const label = String(s.label ?? s.name ?? s.title ?? "").trim();
        if (label) out.push(label);
      }
      continue;
    }
    const t = String(s).trim();
    if (!t) continue;
    const m = t.match(/^([^:]+):\s*(.+)$/s);
    if (m && m[1].trim().length < 48) {
      out.push(`${m[1].trim()}: ${m[2].trim()}`);
    } else {
      t.split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((x) => out.push(x));
    }
  }
  return out;
}

function parseVolunteerBlock(raw) {
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    return {
      title: String(raw.title || raw.role || "").trim(),
      org: String(raw.organization || raw.company || "").trim(),
      dates: String(raw.dates || raw.dateLine || "").trim(),
      desc: String(raw.description || raw.summary || "").trim(),
    };
  }
  const lines = String(raw || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    org: lines[1] || "",
    dates: lines[2] || "",
    desc: lines.slice(3).join(" ").trim(),
  };
}

function SectionRule({ children, tight = false }) {
  return (
    <h2
      className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-900 rounded-sm bg-teal-50/95 border-l-[3px] pl-2.5 pr-2 [print-color-adjust:exact] ${
        tight ? "mt-0 py-1 mb-1.5" : "py-1.5 mb-3"
      }`}
      style={{ borderLeftColor: TEAL }}
    >
      {children}
    </h2>
  );
}

function WaveDeco({ corner }) {
  const isTop = corner === "tr";
  return (
    <svg
      className={`pointer-events-none absolute w-[min(42%,200px)] text-teal-600/20 [print-color-adjust:exact] ${
        isTop ? "-top-2 -right-2" : "-bottom-2 -left-2"
      }`}
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path
        fill="currentColor"
        d={
          isTop
            ? "M65 0c18 20 35 50 40 42L100 0H65zM30 0C12 28 0 55 0 70V0h30z"
            : "M0 100c25-15 40-48 55-42 12 5 20 28 45 22V100H0zM0 78c14-5 22-35 38-32 8 2 10 20 22 18v36H0V78z"
        }
      />
    </svg>
  );
}

export default function Resume15Layout({ data }) {
  const nameRaw = (data?.name || "Your Name").trim();
  const nameDisplay = nameRaw.toUpperCase();
  const initial = firstLetterFromName(nameRaw);
  const role = (data?.role || "The role you are applying for?").trim();
  const email = (data?.email || "").trim();
  const phone = (data?.phone || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");
  const github = cleanLink(data?.github || "");
  const summary = (data?.summary || "").trim();

  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((job) => job.title || job.company || job.dates || job.bullets.length > 0);

  const educationBlocks = parseEducationBlocks(data?.education);

  const certifications = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map(parseCertification)
    .filter((c) => c.title || c.body);

  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((p) => p.title || p.description || p.link);

  const pubsRaw = data?.publications ?? data?.publication;
  const publicationLines = normalizeLines(pubsRaw);

  const volRaw = data?.volunteering ?? data?.volunteerExperience;
  const volunteerEntries = Array.isArray(volRaw)
    ? volRaw.map(parseVolunteerBlock).filter((v) => v.title || v.org || v.desc)
    : typeof volRaw === "string" && volRaw.trim()
      ? volRaw.split(/\n\s*\n/).map(parseVolunteerBlock).filter((v) => v.title || v.org || v.desc)
      : [];

  const skillItems = skillUnderlineItems(data?.skills);

  const achievements = limitAchievements(data?.achievements);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl min-w-0 border border-neutral-200 print:border-neutral-300`}>
      <WaveDeco corner="tr" />
      <WaveDeco corner="bl" />

      <div className="relative z-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1.95fr)_minmax(0,1fr)] print:grid-cols-[minmax(0,1.95fr)_minmax(0,1fr)] gap-0">
        {/* —— Main column —— */}
        <div className="min-w-0 px-5 sm:px-8 py-7 sm:py-8 pr-4 sm:pr-6 print:px-6 print:py-6">
          <header className="resume-section-avoid-break mb-7 flex gap-4 sm:gap-5">
            <div
              className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full border-2 text-xl sm:text-2xl font-semibold tracking-tight"
              style={{ backgroundColor: TEAL_SOFT, borderColor: "rgba(15,118,104,0.25)", color: TEAL }}
              aria-hidden
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] sm:text-[26px] font-bold tracking-[0.04em] text-neutral-900 leading-tight">{nameDisplay}</h1>
              <p className="mt-2 text-[13px] sm:text-[14px] font-semibold" style={{ color: TEAL }}>
                {role}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[10px] sm:text-[11px] text-neutral-600">
                {phone ? (
                  <a
                    href={resumeTelHref(phone)}
                    className="inline-flex items-center gap-1.5 text-inherit hover:underline"
                  >
                    <Phone size={13} style={{ color: TEAL }} strokeWidth={2} />
                    <span className="tabular-nums">{phone}</span>
                  </a>
                ) : null}
                {email ? (
                  <a href={resumeMailtoHref(email)} className="inline-flex items-center gap-1.5 min-w-0 text-inherit hover:underline">
                    <Mail size={13} style={{ color: TEAL }} strokeWidth={2} />
                    <span className="break-all">{email}</span>
                  </a>
                ) : null}
                {location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} style={{ color: TEAL }} strokeWidth={2} />
                    {location}
                  </span>
                ) : null}
                {linkedin ? (
                  <a
                    href={resumeExternalHref(linkedin)}
                    className="inline-flex items-center gap-1.5 min-w-0 text-inherit hover:underline"
                    {...resumeHttpNewTabProps(resumeExternalHref(linkedin))}
                  >
                    <Linkedin size={13} style={{ color: TEAL }} strokeWidth={2} />
                    <span className="break-all">{linkedin}</span>
                  </a>
                ) : null}
                {github ? (
                  <a
                    href={resumeExternalHref(github)}
                    className="inline-flex items-center gap-1.5 min-w-0 text-inherit hover:underline"
                    {...resumeHttpNewTabProps(resumeExternalHref(github))}
                  >
                    <Github size={13} style={{ color: TEAL }} strokeWidth={2} />
                    <span className="break-all">{github}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </header>

          {summary ? (
            <section className="resume-section-avoid-break mb-7">
              <SectionRule>Summary</SectionRule>
              <p className="text-[11px] sm:text-[12px] leading-relaxed text-neutral-600 whitespace-pre-wrap">{summary}</p>
            </section>
          ) : null}

          {experienceItems.length > 0 ? (
            <section className={`resume-section-avoid-break ${projectItems.length > 0 ? "mb-3" : "mb-7"}`}>
              <SectionRule>Experience</SectionRule>
              <div className="divide-y divide-dashed divide-neutral-300">
                {experienceItems.map((job, i) => (
                  <div
                    key={i}
                    className={`pt-2 first:pt-0 ${projectItems.length > 0 && i === experienceItems.length - 1 ? "pb-0.5" : "pb-2"}`}
                  >
                    {job.title ? <p className="text-[11px] sm:text-[12px] font-medium text-neutral-600 leading-snug">{job.title}</p> : null}
                    {job.company ? (
                      <p className="mt-0 text-[11px] sm:text-[12px] font-bold leading-snug" style={{ color: TEAL }}>
                        {job.company}
                      </p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-neutral-500 leading-snug">
                      {job.dates ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                          {job.dates}
                        </span>
                      ) : null}
                      {job.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                          {job.location}
                        </span>
                      ) : null}
                    </div>
                    {job.bullets.length > 0 ? (
                      <ul className="mt-1 mb-0 space-y-0.5 pl-3.5 text-[10px] sm:text-[11px] text-neutral-600 leading-snug list-disc marker:text-neutral-400">
                        {job.bullets.map((b, j) => (
                          <li key={j} className="pl-0.5">
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {projectItems.length > 0 ? (
            <section className={`resume-section-avoid-break ${experienceItems.length > 0 ? "pt-0" : ""}`}>
              <SectionRule tight={experienceItems.length > 0}>Projects</SectionRule>
              <div className="divide-y divide-dashed divide-neutral-300">
                {projectItems.map((p, i) => (
                  <div
                    key={i}
                    className={`min-w-0 pb-2 ${i === 0 ? (experienceItems.length > 0 ? "pt-0.5" : "pt-0") : "pt-2"}`}
                  >
                    {p.title ? (
                      <p className="text-[11px] sm:text-[12px] font-medium text-neutral-600 leading-snug">{p.title}</p>
                    ) : null}
                    {p.link ? (
                      <p className="mt-0 text-[10px] sm:text-[11px] leading-snug">
                        <ResumeProjectLink url={p.link} className="font-bold underline text-[#0f7668] print:text-black" />
                      </p>
                    ) : null}
                    {p.description ? (
                      <p className="mt-1 mb-0 text-[10px] sm:text-[11px] text-neutral-600 leading-snug whitespace-pre-wrap">{p.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* —— Sidebar —— */}
        <aside className="min-w-0 border-l border-neutral-200 bg-neutral-50/80 px-4 sm:px-5 py-7 sm:py-8 print:bg-white [print-color-adjust:exact]">
          {certifications.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <SectionRule>Certifications</SectionRule>
              <div className="divide-y divide-dashed divide-neutral-300">
                {certifications.map((c, i) => (
                  <div key={i} className="pb-3 pt-3 first:pt-0">
                    {c.title ? <p className="text-[11px] font-bold text-neutral-800">{c.title}</p> : null}
                    {c.body ? <p className="mt-1 text-[10px] text-neutral-600 leading-relaxed">{c.body}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {educationBlocks.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <SectionRule>Education</SectionRule>
              <div className="divide-y divide-dashed divide-neutral-300">
                {educationBlocks.map((ed, idx) => (
                  <div key={idx} className="pb-3 pt-3 first:pt-0 min-w-0">
                    {ed.degree ? <p className="text-[11px] font-bold text-neutral-800">{ed.degree}</p> : null}
                    {ed.school ? (
                      <p className="mt-0.5 text-[10px] sm:text-[11px] font-semibold" style={{ color: TEAL }}>
                        {ed.school}
                      </p>
                    ) : null}
                    {ed.datesLoc ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-neutral-500">
                        <Calendar size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                        {ed.datesLoc}
                      </p>
                    ) : null}
                    {ed.gpa ? <p className="mt-1 text-[10px] text-neutral-600">{ed.gpa}</p> : null}
                    {ed.extra ? <p className="mt-1 text-[10px] text-neutral-600 leading-relaxed">{ed.extra}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {publicationLines.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <SectionRule>Publications</SectionRule>
              <div className="divide-y divide-dashed divide-neutral-300">
                {publicationLines.map((line, i) => (
                  <p key={i} className="pb-3 pt-3 first:pt-0 text-[10px] sm:text-[11px] text-neutral-600 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          {skillItems.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <SectionRule>Skills</SectionRule>
              <div className="flex flex-wrap gap-x-4 gap-y-2.5">
                {skillItems.map((label, i) => (
                  <span
                    key={`${label}-${i}`}
                    className="inline-block pb-0.5 text-[10px] sm:text-[11px] font-medium text-neutral-800 border-b border-neutral-400 [print-color-adjust:exact]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {volunteerEntries.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <SectionRule>Volunteering</SectionRule>
              <div className="divide-y divide-dashed divide-neutral-300">
                {volunteerEntries.map((v, i) => (
                  <div key={i} className="pb-3 pt-3 first:pt-0">
                    {v.title ? <p className="text-[11px] font-medium text-neutral-600">{v.title}</p> : null}
                    {v.org ? (
                      <p className="mt-0.5 text-[11px] font-bold" style={{ color: TEAL }}>
                        {v.org}
                      </p>
                    ) : null}
                    {v.dates ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-neutral-500">
                        <Calendar size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                        {v.dates}
                      </p>
                    ) : null}
                    {v.desc ? <p className="mt-1 text-[10px] text-neutral-600 leading-relaxed">{v.desc}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {achievements.length > 0 ? (
            <section className="resume-section-avoid-break">
              <SectionRule>Achievements</SectionRule>
              <ul className="space-y-2 text-[10px] text-neutral-600 list-disc pl-4 marker:text-neutral-400">
                {achievements.map((a, i) => (
                  <li key={i} className="leading-relaxed">
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
