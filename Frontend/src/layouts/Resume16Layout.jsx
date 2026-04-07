/**
 * Resume 16 — Modern two-column: light gray sidebar (Contact —, education, achievements, two-col skills);
 * white main column (name split styling, summary, experience, projects). Peach/salmon accents.
 */

import { Phone, Mail, MapPin, Linkedin, Github } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const PEACH = "#cf8b76";
const SIDEBAR_BG = "#efeeed";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-neutral-800 rounded-none shadow-lg overflow-visible print:shadow-none flex-1 min-h-0 flex flex-col font-sans antialiased [print-color-adjust:exact]";

function cleanLink(url) {
  return String(url || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

/** First name(s) uppercase, last name uppercase, last initial for monogram. */
function parseFullName(raw) {
  const s = String(raw || "").trim();
  if (!s) return { first: "YOUR", last: "NAME", initial: "N" };
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const w = parts[0].toUpperCase();
    return { first: "", last: w, initial: (w[0] || "Y").toUpperCase() };
  }
  const last = parts[parts.length - 1].toUpperCase();
  const first = parts.slice(0, -1).join(" ").toUpperCase();
  return { first, last, initial: (last[0] || "?").toUpperCase() };
}

function parseExperience(entry) {
  if (typeof entry === "object" && entry !== null) {
    const title = String(entry.role || entry.jobTitle || entry.title || "").trim();
    const company = String(entry.company || "").trim();
    const dates = String(entry.dates || entry.dateLine || entry.datesOrLocation || "").trim();
    const location = String(entry.location || entry.city || "").trim();
    const bullets = Array.isArray(entry.bullets)
      ? entry.bullets.map((b) => String(b || "").trim()).filter(Boolean)
      : [];
    return { title, company, dates, location, bullets };
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
      const yearLine =
        lines.find(
          (l) =>
            /\d{4}\s*[—–-]\s*\d{4}/i.test(l) ||
            /\d{4}\s*[—–-]\s*present/i.test(l) ||
            /^\d{4}$/.test(l) ||
            /^\w+\s+\d{4}/.test(l)
        ) || "";
      const rest = lines.filter((l) => l !== yearLine);
      const degree = rest[0] || "";
      const school = rest[1] || "";
      const extra = rest.slice(2).join(" ").trim();
      let loc = "";
      let schoolLine = school;
      const paren = school.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      if (paren) {
        schoolLine = paren[1].trim();
        loc = paren[2].trim();
      }
      return { degree, school: schoolLine, location: loc, years: yearLine, extra };
    })
    .filter((b) => b.degree || b.school || b.years);
}

function flattenSkills(skills) {
  if (!Array.isArray(skills)) return [];
  const out = [];
  for (const s of skills) {
    if (s == null) continue;
    if (typeof s === "string") {
      s.split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => out.push(line));
      continue;
    }
    if (typeof s === "object") {
      const cat = String(s.category || s.label || s.name || "").trim();
      const val = String(s.items || s.value || s.skills || "").trim();
      if (cat && val) out.push(`${cat}: ${val}`);
      else out.push(String(s.label ?? s.name ?? s.title ?? "").trim());
      continue;
    }
    out.push(String(s));
  }
  return out.map((t) => t.trim()).filter(Boolean);
}

function parseCert(cert) {
  const lines = String(cert || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return { title: lines[0] || "", body: lines.slice(1).join(" ").trim() };
}

function twoColumns(list) {
  if (!list.length) return [[], []];
  const mid = Math.ceil(list.length / 2);
  return [list.slice(0, mid), list.slice(mid)];
}

function parseAchievementLine(s) {
  const str = String(s || "").trim();
  if (!str) return { title: "", desc: "" };
  for (const sp of [" — ", " – ", " - ", ": ", " | "]) {
    const i = str.indexOf(sp);
    if (i > 0) return { title: str.slice(0, i).trim(), desc: str.slice(i + sp.length).trim() };
  }
  return { title: str, desc: "" };
}

function SidebarRule({ children, isFirst = false }) {
  return (
    <div className={`flex items-center gap-2 mb-2 ${isFirst ? "mt-0" : "mt-5"}`}>
      <h2 className="shrink-0 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-800">
        {children}
      </h2>
      <span className="h-px min-w-[12px] flex-1" style={{ backgroundColor: PEACH }} aria-hidden />
    </div>
  );
}

function MainRule({ children, leadLine = false }) {
  return (
    <div className="mb-2 mt-5 first:mt-0">
      {leadLine ? <div className="mb-2 h-px w-full max-w-full" style={{ backgroundColor: PEACH }} aria-hidden /> : null}
      <div className="flex items-center gap-2">
        <h2 className="shrink-0 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.12em] text-neutral-800">
          {children}
        </h2>
      </div>
    </div>
  );
}

export default function Resume16Layout({ data }) {
  const { first: firstName, last: lastName } = parseFullName(data?.name || "Your Name");
  const role = (data?.role || "Professional Title").trim().toUpperCase();
  const summary = (data?.summary || "").trim();

  const phone = (data?.phone || "").trim();
  const email = (data?.email || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");
  const github = cleanLink(data?.github || "");

  const educationBlocks = parseEducationBlocks(data?.education);
  const skillLines = flattenSkills(data?.skills);
  const languageLines = parseLanguageProficiencyList(data?.languageProficiency);
  const combinedSkillRows = [...skillLines, ...languageLines];
  const [skillsColLeft, skillsColRight] = twoColumns(combinedSkillRows);
  const achievements = limitAchievements(data?.achievements, 6);

  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((j) => j.title || j.company || j.bullets.length > 0);

  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((p) => p.title || p.description || p.link);

  const certifications = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map(parseCert)
    .filter((c) => c.title || c.body);

  const iconWrap = "shrink-0 text-[#cf8b76]";

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl min-w-0 border border-neutral-200 print:border-neutral-300`}>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,32%)_1fr] print:grid-cols-[minmax(180px,30%)_1fr] min-h-full">
        {/* Sidebar */}
        <aside
          className="min-w-0 px-4 sm:px-5 py-6 sm:py-7 print:px-4 print:py-5"
          style={{ backgroundColor: SIDEBAR_BG }}
        >
          {phone || email || location || linkedin || github ? (
            <section className="resume-section-avoid-break">
              <SidebarRule isFirst>Contact —</SidebarRule>
              <div className="space-y-3 text-[10px] text-neutral-700">
            {phone ? (
              <a href={resumeTelHref(phone)} className="flex gap-2 min-w-0 text-inherit hover:underline">
                <Phone size={14} className={iconWrap} strokeWidth={1.75} />
                <span className="tabular-nums leading-snug">{phone}</span>
              </a>
            ) : null}
            {email ? (
              <a href={resumeMailtoHref(email)} className="flex gap-2 min-w-0 text-inherit hover:underline">
                <Mail size={14} className={iconWrap} strokeWidth={1.75} />
                <span className="break-all leading-snug">{email}</span>
              </a>
            ) : null}
            {location ? (
              <p className="flex gap-2 min-w-0">
                <MapPin size={14} className={iconWrap} strokeWidth={1.75} />
                <span className="leading-snug">{location}</span>
              </p>
            ) : null}
            {linkedin ? (
              <a
                href={resumeExternalHref(linkedin)}
                className="flex gap-2 min-w-0 text-inherit hover:underline"
                {...resumeHttpNewTabProps(resumeExternalHref(linkedin))}
              >
                <Linkedin size={14} className={iconWrap} strokeWidth={1.75} />
                <span className="break-all leading-snug">{linkedin}</span>
              </a>
            ) : null}
            {github ? (
              <a
                href={resumeExternalHref(github)}
                className="flex gap-2 min-w-0 text-inherit hover:underline"
                {...resumeHttpNewTabProps(resumeExternalHref(github))}
              >
                <Github size={14} className={iconWrap} strokeWidth={1.75} />
                <span className="break-all leading-snug">{github}</span>
              </a>
            ) : null}
              </div>
            </section>
          ) : null}

          {educationBlocks.length > 0 ? (
            <section className="resume-section-avoid-break mb-3">
              <SidebarRule>Education —</SidebarRule>
              <div className="space-y-3">
                {educationBlocks.map((ed, i) => (
                  <div key={i} className="text-[10px] leading-snug text-neutral-700">
                    {ed.degree ? <p className="font-bold uppercase tracking-wide text-neutral-900">{ed.degree}</p> : null}
                    {ed.school ? (
                      <p className="mt-1">
                        <span className="text-neutral-500">// </span>
                        {ed.school}
                        {ed.location ? `, ${ed.location}` : ""}
                      </p>
                    ) : null}
                    {ed.years ? <p className="mt-0.5 text-neutral-600">{ed.years}</p> : null}
                    {ed.extra ? <p className="mt-1 text-neutral-600">{ed.extra}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {achievements.length > 0 ? (
            <section className="resume-section-avoid-break mb-3">
              <SidebarRule>Achievements —</SidebarRule>
              <div className="space-y-2">
                {achievements.map((raw, i) => {
                  const { title, desc } = parseAchievementLine(raw);
                  return (
                    <div key={i} className="text-[10px] leading-snug">
                      {title ? <p className="font-semibold text-neutral-900">{title}</p> : null}
                      {desc ? <p className="mt-0.5 text-neutral-600">{desc}</p> : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {combinedSkillRows.length > 0 ? (
            <section className="resume-section-avoid-break">
              <SidebarRule>Skills —</SidebarRule>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0 text-[10px] leading-snug text-neutral-700">
                <ul className="m-0 list-none space-y-1 p-0">
                  {skillsColLeft.map((line, i) => (
                    <li key={`sl-${i}`} className="wrap-break-word">
                      {line}
                    </li>
                  ))}
                </ul>
                <ul className="m-0 list-none space-y-1 p-0">
                  {skillsColRight.map((line, i) => (
                    <li key={`sr-${i}`} className="wrap-break-word">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {certifications.length > 0 ? (
            <section className="resume-section-avoid-break">
              <SidebarRule>Certifications —</SidebarRule>
              <div className="space-y-2 text-[10px] leading-snug text-neutral-700">
                {certifications.map((c, i) => (
                  <div key={i}>
                    {c.title ? <p className="font-semibold text-neutral-800">{c.title}</p> : null}
                    {c.body ? <p className="mt-0.5 text-neutral-600">{c.body}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>

        {/* Main */}
        <div className="min-w-0 bg-white px-5 sm:px-7 py-6 sm:py-7 print:px-6 print:py-5">
          <header className="resume-section-avoid-break border-b border-neutral-300 pb-4">
            <h1 className="text-[26px] sm:text-[30px] font-bold leading-[1.05] tracking-[0.08em]">
              {firstName ? (
                <>
                  <span className="text-neutral-800">{firstName}</span>{" "}
                  <span style={{ color: PEACH }}>{lastName}</span>
                </>
              ) : (
                <span style={{ color: PEACH }}>{lastName}</span>
              )}
            </h1>
            {role ? (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-700">{role}</p>
            ) : null}
          </header>

          {summary ? (
            <section className="resume-section-avoid-break">
              <MainRule>Summary —</MainRule>
              <p className="text-[11px] leading-relaxed text-neutral-600 italic whitespace-pre-wrap">{summary}</p>
            </section>
          ) : null}

          {experienceItems.length > 0 ? (
            <section className="resume-section-avoid-break">
              <MainRule leadLine>Professional Experience —</MainRule>
              <div className="space-y-2">
                {experienceItems.map((job, i) => {
                  const locPart = [job.company, job.location].filter(Boolean).join(" — ");
                  return (
                    <div key={i} className="min-w-0 pb-2">
                      {job.title ? (
                        <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-900 leading-snug">{job.title}</p>
                      ) : null}
                      <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[10px] text-neutral-600">
                        {locPart ? <span className="min-w-0 leading-snug">{locPart}</span> : <span />}
                        {job.dates ? (
                          <span className="shrink-0 whitespace-nowrap text-right font-medium text-neutral-700">{job.dates}</span>
                        ) : null}
                      </div>
                      {job.bullets.length > 0 ? (
                        <ul className="mb-0 mt-1 list-[square] space-y-0.5 pl-4 text-[10px] leading-snug text-neutral-600 marker:text-neutral-800">
                          {job.bullets.map((b, j) => (
                            <li key={j} className="pl-0.5">
                              {b}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {projectItems.length > 0 ? (
            <section className="resume-section-avoid-break">
              <MainRule leadLine>Projects —</MainRule>
              <div className="space-y-1.5">
                {projectItems.map((p, idx) => (
                  <div key={idx} className="min-w-0 pb-1">
                    {p.title ? (
                      <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-900 leading-snug">{p.title}</p>
                    ) : null}
                    {p.link ? (
                      <p className="mt-0 text-[10px]">
                        <ResumeProjectLink
                          url={p.link}
                          className="font-semibold underline underline-offset-2 text-[#cf8b76] print:text-neutral-800"
                        />
                      </p>
                    ) : null}
                    {p.description ? (
                      <p className="mt-0.5 text-[10px] leading-snug text-neutral-600 whitespace-pre-wrap">{p.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
