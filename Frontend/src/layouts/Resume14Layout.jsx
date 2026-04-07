/**
 * Resume 14 — Modern two-column: main (white) summary, experience, languages;
 * sidebar (teal) photo, key achievements, education, skills (horizontal chips), training/certifications.
 */

import {
  Mail,
  MapPin,
  Linkedin,
  Github,
  Phone,
  Award,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased";

/** Sidebar & accent teal (pine) */
const TEAL = "#0d5c4f";
const TEAL_BRIGHT = "#0f7668";

function cleanLink(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function parseLanguageRow(line) {
  const raw = String(line || "").trim();
  const parts = raw.split(/[—–\-]/).map((p) => p.trim());
  return { name: parts[0] || raw, level: parts[1] || "", full: raw };
}

function languageBarFillPercent(line) {
  const { full } = parseLanguageRow(line);
  const lower = full.toLowerCase();
  if (/native|fluent|professional|bilingual/.test(lower)) return 100;
  if (/advanced|proficient/.test(lower)) return 85;
  if (/intermediate|conversational|working/.test(lower)) return 65;
  if (/elementary|basic|limited/.test(lower)) return 40;
  return 70;
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
      return {
        degree: lines[0] || "",
        school: lines[1] || "",
        meta: lines[2] || "",
        extra: lines.slice(3).join(" ").trim(),
      };
    });
}

function splitMetaDatesLoc(meta) {
  const s = String(meta || "").trim();
  if (!s) return { dates: "", location: "" };
  const pipe = s.indexOf("|");
  if (pipe >= 0) {
    return { dates: s.slice(0, pipe).trim(), location: s.slice(pipe + 1).trim() };
  }
  return { dates: s, location: "" };
}

function parseAchievementLine(s) {
  const str = String(s || "").trim();
  if (!str) return { title: "", desc: "" };
  for (const sp of [" — ", " – ", " - ", ": ", " | "]) {
    const i = str.indexOf(sp);
    if (i > 0) {
      return { title: str.slice(0, i).trim(), desc: str.slice(i + sp.length).trim() };
    }
  }
  return { title: str, desc: "" };
}

function parseCertification(cert) {
  const lines = String(cert || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    body: lines.slice(1).join(" ").trim(),
  };
}

function twoColumns(list) {
  if (list.length === 0) return [[], []];
  const mid = Math.ceil(list.length / 2);
  return [list.slice(0, mid), list.slice(mid)];
}

/** One form field may contain several "Category: …" lines (newline-separated). */
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

/**
 * Sidebar skills: category + items (e.g. Languages: Python, Java), objects with category/items, or plain lines.
 */
function parseResume14SkillEntries(skills) {
  const out = [];
  for (const s of flattenSkillInputs(skills)) {
    if (s == null) continue;
    if (typeof s === "object" && !Array.isArray(s)) {
      const cat = String(s.category || s.label || s.name || "").trim();
      const val = String(s.items || s.value || s.skills || "").trim();
      if (cat && val) out.push({ type: "pair", category: cat, body: val });
      else {
        const label = String(s.label ?? s.name ?? s.title ?? "").trim();
        if (label) out.push({ type: "plain", text: label });
      }
      continue;
    }
    const t = String(s).trim();
    if (!t) continue;
    const m = t.match(/^([^:]+):\s*(.+)$/s);
    if (m && m[1].trim().length < 48) {
      out.push({ type: "pair", category: m[1].trim(), body: m[2].trim() });
    } else {
      out.push({ type: "plain", text: t });
    }
  }
  return out;
}

/** **segments** render as bold (same convention as Add details skill bodies). */
function SkillLine({ text, className = "" }) {
  const s = String(text ?? "");
  if (!s) return null;
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        const m = part.match(/^\*\*([^*]+)\*\*$/);
        if (m) return <strong key={i}>{m[1]}</strong>;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

const ACHIEVEMENT_ICONS = [Award, DollarSign, TrendingUp, Users];

function MainSectionTitle({ children }) {
  return (
    <h2
      className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-800 mb-3 rounded-sm py-1.5 pl-2.5 pr-2 border-l-[3px] bg-teal-50/95 [print-color-adjust:exact]"
      style={{ borderLeftColor: TEAL_BRIGHT }}
    >
      {children}
    </h2>
  );
}

function SidebarSectionTitle({ children }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-white mb-3 rounded-sm py-1.5 pl-2.5 pr-2 border-l-[3px] border-l-white/90 bg-white/12 shadow-sm [print-color-adjust:exact]">
      {children}
    </h2>
  );
}

function LanguageStripeBar({ line }) {
  const { name, level } = parseLanguageRow(line);
  const pct = languageBarFillPercent(line);
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-[10px] text-neutral-600">
        <span className="font-semibold text-neutral-800">{name}</span>
        {level ? <span className="shrink-0 text-neutral-500">{level}</span> : null}
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-sm bg-neutral-200 [print-color-adjust:exact]">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${pct}%`,
            backgroundColor: TEAL_BRIGHT,
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.22) 3px, rgba(255,255,255,0.22) 6px)",
            printColorAdjust: "exact",
          }}
        />
      </div>
    </div>
  );
}

export default function Resume14Layout({ data }) {
  const nameRaw = (data?.name || "Your Name").trim();
  const name = nameRaw.toUpperCase();
  const role = (data?.role || "Your Role").trim();
  const summary = (data?.summary || "").trim();
  const email = (data?.email || "").trim();
  const phone = (data?.phone || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");
  const github = cleanLink(data?.github || "");

  const photo =
    (data?.photo && String(data.photo).trim()) ||
    (data?.photoUrl && String(data.photoUrl).trim()) ||
    (data?.profileImage && String(data.profileImage).trim()) ||
    (data?.avatar && String(data.avatar).trim()) ||
    "";

  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((job) => job.title || job.company || job.dates || job.bullets.length > 0);

  const languageLines = parseLanguageProficiencyList(data?.languageProficiency);
  const [langColA, langColB] = twoColumns(languageLines);

  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((p) => p.title || p.description || p.link);

  const achievements = limitAchievements(data?.achievements);
  const educationBlocks = parseEducationBlocks(data?.education);
  const skillRows = parseResume14SkillEntries(data?.skills);

  const certificationItems = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map(parseCertification)
    .filter((c) => c.title || c.body);

  return (
    <article
      className={`${DOCUMENT_CLASS} max-w-4xl min-w-0 border border-neutral-200 print:border-neutral-300`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(240px,32%)] print:grid-cols-[minmax(0,1fr)_minmax(220px,30%)]">
        {/* —— Main column (left) —— */}
        <div className="min-w-0 bg-white px-5 sm:px-7 py-6 sm:py-7 print:px-6 print:py-5">
          <header className="resume-section-avoid-break mb-6">
            <h1 className="font-serif text-[26px] sm:text-[30px] font-normal tracking-[0.06em] text-neutral-400 leading-tight">
              {name}
            </h1>
            <p className="mt-2 text-[13px] sm:text-[14px] font-medium text-neutral-700" style={{ color: TEAL_BRIGHT }}>
              {role}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] sm:text-[11px] text-neutral-500">
              {email ? (
                <a
                  href={resumeMailtoHref(email)}
                  className="inline-flex items-center gap-1.5 min-w-0 text-inherit hover:underline"
                >
                  <Mail size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                  <span className="break-all">{email}</span>
                </a>
              ) : null}
              {linkedin ? (
                <a
                  href={resumeExternalHref(linkedin)}
                  className="inline-flex items-center gap-1.5 min-w-0 text-inherit hover:underline"
                  {...resumeHttpNewTabProps(resumeExternalHref(linkedin))}
                >
                  <Linkedin size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                  <span className="break-all">{linkedin}</span>
                </a>
              ) : null}
              {github ? (
                <a
                  href={resumeExternalHref(github)}
                  className="inline-flex items-center gap-1.5 min-w-0 text-inherit hover:underline"
                  {...resumeHttpNewTabProps(resumeExternalHref(github))}
                >
                  <Github size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                  <span className="break-all">{github}</span>
                </a>
              ) : null}
              {phone ? (
                <a
                  href={resumeTelHref(phone)}
                  className="inline-flex items-center gap-1.5 text-inherit hover:underline"
                >
                  <Phone size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                  <span className="tabular-nums">{phone}</span>
                </a>
              ) : null}
              {location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} className="shrink-0 text-neutral-400" strokeWidth={2} />
                  {location}
                </span>
              ) : null}
            </div>
          </header>

          {summary ? (
            <section className="resume-section-avoid-break mb-6">
              <MainSectionTitle>Summary</MainSectionTitle>
              <p className="text-[11px] sm:text-[12px] leading-[1.6] text-neutral-600 whitespace-pre-wrap">{summary}</p>
            </section>
          ) : null}

          {experienceItems.length > 0 ? (
            <section className={`resume-section-avoid-break ${projectItems.length > 0 ? "mb-2" : "mb-6"}`}>
              <MainSectionTitle>Experience</MainSectionTitle>
              <div className="space-y-2">
                {experienceItems.map((job, i) => (
                  <article key={i} className="min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <span className="text-[12px] font-semibold text-neutral-700 leading-snug">{job.title || "Role"}</span>
                      {job.dates ? (
                        <span className="text-[10px] text-neutral-500 shrink-0 leading-snug">{job.dates}</span>
                      ) : null}
                    </div>
                    <div className="mt-0 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      {job.company ? (
                        <span className="text-[11px] font-semibold leading-snug" style={{ color: TEAL_BRIGHT }}>
                          {job.company}
                        </span>
                      ) : (
                        <span />
                      )}
                      {job.location ? (
                        <span className="text-[10px] text-neutral-500 shrink-0 leading-snug">{job.location}</span>
                      ) : null}
                    </div>
                    {job.bullets.length > 0 ? (
                      <ul className="mt-1 mb-0 space-y-0.5 pl-3.5 list-disc text-[10px] sm:text-[11px] text-neutral-600 leading-snug marker:text-neutral-400">
                        {job.bullets.map((b, j) => (
                          <li key={j} className="pl-0.5">
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {projectItems.length > 0 ? (
            <section className="resume-section-avoid-break mb-6 ">
              <MainSectionTitle>Projects</MainSectionTitle>
              <div className="space-y-1.5">
                {projectItems.map((p, idx) => (
                  <div key={idx} className="min-w-0">
                    {p.title ? (
                      <p className="text-[11px] font-semibold text-neutral-800 leading-snug">{p.title}</p>
                    ) : null}
                    {p.link ? (
                      <p className="mt-0 text-[10px] leading-snug">
                        <ResumeProjectLink url={p.link} className="font-medium underline text-[#0f7668] print:text-black" />
                      </p>
                    ) : null}
                    {p.description ? (
                      <p className="mt-1 mb-0 text-[10px] text-neutral-600 whitespace-pre-wrap leading-snug">{p.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {languageLines.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <MainSectionTitle>Languages</MainSectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">{langColA.map((line, i) => <LanguageStripeBar key={`a-${i}`} line={line} />)}</div>
                <div className="space-y-4">{langColB.map((line, i) => <LanguageStripeBar key={`b-${i}`} line={line} />)}</div>
              </div>
            </section>
          ) : null}
        </div>

        {/* —— Sidebar (right) —— */}
        <aside
          className="min-w-0 px-5 sm:px-6 py-7 sm:py-8 print:px-5 print:py-6 text-white [print-color-adjust:exact]"
          style={{ backgroundColor: TEAL }}
        >
          {photo ? (
            <div className="flex justify-center mb-6">
              <img
                src={photo}
                alt=""
                className="h-[100px] w-[100px] sm:h-[112px] sm:w-[112px] rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
            </div>
          ) : null}

          {achievements.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <SidebarSectionTitle>Key achievements</SidebarSectionTitle>
              <div className="space-y-2">
                {achievements.map((raw, i) => {
                  const { title, desc } = parseAchievementLine(raw);
                  const Icon = ACHIEVEMENT_ICONS[i % ACHIEVEMENT_ICONS.length];
                  return (
                    <div key={i} className="flex gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white border border-white/20">
                        <Icon size={14} strokeWidth={2} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white leading-snug">{title}</p>
                        {desc ? <p className="mt-1 text-[10px] text-white/85 leading-relaxed">{desc}</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {educationBlocks.length > 0 ? (
            <section className="resume-section-avoid-break mb-3">
              <SidebarSectionTitle>Education</SidebarSectionTitle>
              <div className="space-y-4">
                {educationBlocks.map((ed, idx) => {
                  const { dates, location: loc } = splitMetaDatesLoc(ed.meta);
                  return (
                    <div key={idx} className="min-w-0 text-[11px]">
                      {ed.degree ? <p className="font-bold text-white leading-snug">{ed.degree}</p> : null}
                      {ed.school ? <p className="mt-1 text-white/90 leading-snug">{ed.school}</p> : null}
                      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[10px] text-white/75">
                        <span>{dates || ed.meta}</span>
                        {loc ? <span className="shrink-0">{loc}</span> : null}
                      </div>
                      {ed.extra ? <p className="mt-1 text-[10px] text-white/70 leading-relaxed">{ed.extra}</p> : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {skillRows.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <SidebarSectionTitle>Skills</SidebarSectionTitle>
              <div className="flex flex-wrap gap-1.5 [print-color-adjust:exact]">
                {skillRows.map((row, i) => (
                  <div
                    key={i}
                    className="inline-flex max-w-full min-w-0 items-baseline gap-x-1 rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-[10px] leading-snug text-white/95 shadow-sm"
                  >
                    {row.type === "pair" ? (
                      <>
                        <span className="shrink-0 font-bold text-white">{row.category}:</span>
                        <SkillLine text={row.body} className="min-w-0 wrap-break-word text-white/90" />
                      </>
                    ) : (
                      <SkillLine text={row.text} className="min-w-0 wrap-break-word" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {certificationItems.length > 0 ? (
            <section className="resume-section-avoid-break">
              <SidebarSectionTitle>Training / courses</SidebarSectionTitle>
              <div className="space-y-3">
                {certificationItems.map((c, i) => (
                  <div key={i} className="min-w-0">
                    {c.title ? <p className="text-[11px] font-bold text-white leading-snug">{c.title}</p> : null}
                    {c.body ? <p className="mt-1 text-[10px] text-white/85 leading-relaxed">{c.body}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
