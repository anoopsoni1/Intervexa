import { Phone, Mail, MapPin, Linkedin, Github, Link2 } from "lucide-react";

import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased";

const ACCENT = "#B87333";
const SIDEBAR_BG = "#FEF9F3";
const TEXT_PRIMARY = "text-[#1a1a1a]";
const TEXT_SEC = "text-[#666666]";
const TEXT_MUTED = "text-[#888888]";
const BULLET_ROLE = "#5c4d9d";

function cleanLink(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function parseExperienceEntry(entry) {
  const lines = (entry || "")
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

function splitDatesAndLocation(str) {
  if (!str || !String(str).trim()) return { dates: "", location: "" };
  const s = String(str).trim();
  const pipe = s.indexOf("|");
  if (pipe >= 0) {
    return { dates: s.slice(0, pipe).trim(), location: s.slice(pipe + 1).trim() };
  }
  return { dates: s, location: "" };
}

function parseEducationList(education) {
  if (!education || !String(education).trim()) return [];
  const blocks = String(education)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    return {
      degree: lines[0] || "",
      school: lines[1] || "",
      dateLine: lines[2] || "",
    };
  });
}

function getSkillItems(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((skill) => (typeof skill === "string" ? skill : skill?.label || ""))
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeAchievements(value) {
  if (Array.isArray(value)) {
    return value
      .map((a) => {
        if (a == null) return "";
        if (typeof a === "string") return a.trim();
        if (typeof a === "object") return String(a.title || a.label || a.description || "").trim();
        return String(a).trim();
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,|;/)
      .map((a) => a.trim())
      .filter(Boolean);
  }

  if (value == null) return [];
  return [String(value).trim()].filter(Boolean);
}

function toExperienceStrings(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((item) => {
      if (item == null) return "";
      if (typeof item === "string") return item.trim();
      if (typeof item === "object" && item.role != null) {
        const title = String(item.role).trim();
        const company = item.company != null ? String(item.company).trim() : "";
        let dateLine = "";
        if (item.dateLine != null) dateLine = String(item.dateLine).trim();
        else if (item.dates != null) dateLine = String(item.dates).trim();
        const bullets = Array.isArray(item.bullets)
          ? item.bullets.map((b) => String(b).trim()).filter(Boolean)
          : [];
        const parts = [title];
        if (company) parts.push(company);
        if (dateLine) parts.push(dateLine);
        return [...parts, ...bullets].join("\n");
      }
      return String(item).trim();
    })
    .filter(Boolean);
}

function bucketSkillsForSidebar(skillItems) {
  const skills = [...skillItems];
  const n = skills.length;
  if (n === 0) {
    return { hard: [], techniques: [], tools: [] };
  }
  const a = Math.ceil(n / 3);
  const b = Math.ceil((n - a) / 2) + a;
  return {
    hard: skills.slice(0, a),
    techniques: skills.slice(a, b),
    tools: skills.slice(b),
  };
}

function SectionHeadingMain({ title, headingMb = "mb-3" }) {
  return (
    <div className={`${headingMb} resume-section-avoid-break`}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
        {title}
      </h2>
      <div className="mt-1 border-b border-[#d8d8d8]" />
    </div>
  );
}

function SectionHeadingSide({ title }) {
  return (
    <div className="mb-3 resume-section-avoid-break">
      <h2 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
        {title}
      </h2>
      <div className="mt-1 border-b" style={{ borderColor: ACCENT, opacity: 0.85 }} />
    </div>
  );
}

function GreyDotList({ items }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-1.5 pl-0 list-none m-0">
      {items.map((line, i) => (
        <li key={i} className={`flex gap-2 text-[10px] sm:text-[11px] leading-snug ${TEXT_SEC}`}>
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#b8b8b8]" aria-hidden />
          <span className="min-w-0 wrap-break-word">{line}</span>
        </li>
      ))}
    </ul>
  );
}

/** Skills-only list: copper markers + weight, tuned for sidebar / print. */
function SkillDotList({ items }) {
  if (!items.length) return null;
  return (
    <ul className="m-0 list-none space-y-1 pl-0 [print-color-adjust:exact]">
      {items.map((line, i) => (
        <li
          key={i}
          className={`flex gap-2 text-[10px] sm:text-[11px] leading-[1.45] ${TEXT_PRIMARY}`}
        >
          <span
            className="mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full shadow-[0_0_0_1px_rgba(184,115,51,0.35)]"
            style={{ backgroundColor: ACCENT }}
            aria-hidden
          />
          <span className="min-w-0 wrap-break-word font-semibold tracking-[-0.01em]">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function SkillCategory({ label, items }) {
  if (!items.length) return null;
  return (
    <div className="min-w-0">
      <p
        className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] leading-none"
        style={{ color: ACCENT }}
      >
        {label}
      </p>
      <SkillDotList items={items} />
    </div>
  );
}

const SKILLS_PANEL =
  "rounded-lg border border-black/7 bg-white/75 px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/3 print:bg-[#fffdfb] [print-color-adjust:exact]";

/** Two-column skills in sidebar: core + proficiencies | tools & tech. */
function SkillsSidebarGrid({ skillBuckets }) {
  const hasHard = skillBuckets.hard.length > 0;
  const hasTech = skillBuckets.techniques.length > 0;
  const hasTools = skillBuckets.tools.length > 0;
  const hasLeft = hasHard || hasTech;

  if (!hasLeft && !hasTools) return null;

  const leftStack = (
    <div className="min-w-0 space-y-3">
      <SkillCategory label="Core" items={skillBuckets.hard} />
      <SkillCategory label="Proficiencies" items={skillBuckets.techniques} />
    </div>
  );

  if (!hasTools) {
    return <div className={SKILLS_PANEL}>{leftStack}</div>;
  }

  if (!hasLeft) {
    return (
      <div className={SKILLS_PANEL}>
        <SkillCategory label="Tools & tech" items={skillBuckets.tools} />
      </div>
    );
  }

  return (
    <div className={SKILLS_PANEL}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-start print:grid-cols-2">
        <div className="min-w-0 border-r border-black/6 pr-3 sm:pr-3.5">{leftStack}</div>
        <div className="min-w-0 pl-0.5 sm:pl-0">
          <SkillCategory label="Tools & tech" items={skillBuckets.tools} />
        </div>
      </div>
    </div>
  );
}

function projectToTitleDesc(p) {
  const raw = typeof p === "string" ? p : p?.title || p?.description || "";
  const t = String(raw).trim();
  if (!t) return null;
  const nl = t.indexOf("\n");
  if (nl > 0) {
    return { title: t.slice(0, nl).trim(), desc: t.slice(nl + 1).trim() };
  }
  return { title: t, desc: "" };
}

function WorkExperienceBlock({ job }) {
  const { dates, location: loc } = splitDatesAndLocation(job.dateLine);
  const dateDisplay = (dates || job.dateLine || "").trim();
  return (
    <div className="resume-section-avoid-break space-y-1.5">
      {job.company || loc ? (
        <p className={`text-[11px] leading-snug ${TEXT_PRIMARY}`}>
          {job.company ? (
            <>
              <span className="font-bold">{job.company}</span>
              {loc ? <span className={`font-normal ${TEXT_SEC}`}>, {loc}</span> : null}
            </>
          ) : (
            <span className={TEXT_SEC}>{loc}</span>
          )}
        </p>
      ) : null}
      {job.title || dateDisplay ? (
        <div
          className={`${job.company || loc ? "mt-1" : ""} flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 w-full`}
        >
          {job.title ? (
            <span className={`text-[11px] font-bold ${TEXT_PRIMARY} min-w-0`}>{job.title}</span>
          ) : (
            <span className="min-w-0" />
          )}
          {dateDisplay ? (
            <span className={`text-[11px] font-bold ${TEXT_PRIMARY} shrink-0 text-right`}>
              {dates || job.dateLine}
            </span>
          ) : null}
        </div>
      ) : null}

      {job.bullets.length > 0 ? (
        <ul className={`space-y-1 pl-0 list-none m-0 ${TEXT_PRIMARY} text-[10px] leading-normal`}>
          {job.bullets.map((b, j) => (
            <li key={j} className="flex gap-1.5">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: BULLET_ROLE }}
                aria-hidden
              />
              <span className="min-w-0">{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Resume 9: left — summary, achievements, skills, certifications;
 * right — header, education, work experience, projects, languages.
 */
export default function Resume9Layout({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "").trim();
  const summary = (data?.summary || "").trim();
  const tagline = (data?.lifePhilosophy || data?.tagline || "").trim();

  const email = (data?.email || "").trim();
  const phone = (data?.phone || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedinRaw = (data?.linkedin || "").trim();
  const linkedin = cleanLink(linkedinRaw);
  const linkedinIsLinkedIn = /linkedin\.com/i.test(linkedinRaw);
  const website = cleanLink(data?.website || "");
  const github = cleanLink(data?.github || "");

  const experienceList = toExperienceStrings(data?.experience)
    .map(parseExperienceEntry)
    .filter((item) => item.title || item.company || item.dateLine || item.bullets.length > 0);

  const projects = (Array.isArray(data?.projects) ? data.projects : []).filter(Boolean);
  const projParsed = projects.map(projectToTitleDesc).filter(Boolean);

  const educationList = parseEducationList(data?.education);
  const skillItems = getSkillItems(data?.skills);
  const langLines = parseLanguageProficiencyList(data?.languageProficiency);
  const achievementsList = limitAchievements(normalizeAchievements(data?.achievements));
  const skillBuckets = bucketSkillsForSidebar(skillItems);

  const certList = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map((c) => (c != null ? String(c).trim() : ""))
    .filter(Boolean)
    .flatMap((c) => c.split("\n").map((l) => l.trim()).filter(Boolean));

  const hasContactInHeader =
    Boolean(phone || email || location || linkedin || github || website);

  const hasSkillSection =
    skillBuckets.hard.length > 0 ||
    skillBuckets.techniques.length > 0 ||
    skillBuckets.tools.length > 0;

  return (
    <article
      className={`${DOCUMENT_CLASS} max-w-4xl text-[11px] leading-[1.45] print:bg-white`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,7fr)_minmax(0,13fr)] print:grid-cols-[minmax(0,7fr)_minmax(0,13fr)]">
        {/* Left: summary, achievements, skills, certifications */}
        <aside
          className="min-w-0 px-5 sm:px-6 py-6 sm:py-5 md:border-r md:border-[#ebe6df] print:border-r print:border-[#ebe6df] print:bg-[#FEF9F3] order-2 md:order-1 print:order-1"
          style={{ backgroundColor: SIDEBAR_BG }}
        >
          {summary ? (
            <section className="mb-7 resume-section-avoid-break">
              <SectionHeadingSide title="SUMMARY" />
              <p className={`text-[10px] sm:text-[11px] leading-[1.65] ${TEXT_SEC} text-justify`}>{summary}</p>
            </section>
          ) : null}

          {achievementsList.length > 0 && (
            <section className="mb-7 resume-section-avoid-break space-y-0">
              <SectionHeadingSide title="ACHIEVEMENTS" />
              <GreyDotList items={achievementsList} />
            </section>
          )}

          {hasSkillSection && (
            <section className="mb-7 resume-section-avoid-break">
              <SectionHeadingSide title="SKILLS" />
              <SkillsSidebarGrid skillBuckets={skillBuckets} />
            </section>
          )}

          {certList.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionHeadingSide title="OTHER" />
              <GreyDotList items={certList} />
            </section>
          )}
        </aside>

        {/* Right: name + contact header, work experience, projects */}
        <div
          className="min-w-0 bg-white px-6 sm:px-8 py-6 sm:py-7 print:px-6 print:py-6 order-1 md:order-2 print:order-2"
        >
          <header className="resume-section-avoid-break mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <h1 className="text-[28px] sm:text-[32px] font-bold leading-tight tracking-tight" style={{ color: ACCENT }}>
                  {name}
                </h1>
                {role ? <p className={`mt-2 text-[13px] sm:text-[14px] font-normal ${TEXT_SEC}`}>{role}</p> : null}
                {tagline ? (
                  <p className={`mt-2 text-[12px] italic ${TEXT_MUTED} leading-snug`}>{tagline}</p>
                ) : null}
              </div>
              {hasContactInHeader ? (
                <div
                  className={`flex w-full min-w-0 flex-col items-start gap-1.5 text-[10px] sm:text-[11px] ${TEXT_SEC} sm:w-auto sm:max-w-[min(100%,20rem)] sm:items-end sm:text-right print:max-w-80 print:items-end print:text-right`}
                >
                  {location ? (
                    <span className="inline-flex max-w-full items-start justify-end gap-1.5 text-left sm:text-right">
                      <MapPin size={12} className="mt-0.5 shrink-0 opacity-70" strokeWidth={1.75} />
                      <span className="leading-snug">{location}</span>
                    </span>
                  ) : null}
                  {phone ? (
                    <span className="inline-flex items-center justify-end gap-1.5">
                      <Phone size={12} className="shrink-0 opacity-70" strokeWidth={1.75} />
                      <span className="tabular-nums">{phone}</span>
                    </span>
                  ) : null}
                  {email ? (
                    <span className="inline-flex max-w-full items-center justify-end gap-1.5 break-all">
                      <Mail size={12} className="shrink-0 opacity-70" strokeWidth={1.75} />
                      {email}
                    </span>
                  ) : null}
                  {linkedin ? (
                    <span className="inline-flex max-w-full items-center justify-end gap-1.5 break-all">
                      {linkedinIsLinkedIn ? (
                        <Linkedin size={12} className="shrink-0 opacity-70" strokeWidth={1.75} />
                      ) : (
                        <Link2 size={12} className="shrink-0 opacity-70" strokeWidth={1.75} />
                      )}
                      {linkedin}
                    </span>
                  ) : null}
                  {github ? (
                    <span className="inline-flex max-w-full items-center justify-end gap-1.5 break-all">
                      <Github size={12} className="shrink-0 opacity-70" strokeWidth={1.75} />
                      {github}
                    </span>
                  ) : null}
                  {website ? (
                    <span className="inline-flex max-w-full items-center justify-end gap-1.5 break-all">
                      <Link2 size={12} className="shrink-0 opacity-70" strokeWidth={1.75} />
                      {website}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </header>

          {educationList.length > 0 ? (
            <section className="mb-6 resume-section-avoid-break">
              <SectionHeadingMain title="EDUCATION" headingMb="mb-2" />
              <div className="space-y-4">
                {educationList.map((edu, i) => {
                  const metaParts = [];
                  const dl = (edu.dateLine || "").trim();
                  if (dl) {
                    const { dates, location: loc } = splitDatesAndLocation(dl);
                    if (loc) metaParts.push(loc);
                    if (dates) metaParts.push(dates);
                    if (!loc && !dates && dl) metaParts.push(dl);
                  }
                  const meta = metaParts.join(" · ");
                  return (
                    <div key={i}>
                      {edu.school ? (
                        <p className={`text-[11px] font-bold ${TEXT_PRIMARY}`}>{edu.school}</p>
                      ) : null}
                      {edu.degree ? (
                        <p className={`mt-1 text-[10px] sm:text-[11px] ${TEXT_SEC} leading-snug`}>{edu.degree}</p>
                      ) : null}
                      {meta ? (
                        <p className={`mt-1 text-[10px] sm:text-[11px] ${TEXT_MUTED} leading-snug`}>{meta}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {experienceList.length > 0 ? (
            <section className="mb-6">
              <SectionHeadingMain title="WORK EXPERIENCE" headingMb="mb-2" />
              <div className="space-y-0">
                {experienceList.map((job, index) => (
                  <div
                    key={index}
                    className={
                      index < experienceList.length - 1
                        ? "resume-section-avoid-break border-b border-dotted border-[#cccccc] pb-2 mb-2"
                        : "resume-section-avoid-break"
                    }
                  >
                    <WorkExperienceBlock job={job} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {projParsed.length > 0 ? (
            <section className="mb-2">
              <SectionHeadingMain title="PROJECTS" />
              <div className="space-y-3">
                {projParsed.map((proj, index) => (
                  <div key={index} className="resume-section-avoid-break">
                    <p className={`text-[12px] font-bold ${TEXT_PRIMARY} leading-tight`}>{proj.title}</p>
                    {proj.desc ? (
                      <p className={`mt-1 text-[11px] leading-[1.55] ${TEXT_SEC}`}>{proj.desc}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {langLines.length > 0 ? (
            <section className="mb-2 resume-section-avoid-break">
              <SectionHeadingMain title="LANGUAGES" headingMb="mb-2" />
              <GreyDotList items={langLines} />
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
