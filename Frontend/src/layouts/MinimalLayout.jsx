import { Phone, Mail, MapPin, ExternalLink, FolderOpen, Award } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

function parseExperienceEntryDetailed(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    jobTitle: lines[0] || "",
    company: lines[1] || "",
    datesOrLocation: lines[2] || "",
    bullets: lines.slice(3),
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

/** Minimal: gray only, clean lines, lots of whitespace, ATS-friendly. */
const ACCENT = "text-gray-800";
const SECTION_HEAD = "text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-gray-500 pb-1 mb-2 border-b border-gray-200";

export default function MinimalLayout({ data }) {
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projectsList = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const educationParsed = parseEducation(data?.education);
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntryDetailed(e));
  const achievementsList = limitAchievements(data?.achievements);
  const languageList = parseLanguageProficiencyList(data?.languageProficiency);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-visible bg-white print:bg-white border border-gray-100 print:border-gray-200`}>
      <div className="w-full flex flex-row flex-wrap items-start justify-between gap-6 px-6 sm:px-8 pt-8 pb-6 border-b border-gray-100">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-semibold ${ACCENT} tracking-tight`}>{name}</h1>
          <p className="text-sm text-gray-500 mt-1">{role}</p>
        </div>
        <div className="space-y-2 text-xs text-gray-600 text-right">
          {data?.phone && (
            <a
              href={resumeTelHref(data.phone)}
              className="flex items-center gap-2 justify-end text-inherit hover:underline"
            >
              <Phone size={12} className="shrink-0 text-gray-400" /> {data.phone}
            </a>
          )}
          {data?.email && (
            <a
              href={resumeMailtoHref(data.email)}
              className="flex items-center gap-2 break-all justify-end text-inherit hover:underline"
            >
              <Mail size={12} className="shrink-0 text-gray-400" /> {data.email}
            </a>
          )}
          {(data?.location || data?.address) && (
            <p className="flex items-center gap-2 justify-end">
              <MapPin size={12} className="shrink-0 text-gray-400" /> {data.location || data.address}
            </p>
          )}
          {data?.linkedin && (
            <a
              href={resumeExternalHref(data.linkedin)}
              className="flex items-center gap-2 break-all justify-end text-inherit hover:underline"
              {...resumeHttpNewTabProps(resumeExternalHref(data.linkedin))}
            >
              <ExternalLink size={12} className="shrink-0 text-gray-400" />{" "}
              {(data.linkedin && data.linkedin.replace(/^https?:\/\//i, "")) || ""}
            </a>
          )}
          {data?.github && (
            <a
              href={resumeExternalHref(data.github)}
              className={`flex items-center gap-2 break-all justify-end text-inherit hover:underline${data?.linkedin ? " mt-1" : ""}`}
              {...resumeHttpNewTabProps(resumeExternalHref(data.github))}
            >
              <ExternalLink size={12} className="shrink-0 text-gray-400" /> {String(data.github).replace(/^https?:\/\//i, "")}
            </a>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row print:flex-row flex-1 min-h-0">
        <div className="w-full md:w-[36%] print:w-[36%] min-h-0 flex flex-col px-6 sm:px-8 py-6 border-b md:border-b-0 md:border-r border-gray-100">
          {summary && (
            <section className="mb-6">
              <h2 className={SECTION_HEAD}>About</h2>
              <p className="text-xs text-gray-600 leading-relaxed">{summary}</p>
            </section>
          )}

          {achievementsList.length > 0 && (
            <section className="resume-section-avoid-break mb-6">
              <h2 className={`flex items-center gap-2 ${SECTION_HEAD}`}>
                <Award size={12} className="shrink-0 text-gray-400" /> Achievements
              </h2>
              <ul className="space-y-1.5 text-xs text-gray-600 list-none pl-0">
                {achievementsList.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-400 shrink-0 mt-2" aria-hidden />
                    <span>{typeof a === "string" ? a : a?.title ?? a?.label ?? ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skillsList.length > 0 && (
            <section className="resume-section-avoid-break">
              <h2 className={SECTION_HEAD}>Skills</h2>
              <ul className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600 list-none p-0 items-start">
                {skillsList.map((s, i) => {
                  const label = typeof s === "string" ? s : s?.label ?? "";
                  if (!label) return null;
                  return (
                    <li key={i} className="flex items-start gap-2 min-w-0">
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-400 shrink-0 mt-2" aria-hidden />
                      <span className="min-w-0 wrap-break-word">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <div className="w-full md:w-[64%] print:w-[64%] min-h-0 flex flex-col px-6 sm:px-8 py-6">
          {(data?.education?.trim() || educationParsed) && (
            <section className="resume-section-avoid-break mb-6">
              <h2 className={SECTION_HEAD}>Education</h2>
              <div className="space-y-2">
                {educationParsed ? (
                  <div className="space-y-0.5">
                    {educationParsed.degree && <p className="text-xs text-gray-800 font-medium">{educationParsed.degree}</p>}
                    {educationParsed.institution && <p className="text-xs text-gray-600">{educationParsed.institution}</p>}
                    {educationParsed.dates && <p className="text-[10px] text-gray-400">{educationParsed.dates}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{data.education?.trim()}</p>
                )}
              </div>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section className="mb-6">
              <h2 className={SECTION_HEAD}>Experience</h2>
              <div className="space-y-4">
                {experienceEntries.map((entry, i) => (
                  <div key={i}>
                    <p className={`text-[11px] font-semibold ${ACCENT} leading-snug`}>{entry.jobTitle || "Role"}</p>
                    {entry.company && <p className="text-[11px] text-gray-600 leading-snug">{entry.company}</p>}
                    {entry.datesOrLocation && <p className="text-[10px] text-gray-400 mt-0.5">{entry.datesOrLocation}</p>}
                    {entry.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-none pl-0 text-[11px] text-gray-600">
                        {entry.bullets.map((b, j) => (
                          <li key={j} className="leading-snug">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectsList.length > 0 && (
            <section className="mb-4">
              <h2 className={`flex items-center gap-2 ${SECTION_HEAD}`}>
                <FolderOpen size={12} className="shrink-0 text-gray-400" /> Projects
              </h2>
              <ul className="space-y-2 list-none pl-0">
                {projectsList.map((project, i) => {
                  const p = parseProjectForResume(project);
                  if (!p.title && !p.description && !p.link) return null;
                  return (
                    <li key={i} className="text-[11px] text-gray-600 leading-snug">
                      <div className="min-w-0">
                        {p.title ? <span className="font-semibold text-gray-800">{p.title}</span> : null}
                        {p.link ? (
                          <span className="block mt-0.5">
                            <ResumeProjectLink url={p.link} className="text-blue-700 underline print:text-black font-normal" />
                          </span>
                        ) : null}
                        {p.description ? (
                          <span className="block mt-0.5 whitespace-pre-wrap font-normal">{p.description}</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {languageList.length > 0 && (
            <section className="mb-4">
              <h2 className={SECTION_HEAD}>Languages</h2>
              <ul className="space-y-1 list-none pl-0">
                {languageList.map((line, i) => (
                  <li key={i} className="text-[11px] text-gray-600 leading-snug flex gap-2">
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-400 shrink-0 mt-2" aria-hidden />
                    {line}
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
