import { Phone, Mail, MapPin, Linkedin, Github, Settings, Factory, Award, FolderOpen } from "lucide-react";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

function parseExperienceEntryDetailed(entry) {
  if (typeof entry === "object" && entry !== null) {
    return {
      jobTitle: entry.role || entry.jobTitle || "",
      company: entry.company || "",
      datesOrLocation: entry.dates || entry.datesOrLocation || "",
      bullets: Array.isArray(entry.bullets) ? entry.bullets.filter(Boolean) : [],
    };
  }
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    jobTitle: lines[0] || "",
    company: lines[1] || "",
    datesOrLocation: lines[2] || "",
    bullets: lines.slice(3).map((b) => b.replace(/^\s*[•\-]\s*/, "").trim()).filter(Boolean),
  };
}

function parseEducation(education) {
  if (!education || !String(education).trim()) return null;
  const lines = education.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    degree: lines[0] || "",
    institution: lines[1] || "",
    dates: lines[2] || "",
  };
}

/** Premium Layout 1: Left = Summary, Achievements, Skills (two-column); right = Education, Experience, Projects, Languages. */
const ACCENT = "text-blue-600";
const SECTION_HEAD = "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black pb-1.5 mb-2 border-b border-neutral-300";
const TEXT_MUTED = "text-neutral-500 text-[11px]";

export default function PremiumLayout({ data }) {
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projectsList = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const educationParsed = parseEducation(data?.education);
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntryDetailed(e));
  const achievements = limitAchievements(data?.achievements);
  const location = data?.location || data?.address || "";

  const achievementIcons = [Settings, Factory, Award];
  const hasEducation = !!(data?.education?.trim() || educationParsed);
  const languageList = parseLanguageProficiencyList(data?.languageProficiency);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-visible bg-white print:bg-white`}>
      {/* Header: name + title on left, contact details on right (same row) */}
      <header className="w-full px-4 sm:px-6 pt-5 pb-4 border-b-2 border-blue-600">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">{name}</h1>
            <p className={`text-sm ${ACCENT} mt-0.5`}>{role}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 text-[11px] text-neutral-500">
            {data?.phone && (
              <span className="flex items-center gap-2 sm:justify-end">
                <Phone size={12} className="shrink-0 text-neutral-400" /> {data.phone}
              </span>
            )}
            {data?.email && (
              <span className="flex items-center gap-2 break-all sm:justify-end">
                <Mail size={12} className="shrink-0 text-neutral-400" /> {data.email}
              </span>
            )}
            {(data?.linkedin || data?.website) && (
              <span className="flex items-center gap-2 break-all sm:justify-end">
                <Linkedin size={12} className="shrink-0 text-neutral-400" /> {data.linkedin || data.website || ""}
              </span>
            )}
            {data?.github && (
              <span className="flex items-center gap-2 break-all sm:justify-end">
                <Github size={12} className="shrink-0 text-neutral-400" />{" "}
                {String(data.github).replace(/^https?:\/\//i, "")}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-2 sm:justify-end">
                <MapPin size={12} className="shrink-0 text-neutral-400" /> {location}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="w-full flex flex-col md:flex-row print:flex-row flex-1 min-h-0">
        {/* Left column (narrower): Summary, Achievements, Skills (two-column grid) */}
        <div className="w-full md:w-[38%] print:w-[38%] min-h-0 flex flex-col px-4 sm:px-5 py-4 bg-neutral-50/50 print:bg-neutral-50/80 border-b md:border-b-0 md:border-r border-neutral-200">
          {summary && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Summary</h2>
              <p className="text-[11px] text-black leading-relaxed">{summary}</p>
            </section>
          )}

          {achievements.length > 0 && (
            <section className="resume-section-avoid-break mb-5">
              <h2 className={SECTION_HEAD}>Achievements</h2>
              <div className="space-y-0.5">
                {achievements.map((item, i) => {
                  const Icon = achievementIcons[i % achievementIcons.length];
                  const title = typeof item === "string" ? item : item?.title ?? item?.name ?? "";
                  const desc = typeof item === "object" && item?.description ? item.description : "";
                  return (
                    <div key={i} className="flex gap-2">
                      <Icon size={14} className={`shrink-0 mt-0.5 ${ACCENT}`} />
                      <div className="min-w-0">
                        {title && <p className="text-[11px] font-bold text-black">{title}</p>}
                        {desc && <p className="text-[10px] text-neutral-600 leading-snug">{desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {skillsList.length > 0 && (
            <section className="mb-5 resume-section-avoid-break">
              <h2 className={SECTION_HEAD}>Skills</h2>
              <ul className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 p-0 list-none text-[11px] text-black items-start">
                {skillsList.map((s, i) => {
                  const label = typeof s === "string" ? s : s?.label ?? "";
                  if (!label) return null;
                  return (
                    <li
                      key={i}
                      className="flex gap-2 leading-snug min-w-0 [print-color-adjust:exact]"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-600"
                        aria-hidden
                      />
                      <span className="min-w-0 wrap-break-word hyphens-auto">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Right column (wider): Education, Experience, Projects, Languages */}
        <div className="w-full md:w-[62%] print:w-[62%] min-h-0 flex flex-col px-4 sm:px-5 py-4">
          {hasEducation && (
            <section className="resume-section-avoid-break mb-5">
              <h2 className={SECTION_HEAD}>Education</h2>
              <div className="space-y-3">
                {educationParsed ? (
                  <div className="space-y-0.5">
                    {educationParsed.degree && <p className="text-[11px] font-bold text-black">{educationParsed.degree}</p>}
                    {educationParsed.institution && <p className={`text-[11px] ${ACCENT}`}>{educationParsed.institution}</p>}
                    {educationParsed.dates && <p className={TEXT_MUTED}>{educationParsed.dates}</p>}
                  </div>
                ) : (
                  <p className="text-[11px] text-black whitespace-pre-wrap">{data.education?.trim()}</p>
                )}
              </div>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section className="resume-section-avoid-break mb-5">
              <h2 className={SECTION_HEAD}>Experience</h2>
              <div className="space-y-4">
                {experienceEntries.map((entry, i) => (
                  <div key={i}>
                    <p className="text-[11px] font-bold text-black leading-snug">{entry.jobTitle || "Role"}</p>
                    {entry.company && <p className={`text-[11px] ${ACCENT} leading-snug`}>{entry.company}</p>}
                    {entry.datesOrLocation && <p className={`${TEXT_MUTED} mt-0.5`}>{entry.datesOrLocation}</p>}
                    {entry.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-none pl-0 text-[11px] text-black">
                        {entry.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2 leading-snug">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" aria-hidden />
                            <span>{typeof b === "string" ? b : String(b)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectsList.length > 0 && (
            <section className="resume-section-avoid-break">
              <h2 className={SECTION_HEAD}>Projects</h2>
              <div className="space-y-2">
                {projectsList.slice(0, 5).map((item, i) => {
                  const p = parseProjectForResume(item);
                  if (!p.title && !p.description && !p.link) return null;
                  return (
                    <div key={i} className="flex gap-2">
                      <FolderOpen size={14} className={`shrink-0 mt-0.5 ${ACCENT}`} />
                      <div className="min-w-0">
                        {p.title && <p className="text-[11px] font-bold text-black leading-snug">{p.title}</p>}
                        {p.link && (
                          <p className="text-[10px] mt-0.5">
                            <ResumeProjectLink url={p.link} className="text-blue-700 underline print:text-black" />
                          </p>
                        )}
                        {p.description && (
                          <p className="text-[10px] text-neutral-600 leading-snug mt-0.5 whitespace-pre-wrap">{p.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {languageList.length > 0 && (
            <section className="resume-section-avoid-break pt-2">
              <h2 className={SECTION_HEAD}>Languages</h2>
              <ul className="text-[11px] text-black list-none pl-0 space-y-0.5">
                {languageList.map((line, i) => (
                  <li key={i} className="flex gap-2 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" aria-hidden />
                    <span>{line}</span>
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
