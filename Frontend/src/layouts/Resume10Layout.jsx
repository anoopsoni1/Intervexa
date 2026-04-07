import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col font-sans antialiased";

const SIDE_SECTION = "resume-section-avoid-break space-y-2.5";
const MAIN_SECTION = "resume-section-avoid-break space-y-3";

function displayLink(url) {
  if (!url) return "";
  return String(url).replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function normalizeSkillItems(raw) {
  if (raw == null) return [];
  if (typeof raw === "string") {
    return raw
      .split(/[,;|\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (item == null) continue;
    if (typeof item === "string") {
      item
        .split(/[,;|\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((t) => out.push(t));
      continue;
    }
    if (typeof item === "object") {
      const label = item.label ?? item.name ?? item.title ?? item.skill ?? item.value ?? "";
      const t = String(label).trim();
      if (t) out.push(t);
    }
  }
  return out;
}

function parseEducationBlocks(education) {
  if (!education) return [];
  if (typeof education === "object" && education !== null) {
    const degree = education.degree || education.title || education.field || "";
    const school = education.institution || education.school || education.university || "";
    const dates =
      education.dates || education.year || education.graduationDate || education.expected || "";
    if (!degree && !school && !dates) return [];
    return [{ degree, school, dates, extra: "" }];
  }
  if (!String(education).trim()) return [];
  const blocks = String(education)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    return {
      degree: lines[0] || "",
      school: lines[1] || "",
      dates: lines[2] || "",
      extra: lines.slice(3).join("\n").trim(),
    };
  });
}

function parseExperienceEntry(entry) {
  if (typeof entry === "object" && entry !== null) {
    const bullets = Array.isArray(entry.bullets) ? entry.bullets.filter(Boolean) : [];
    return {
      title: entry.role || entry.jobTitle || entry.title || "",
      company: entry.company || "",
      location: (entry.location || entry.city || "").trim(),
      dates: entry.dates || entry.datesOrLocation || entry.dateLine || "",
      bullets: bullets.map((b) => (typeof b === "string" ? b : String(b)).trim()).filter(Boolean),
    };
  }
  const lines = String(entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    company: lines[1] || "",
    location: "",
    dates: lines[2] || "",
    bullets: lines.slice(3).map((b) => b.replace(/^\s*[•\-*]\s*/, "").trim()).filter(Boolean),
  };
}

function normalizeProjects(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(Boolean)
    .map((p) => {
      const n = parseProjectForResume(p);
      let tech = "";
      if (typeof p === "object" && p && !Array.isArray(p)) {
        tech = String(p.technologies || p.tech || p.stack || p.tools || "").trim();
      }
      const url = n.link || (typeof p === "object" && p ? String(p.url || p.repo || p.github || "").trim() : "");
      return {
        title: n.title,
        body: n.description,
        tech,
        url: url ? displayLink(url) : "",
        link: url,
      };
    })
    .filter((p) => p.title || p.body || p.tech || p.link);
}

function normalizeAchievement(a) {
  if (a == null) return null;
  if (typeof a === "string") {
    const t = a.trim();
    return t ? { title: t, desc: "" } : null;
  }
  if (typeof a === "object") {
    const title = (a.title || a.name || a.label || "").trim();
    const desc = (a.description || a.detail || "").trim();
    if (!title && !desc) return null;
    return { title, desc };
  }
  return null;
}

function parseCertificationEntry(c) {
  const raw = String(c || "").trim();
  if (!raw) return null;
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 1) return { title: lines[0], body: "" };
  return { title: lines[0], body: lines.slice(1).join("\n") };
}

function twoColumns(list) {
  if (list.length === 0) return [[], []];
  const mid = Math.ceil(list.length / 2);
  return [list.slice(0, mid), list.slice(mid)];
}

function SideRuleTitle({ children }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black border-b-2 border-black pb-1 mb-0 [print-color-adjust:exact]">
      {children}
    </h2>
  );
}

function MainRuleTitle({ children }) {
  return (
    <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-black border-b-2 border-black pb-1.5 mb-0 [print-color-adjust:exact]">
      {children}
    </h2>
  );
}

/**
 * Resume 10: structured sections and labeled details for all profile fields.
 */
export default function Resume10Layout({ data }) {
  const name = (data?.name || "Your Name").toUpperCase();
  const role = (data?.role || "Your Role").toUpperCase();
  const summary = (data?.summary || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const phone = (data?.phone || "").trim();
  const email = (data?.email || "").trim();
  const linkedin = displayLink(data?.linkedin || "");
  const github = displayLink(data?.github || "");

  const educationBlocks = parseEducationBlocks(data?.education);
  const skillsList = normalizeSkillItems(data?.skills);
  const achievementsRaw = limitAchievements(data?.achievements);
  const achievementsList = achievementsRaw.map(normalizeAchievement).filter(Boolean);
  const certifications = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map(parseCertificationEntry)
    .filter(Boolean);
  const languageList = parseLanguageProficiencyList(data?.languageProficiency);
  const projectItems = normalizeProjects(Array.isArray(data?.projects) ? data.projects : []);

  const experienceEntries = (Array.isArray(data?.experience) ? data.experience : [])
    .filter(Boolean)
    .map(parseExperienceEntry)
    .filter((e) => e.title || e.company || e.bullets.length || e.dates);

  const certCols = twoColumns(certifications);
  const skillCols = twoColumns(skillsList);

  const headerContactParts = [phone, email].filter(Boolean);
  const headerSocialParts = [linkedin, github].filter(Boolean);

  return (
    <article
      className={`${DOCUMENT_CLASS} max-w-4xl border border-neutral-200 print:border-neutral-300 text-neutral-900`}
    >
      {/* —— Header —— */}
      <header className="px-5 sm:px-7 pt-6 pb-5 print:px-6 print:pt-5 print:pb-4 border-b border-neutral-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-black leading-[1.05]">{name}</h1>
            <div className="mt-3 bg-black text-white py-2 px-4 print:py-1.5 [print-color-adjust:exact]">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-center">{role}</p>
            </div>
          </div>
          <div className="w-full min-w-0 sm:max-w-[min(100%,17rem)] text-left sm:text-right space-y-2">
            {location && (
              <p className="text-[10px] sm:text-[11px] text-neutral-600 leading-snug font-medium uppercase tracking-[0.12em]">
                {location}
              </p>
            )}
            {headerContactParts.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] sm:text-[10px] text-neutral-800 sm:justify-end">
                {phone && (
                  <>
                    <span className="text-neutral-500 uppercase tracking-wider">P</span>
                    <a href={resumeTelHref(phone)} className="tabular-nums text-inherit hover:underline">
                      {phone}
                    </a>
                  </>
                )}
                {phone && email && <span className="mx-1.5 text-neutral-300">·</span>}
                {email && (
                  <>
                    <span className="text-neutral-500 uppercase tracking-wider">E</span>
                    <a href={resumeMailtoHref(email)} className="break-all text-inherit hover:underline">
                      {email}
                    </a>
                  </>
                )}
              </div>
            )}
            {headerSocialParts.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] sm:text-[10px] text-neutral-800 sm:justify-end">
                {linkedin && (
                  <>
                    <span className="text-neutral-500 uppercase tracking-wider">in</span>
                    <a
                      href={resumeExternalHref(data?.linkedin)}
                      className="break-all text-inherit hover:underline"
                      {...resumeHttpNewTabProps(resumeExternalHref(data?.linkedin))}
                    >
                      {linkedin}
                    </a>
                  </>
                )}
                {linkedin && github && <span className="mx-1.5 text-neutral-300">·</span>}
                {github && (
                  <>
                    <span className="text-neutral-500 uppercase tracking-wider">GH</span>
                    <a
                      href={resumeExternalHref(data?.github)}
                      className="break-all text-inherit hover:underline"
                      {...resumeHttpNewTabProps(resumeExternalHref(data?.github))}
                    >
                      {github}
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,32%)_1fr] print:grid-cols-[minmax(0,32%)_1fr] gap-0 md:gap-0 print:gap-0">
        {/* —— Sidebar —— */}
        <aside className="min-w-0 space-y-7 px-5 sm:px-7 py-7 md:border-r md:border-neutral-200 md:pr-8 print:px-6 print:py-6 print:border-r print:border-neutral-200 print:pr-8 bg-neutral-50/80 print:bg-white">
          {educationBlocks.length > 0 && (
            <section className={SIDE_SECTION}>
              <SideRuleTitle>Education</SideRuleTitle>
              <div className="space-y-4 pt-1">
                {educationBlocks.map((ed, i) => (
                  <div key={i} className="text-[11px] leading-snug border-l-2 border-black pl-2.5 -ml-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                      {ed.degree && <p className="font-bold text-black">{ed.degree}</p>}
                      {ed.dates && (
                        <p className="text-[10px] text-neutral-500 shrink-0 tabular-nums">{ed.dates}</p>
                      )}
                    </div>
                    {ed.school && <p className="text-neutral-700 mt-1 leading-relaxed">{ed.school}</p>}
                    {ed.extra && (
                      <p className="text-[10px] text-neutral-600 mt-1.5 leading-relaxed whitespace-pre-wrap">
                        {ed.extra}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {achievementsList.length > 0 && (
            <section className={SIDE_SECTION}>
              <SideRuleTitle>Achievements</SideRuleTitle>
              <ul className="space-y-1.5 list-none pl-0 pt-1 text-[11px]">
                {achievementsList.map((item, i) => (
                  <li key={i} className="border-l-2 border-neutral-300 pl-2.5 -ml-0.5">
                    {item.title && <p className="font-bold text-black leading-snug">{item.title}</p>}
                    {item.desc && (
                      <p className="mt-1 text-neutral-700 text-[10px] leading-relaxed whitespace-pre-wrap">
                        {item.desc}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skillsList.length > 0 && (
            <section className={SIDE_SECTION}>
              <SideRuleTitle>Skills</SideRuleTitle>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0 pt-1 text-[11px]">
                <ul className="space-y-1.5 list-none pl-0 text-neutral-800">
                  {skillCols[0].map((label, i) => (
                    <li key={`s0-${i}-${label}`} className="flex gap-2.5 items-start">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black" aria-hidden />
                      <span className="leading-relaxed wrap-break-word min-w-0">{label}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1.5 list-none pl-0 text-neutral-800">
                  {skillCols[1].map((label, i) => (
                    <li key={`s1-${i}-${label}`} className="flex gap-2.5 items-start">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black" aria-hidden />
                      <span className="leading-relaxed wrap-break-word min-w-0">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {languageList.length > 0 && (
            <section className={SIDE_SECTION}>
              <SideRuleTitle>Languages</SideRuleTitle>
              <ul className="space-y-1.5 list-none pl-0 pt-1 text-[11px] text-neutral-800">
                {languageList.map((line, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black" aria-hidden />
                    <span className="wrap-break-word leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </aside>

        {/* —— Main column —— */}
        <div className="min-w-0 space-y-8 px-5 sm:px-7 py-7 print:px-6 print:py-6 bg-white">
          {summary && (
            <section className={MAIN_SECTION}>
              <MainRuleTitle>Professional summary</MainRuleTitle>
              <p className="text-[11px] sm:text-[12px] text-neutral-800 leading-[1.65] text-justify hyphens-auto whitespace-pre-wrap pt-1">
                {summary}
              </p>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section className={MAIN_SECTION}>
              <MainRuleTitle>Experience</MainRuleTitle>
              <div className="space-y-2 pt-1">
                {experienceEntries.map((job, i) => (
                  <div key={i} className="resume-section-avoid-break">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 ">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] sm:text-[13px] leading-snug text-black">
                          {job.title && <span className="font-bold">{job.title}</span>}
                          {job.title && job.company && <span className="font-normal text-neutral-600"> · </span>}
                          {job.company && <span className="font-semibold text-neutral-800">{job.company}</span>}
                        </p>
                        {job.location && (
                          <p className="text-[10px] text-neutral-500 mt-0.5">{job.location}</p>
                        )}
                      </div>
                      {job.dates && (
                        <p className="text-[10px] text-neutral-500 shrink-0 text-right tabular-nums uppercase tracking-wide max-w-44 leading-snug">
                          {job.dates}
                        </p>
                      )}
                    </div>
                    {job.bullets.length > 0 && (
                      <ul className=" space-y-0.5 list-none pl-0 text-[11px] text-neutral-800 leading-relaxed">
                        {job.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2.5">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black" aria-hidden />
                            <span className="min-w-0">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectItems.length > 0 && (
            <section className={MAIN_SECTION}>
              <MainRuleTitle>Projects</MainRuleTitle>
              <div className="space-y-0 pt-1">
                {projectItems.map((proj, i) => (
                  <div key={i} className="resume-section-avoid-break pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                    {proj.title && (
                      <p className="font-bold text-black text-[12px] sm:text-[13px] leading-snug">{proj.title}</p>
                    )}
                    {proj.tech && (
                      <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wide">
                        <span className="font-semibold text-neutral-600">Stack: </span>
                        {proj.tech}
                      </p>
                    )}
                    {proj.body && (
                      <p className="mt-1.5 text-[11px] text-neutral-800 leading-relaxed whitespace-pre-wrap">
                        {proj.body}
                      </p>
                    )}
                    {proj.link ? (
                      <p className="text-[10px] text-neutral-600 mt-1.5 break-all">
                        <span className="font-semibold text-neutral-700">Link: </span>
                        <ResumeProjectLink url={proj.link} className="text-blue-800 underline print:text-black" />
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section className={MAIN_SECTION}>
              <MainRuleTitle>Certifications</MainRuleTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 pt-1 text-[11px]">
                <div className="space-y-4">
                  {certCols[0].map((cert, i) => (
                    <div key={i} className="leading-relaxed">
                      <p className="font-bold text-black text-[12px] leading-snug">{cert.title}</p>
                      {cert.body && (
                        <p className="mt-1 text-neutral-700 text-[10px] whitespace-pre-wrap leading-relaxed">
                          {cert.body}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {certCols[1].map((cert, i) => (
                    <div key={i} className="leading-relaxed">
                      <p className="font-bold text-black text-[12px] leading-snug">{cert.title}</p>
                      {cert.body && (
                        <p className="mt-1 text-neutral-700 text-[10px] whitespace-pre-wrap leading-relaxed">
                          {cert.body}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
