import { Phone, Mail, MapPin, ExternalLink, GraduationCap, Sparkles } from "lucide-react";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

function cleanUrl(url) {
  return (url || "").toString().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/** Parse experience entry into job title, company, dates, bullets */
function parseExperienceEntry(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    company: lines[1] || "",
    dates: lines[2] || "",
    bullets: lines.slice(3),
  };
}

/** Parse education string; supports multiple entries separated by double newline. */
function parseEducationList(education) {
  if (!education || !String(education).trim()) return [];
  const blocks = education.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    return {
      school: lines[0] || "",
      degree: lines[1] || "",
      dates: lines[2] || "",
    };
  });
}

function splitList(text) {
  const raw = (text || "").toString().trim();
  if (!raw) return [];
  return raw
    .split(/[,;|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Skills as string, string[], or objects with label/name/title/skill (same idea as Resume 6/8). */
function normalizeSkills(raw) {
  if (raw == null) return [];
  if (typeof raw === "string") return splitList(raw);
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (item == null) continue;
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push(...splitList(t));
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

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="h-px flex-1 bg-slate-200" aria-hidden />
      <h2 className="text-[11px] font-extrabold tracking-[0.18em] text-slate-700 uppercase whitespace-nowrap">
        {children}
      </h2>
      <span className="h-px flex-1 bg-slate-200" aria-hidden />
    </div>
  );
}

/** Resume 5: sidebar — Summary, Achievements, Skills; main — Education, Experience, Projects, Languages. */
export default function Resume5Layout({ data }) {
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = (data?.summary || "").toString().trim();

  const phone = (data?.phone || "").toString().trim();
  const email = (data?.email || "").toString().trim();
  const location = (data?.location || data?.address || "").toString().trim();
  const website = cleanUrl(data?.website || data?.linkedin || "");
  const github = cleanUrl(data?.github || "");

  const experienceEntries = (Array.isArray(data?.experience) ? data.experience : [])
    .filter(Boolean)
    .map(parseExperienceEntry)
    .filter((e) => e.title || e.company || e.bullets.length);

  const educationEntries = parseEducationList(data?.education);
  const skills = normalizeSkills(data?.skills);

  const languages = parseLanguageProficiencyList(data?.languageProficiency);
  const projects = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((p) => p.title || p.description || p.link);
  const achievementsList = limitAchievements(data?.achievements);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-hidden print:overflow-visible border border-slate-200 print:border-slate-300`}>
      {/* Header band */}
      <header className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-5 sm:px-6 pt-6 pb-5 print:px-5 print:pt-5 print:pb-4">
        <div className="absolute inset-0 opacity-35 pointer-events-none" aria-hidden>
          <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-cyan-400/25 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 text-center sm:text-left">
            <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight leading-tight print:text-[28px]">
              {name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 tracking-wide uppercase font-semibold print:text-[11px]">
              {role}
            </p>
          </div>
          {(phone || email || location || website || github) && (
            <div className="flex w-full min-w-0 flex-col items-center gap-2 text-[11px] sm:text-xs text-white/92 sm:w-auto sm:max-w-[min(100%,20rem)] sm:items-end sm:text-right print:items-end print:text-right">
              {phone && (
                <span className="inline-flex items-center justify-center gap-2 sm:justify-end print:justify-end">
                  <Phone size={14} className="shrink-0 text-cyan-300/90" />
                  <span className="tabular-nums">{phone}</span>
                </span>
              )}
              {email && (
                <span className="inline-flex max-w-full items-center justify-center gap-2 break-all sm:justify-end print:justify-end">
                  <Mail size={14} className="shrink-0 text-cyan-300/90" />
                  {email}
                </span>
              )}
              {location && (
                <span className="inline-flex max-w-full items-start justify-center gap-2 text-left sm:justify-end sm:text-right print:justify-end">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-cyan-300/90" />
                  <span className="leading-snug">{location}</span>
                </span>
              )}
              {website && (
                <span className="inline-flex max-w-full items-center justify-center gap-2 break-all sm:justify-end print:justify-end">
                  <ExternalLink size={14} className="shrink-0 text-cyan-300/90" />
                  {website}
                </span>
              )}
              {github && (
                <span className="inline-flex max-w-full items-center justify-center gap-2 break-all sm:justify-end print:justify-end">
                  <ExternalLink size={14} className="shrink-0 text-cyan-300/90" />
                  {github}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content: narrow left sidebar, wide right main */}
      <div className="flex flex-col md:flex-row print:flex-row flex-1 min-h-0 bg-white">
        {/* Left column: Summary, Achievements, Skills */}
        <aside className="w-full md:w-[36%] print:w-[37%] min-h-0 px-5 sm:px-6 py-6 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
          {summary && (
            <section className="mb-5">
              <SectionTitle>Summary</SectionTitle>
              <p className="text-[11px] text-slate-700 leading-relaxed">{summary}</p>
            </section>
          )}

          {achievementsList.length > 0 && (
            <section className="mb-5">
              <SectionTitle>Achievements</SectionTitle>
              <ul className="space-y-0.5 list-none pl-0 text-[11px] text-slate-700">
                {achievementsList.map((a, i) => (
                  <li key={i} className="flex gap-2 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" aria-hidden />
                    <span className="whitespace-pre-wrap">{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skills.length > 0 && (
            <section className="mb-5 min-w-0 resume-section-avoid-break">
              <SectionTitle>Skills</SectionTitle>
              <div className="rounded-lg border border-slate-200/95 bg-white p-3 sm:p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-900/5">
                <ul className="m-0 grid grid-cols-2 gap-x-4 gap-y-2.5 list-none p-0 [print-color-adjust:exact]">
                  {skills.map((s, i) => (
                    <li key={`${i}-${s}`} className="flex gap-2.5 min-w-0 items-start">
                      <span
                        className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600 shadow-[0_0_0_2px_rgba(6,182,212,0.2)]"
                        aria-hidden
                      />
                      <span className="text-[11px] sm:text-[12px] font-semibold text-slate-800 leading-snug wrap-break-word tracking-[-0.01em]">
                        {s}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

        </aside>

        {/* Right column: Education, Experience, Projects, Languages */}
        <div className="w-full md:w-[64%] print:w-[64%] min-h-0 px-5 sm:px-7 py-6">
          {educationEntries.length > 0 && (
            <section className="mb-5 resume-section-avoid-break">
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-3">
                {educationEntries.map((ed, i) => (
                  <div key={i} className="resume-section-avoid-break">
                    <div className="flex items-start gap-2">
                      <GraduationCap size={14} className="mt-0.5 text-indigo-700 shrink-0" />
                      <div className="min-w-0">
                        {ed.school && <p className="text-[12px] font-semibold text-slate-900 leading-snug">{ed.school}</p>}
                        {ed.degree && <p className="text-[12px] text-slate-700 leading-snug">{ed.degree}</p>}
                        {ed.dates && <p className="text-[11px] text-slate-500">{ed.dates}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section className="mb-5">
              <SectionTitle>Work Experience</SectionTitle>
              <div className="space-y-1">
                {experienceEntries.map((e, i) => (
                  <div key={i} className="resume-section-avoid-break">
                    <div className="">
                      <div>
                        <p className="text-[12px] font-bold text-slate-900 leading-snug">
                          {e.title || "Role"}
                        </p>
                        {e.company && <p className="text-[12px] text-slate-600 leading-snug">{e.company}</p>}
                      </div>
                      {e.dates && (
                        <p className="text-[11px] text-slate-500 whitespace-nowrap">{e.dates}</p>
                      )}
                    </div>
                    {e.bullets.length > 0 && (
                      <ul className="mt-2 space-y-1 list-none pl-0 text-[12px] text-slate-700">
                        {e.bullets.map((b, j) => (
                          <li key={j} className=" gap-2 leading-snug">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" aria-hidden />
                            <span className="whitespace-pre-wrap">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="mb-5">
              <SectionTitle>Projects</SectionTitle>
              <ul className="space-y-1.5 list-none pl-0 text-[12px] text-slate-700">
                {projects.map((p, i) => (
                  <li key={i} className="flex gap-2 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" aria-hidden />
                    <div className="min-w-0">
                      {p.title ? <span className="font-semibold text-slate-900">{p.title}</span> : null}
                      {p.link ? (
                        <span className="block mt-0.5">
                          <ResumeProjectLink url={p.link} className="text-indigo-700 underline print:text-black font-normal" />
                        </span>
                      ) : null}
                      {p.description ? (
                        <span className="block mt-0.5 whitespace-pre-wrap font-normal text-slate-700">{p.description}</span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section className="mb-1">
              <SectionTitle>Languages</SectionTitle>
              <ul className="space-y-1 list-none pl-0 text-[12px] text-slate-700">
                {languages.map((l, i) => (
                  <li key={i} className="flex gap-2 leading-snug">
                    <Sparkles size={12} className="mt-1 text-cyan-700 shrink-0" aria-hidden />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

