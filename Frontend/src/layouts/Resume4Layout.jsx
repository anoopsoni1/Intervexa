import { Phone, Mail, MapPin, Linkedin, Github, FolderOpen } from "lucide-react";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

const TEXT_DARK = "text-[#333]";
const SECTION_HEAD =
  "text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#333] pb-1 mb-2 border-b-2 border-orange-500";

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

function splitDatesAndLocation(str) {
  if (!str || !String(str).trim()) return { dates: "", location: "" };
  const s = String(str).trim();
  const pipe = s.indexOf("|");
  if (pipe >= 0) {
    return { dates: s.slice(0, pipe).trim(), location: s.slice(pipe + 1).trim() };
  }
  return { dates: s, location: "" };
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

/**
 * Resume 4: Left — Summary, Achievements, Skills; right — Education, Experience, Projects, Languages, Courses, Passions.
 */
export default function Resume4Layout({ data }) {
  const name = (data?.name || "Your Name").toUpperCase();
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projectsList = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const educationParsed = parseEducation(data?.education);
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntryDetailed(e));
  const courses = data?.courses != null ? String(data.courses).trim() : "";
  const passions = data?.passions != null ? String(data.passions).trim() : "";
  const achievementsList = limitAchievements(data?.achievements);
  const languageList = parseLanguageProficiencyList(data?.languageProficiency);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-visible bg-white print:bg-white`}>
      <header className="w-full flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-2 sm:gap-4 px-4 sm:px-6 pt-0 pb-4 border-b border-zinc-200">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className={`text-2xl sm:text-3xl font-bold ${TEXT_DARK} tracking-tight`}>{name}</h1>
          <p className={`text-sm font-normal ${TEXT_DARK}`}>{role}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-[#333] text-right min-w-0 w-full sm:w-auto sm:max-w-[55%]">
          {data?.phone && (
            <span className="inline-flex items-center gap-1.5 justify-end max-w-full">
              <Phone size={14} className="shrink-0 text-orange-500" /> {data.phone}
            </span>
          )}
          {(data?.location || data?.address) && (
            <span className="inline-flex items-center gap-1.5 justify-end max-w-full">
              <MapPin size={14} className="shrink-0 text-orange-500" /> {data.location || data.address}
            </span>
          )}
          {data?.email && (
            <span className="inline-flex items-center gap-1.5 justify-end max-w-full break-all">
              <Mail size={14} className="shrink-0 text-orange-500" /> {data.email}
            </span>
          )}
          {(data?.linkedin || data?.website) && (
            <span className="inline-flex items-center gap-1.5 justify-end max-w-full break-all">
              <Linkedin size={14} className="shrink-0 text-orange-500" />{" "}
              {data.linkedin ? data.linkedin.replace(/^https?:\/\//i, "") : (data.website || "").replace(/^https?:\/\//i, "")}
            </span>
          )}
          {data?.github && (
            <span className="inline-flex items-center gap-1.5 justify-end max-w-full break-all">
              <Github size={14} className="shrink-0 text-orange-500" />{" "}
              {String(data.github).replace(/^https?:\/\//i, "")}
            </span>
          )}
        </div>
      </header>

      <div className="w-full flex flex-col md:flex-row print:flex-row flex-1 min-h-0">
        {/* Left: Summary, Achievements, Skills */}
        <div className="w-full md:w-[40%] print:w-[40%] min-h-0 flex flex-col px-4 sm:px-6 py-5 border-b md:border-b-0 md:border-r border-zinc-200">
          {summary && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Professional Summary</h2>
              <p className={`text-xs ${TEXT_DARK} leading-relaxed`}>{summary}</p>
            </section>
          )}

          {achievementsList.length > 0 && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Achievements</h2>
              <ul className="mt-2 space-y-0 list-none pl-0 text-xs text-[#333]">
                {achievementsList.map((a, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0 mt-2" aria-hidden />
                    <span className="min-w-0">{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skillsList.length > 0 && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Skills</h2>
              <ul className="m-0 grid grid-cols-2 gap-x-3 gap-y-1.5 list-none p-0 text-xs text-[#333] items-start">
                {skillsList.map((s, i) => {
                  const label = typeof s === "string" ? s : s?.label ?? "";
                  if (!label) return null;
                  return (
                    <li key={i} className="flex gap-2 min-w-0 leading-snug">
                      <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0 mt-1.5" aria-hidden />
                      <span className="min-w-0 wrap-break-word">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Right: Education, Experience, Projects, Courses, Passions */}
        <div className="w-full md:w-[60%] print:w-[60%] min-h-0 flex flex-col px-4 sm:px-5 py-5 bg-white">
          {(data?.education || educationParsed) && (
            <section className="mb-5 resume-section-avoid-break">
              <h2 className={SECTION_HEAD}>Education</h2>
              <div className="space-y-3">
                {educationParsed ? (
                  <div>
                    <p className={`text-xs font-bold ${TEXT_DARK}`}>{educationParsed.degree || "Degree"}</p>
                    {educationParsed.institution && (
                      <p className={`text-xs font-normal ${TEXT_DARK} underline decoration-[#333] decoration-1`}>
                        {educationParsed.institution}
                      </p>
                    )}
                    {educationParsed.dates && (() => {
                      const { dates: edDates, location: edLoc } = splitDatesAndLocation(educationParsed.dates);
                      return (
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs">
                          {edDates && <span className="text-orange-500">{edDates}</span>}
                          {edLoc && (
                            <span className={`flex items-center gap-1 ${TEXT_DARK}`}>
                              <MapPin size={12} className="shrink-0" /> {edLoc}
                            </span>
                          )}
                          {!edDates && !edLoc && (
                            <span className="text-orange-500">{educationParsed.dates}</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className={`text-xs ${TEXT_DARK} whitespace-pre-wrap`}>{data.education}</p>
                )}
              </div>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Experience</h2>
              <div className="space-y-1">
                {experienceEntries.map((entry, i) => {
                  const { dates, location } = splitDatesAndLocation(entry.datesOrLocation);
                  return (
                    <div key={i}>
                      <p className={`text-xs font-bold ${TEXT_DARK}`}>{entry.jobTitle || "Role"}</p>
                      {entry.company && (
                        <p className={`text-xs font-normal ${TEXT_DARK} underline decoration-[#333] decoration-1`}>
                          {entry.company}
                        </p>
                      )}
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs">
                        {dates && <span className="text-orange-500">{dates}</span>}
                        {location && (
                          <span className={`flex items-center gap-1 ${TEXT_DARK}`}>
                            <MapPin size={12} className="shrink-0" /> {location}
                          </span>
                        )}
                        {!dates && !location && entry.datesOrLocation && (
                          <span className={TEXT_DARK}>{entry.datesOrLocation}</span>
                        )}
                      </div>
                      {entry.bullets.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5 list-disc list-inside pl-0 text-xs text-[#333] ml-0.5">
                          {entry.bullets.map((b, j) => (
                            <li key={j} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {projectsList.length > 0 && (
            <section className="mb-5">
              <h2 className={`flex items-center gap-2 ${SECTION_HEAD}`}>
                <FolderOpen size={14} className="shrink-0 text-orange-500" /> Projects
              </h2>
              <div className="space-y-3">
                {projectsList.map((project, i) => (
                  <div key={i}>
                    <p className={`text-xs font-bold ${TEXT_DARK}`}>
                      {typeof project === "string" ? project : project?.title || project?.description || "Achievement"}
                    </p>
                    {(typeof project === "object" ? project?.description : null) && (
                      <p className={`text-xs ${TEXT_DARK} mt-0.5 leading-relaxed`}>{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {languageList.length > 0 && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Languages</h2>
              <ul className="mt-2 space-y-0 list-none pl-0 text-xs text-[#333]">
                {languageList.map((line, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0 mt-2" aria-hidden />
                    <span className="min-w-0">{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {courses && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Courses</h2>
              <p className={`text-xs ${TEXT_DARK} leading-relaxed whitespace-pre-wrap`}>{courses}</p>
            </section>
          )}

          {passions && (
            <section className="mb-5">
              <h2 className={SECTION_HEAD}>Passions</h2>
              <p className={`text-xs ${TEXT_DARK} leading-relaxed whitespace-pre-wrap`}>{passions}</p>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
