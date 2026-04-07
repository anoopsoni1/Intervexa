import { Mail, MapPin, Phone, Linkedin, Github } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased";

const TEXT_INK = "text-[#0f172a]";
const TEXT_BODY = "text-[#334155]";
const TEXT_MUTED = "text-[#64748b]";
const ACCENT = "#1e4976";
const RULE = "bg-[#1e4976]";

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

function cleanLink(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function getSkillItems(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((skill) => (typeof skill === "string" ? skill : skill?.label || ""))
    .map((skill) => skill.trim())
    .filter(Boolean);
}

/** Section with accent rule — no card borders */
function SectionBlock({ title, children, className = "" }) {
  return (
    <section className={`resume-section-avoid-break ${className}`}>
      <h2
        className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] ${TEXT_INK} mb-2`}
        style={{ color: ACCENT }}
      >
        {title}
      </h2>
      <div className={`h-[2px] w-12 rounded-sm mb-2.5 ${RULE}`} aria-hidden />
      {children}
    </section>
  );
}

export default function Resume7Layout({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "").trim();
  const summary = (data?.summary || "").trim();
  const philosophy = (data?.lifePhilosophy || data?.tagline || "").trim();

  const phone = (data?.phone || "").trim();
  const email = (data?.email || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");
  const github = cleanLink(data?.github || "");

  const experience = (Array.isArray(data?.experience) ? data.experience : [])
    .filter(Boolean)
    .map(parseExperienceEntry)
    .filter((item) => item.title || item.company || item.dateLine || item.bullets.length > 0);

  const educationList = parseEducationList(data?.education);
  const skillItems = getSkillItems(data?.skills);
  const projects = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((p) => p.title || p.description || p.link);
  const achievements = limitAchievements(data?.achievements);
  const languageLines = parseLanguageProficiencyList(data?.languageProficiency);

  return (
    <article
      className={`${DOCUMENT_CLASS} max-w-4xl px-0 pt-0 pb-5 sm:pb-6 print:pb-5 overflow-hidden print:overflow-visible bg-white print:bg-white`}
    >
      <header className="resume-section-avoid-break flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 mb-0 rounded-t-none sm:rounded-t-lg bg-[#122b45] text-white print:bg-[#122b45] border-b border-[#0d2135] [print-color-adjust:exact] px-5 sm:px-7 pt-5 sm:pt-6 pb-5 sm:pb-5 print:px-6 print:pt-5 print:pb-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-white leading-[1.1]">
            {name}
          </h1>
          {role && <p className="mt-1.5 text-[11px] sm:text-[12px] font-medium text-white/85">{role}</p>}
        </div>

        {(phone || email || location || linkedin || github) && (
          <div className="flex w-full min-w-0 shrink-0 flex-col items-end gap-2.5 text-[10px] sm:text-[11px] text-white/90 sm:max-w-[min(100%,20rem)] print:max-w-76">
            {phone && (
              <a
                href={resumeTelHref(phone)}
                className="inline-flex max-w-full items-center justify-end gap-1.5 text-right text-inherit hover:underline"
              >
                <Phone size={12} className="shrink-0 text-white/55" strokeWidth={2} />
                <span className="tabular-nums">{phone}</span>
              </a>
            )}
            {email && (
              <a
                href={resumeMailtoHref(email)}
                className="inline-flex max-w-full items-center justify-end gap-1.5 break-all text-right text-inherit hover:underline"
              >
                <Mail size={12} className="shrink-0 text-white/55" strokeWidth={2} />
                {email}
              </a>
            )}
            {location && (
              <span className="inline-flex max-w-full items-start justify-end gap-1.5 text-right leading-snug">
                <MapPin size={12} className="mt-0.5 shrink-0 text-white/55" strokeWidth={2} />
                {location}
              </span>
            )}
            {linkedin && (
              <a
                href={resumeExternalHref(linkedin)}
                className="inline-flex max-w-full items-center justify-end gap-1.5 break-all text-right text-inherit hover:underline"
                {...resumeHttpNewTabProps(resumeExternalHref(linkedin))}
              >
                <Linkedin size={12} className="shrink-0 text-white/55" strokeWidth={2} />
                {linkedin}
              </a>
            )}
            {github && (
              <a
                href={resumeExternalHref(github)}
                className="inline-flex max-w-full items-center justify-end gap-1.5 break-all text-right text-inherit hover:underline"
                {...resumeHttpNewTabProps(resumeExternalHref(github))}
              >
                <Github size={12} className="shrink-0 text-white/55" strokeWidth={2} />
                {github}
              </a>
            )}
          </div>
        )}
      </header>

      {/* Left sidebar: Summary, Education, Achievements, Skills — Main: Experience, Projects */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)] print:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)] gap-0">
        <aside className="min-w-0 space-y-5 bg-[#f5f7fa] px-5 sm:px-6 py-5 sm:py-6 print:px-5 print:py-5 print:bg-[#f5f7fa] border-b md:border-b-0 md:border-r md:border-slate-200/90">
          {summary && (
            <SectionBlock title="Summary">
              <p className={`text-[10px] sm:text-[11px] leading-[1.65] ${TEXT_BODY}`}>{summary}</p>
            </SectionBlock>
          )}

          {educationList.length > 0 && (
            <SectionBlock title="Education">
              <div className="space-y-3">
                {educationList.map((edu, index) => (
                  <div key={index} className="resume-section-avoid-break">
                    <p className={`text-[11px] sm:text-xs font-bold ${TEXT_INK}`}>{edu.degree || "Degree"}</p>
                    {edu.school && (
                      <p className={`text-[10px] sm:text-[11px] mt-0.5`} style={{ color: ACCENT }}>
                        {edu.school}
                      </p>
                    )}
                    {edu.dateLine && <p className={`${TEXT_MUTED} text-[10px] mt-1`}>{edu.dateLine}</p>}
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {achievements.length > 0 && (
            <SectionBlock title="Achievements">
              <ul className="m-0 space-y-0 list-none pl-0 text-[10px] sm:text-[11px] text-[#1e3a5f]">
                {achievements.map((a, idx) => (
                  <li key={idx} className="flex gap-2 leading-relaxed">
                    <span className="mt-1 h-1 w-1 rounded-full bg-slate-400" aria-hidden />
                    <span className="min-w-0">{a}</span>
                  </li>
                ))}
              </ul>
            </SectionBlock>
          )}

          {skillItems.length > 0 && (
            <SectionBlock title="Skills">
              <div className="rounded-lg border border-[#1e4976]/20 bg-white/95 px-2.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-900/4 print:bg-white [print-color-adjust:exact]">
                <ul className="m-0 grid grid-cols-2 gap-x-3 gap-y-2 list-none p-0 items-start">
                  {skillItems.slice(0, 18).map((skill, index) => (
                    <li key={index} className="flex min-w-0 items-start gap-2 leading-snug">
                      <span
                        className="mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full shadow-[0_0_0_1px_rgba(30,73,118,0.25)]"
                        style={{ backgroundColor: ACCENT }}
                        aria-hidden
                      />
                      <span className="min-w-0 wrap-break-word text-[10px] sm:text-[11px] font-semibold text-[#0f172a] tracking-[-0.01em]">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionBlock>
          )}

          {philosophy && (
            <SectionBlock title="My Life Philosophy">
              <p className={`text-[10px] sm:text-[11px] italic leading-relaxed ${TEXT_MUTED}`}>{philosophy}</p>
            </SectionBlock>
          )}
        </aside>

        <div className="min-w-0 space-y-1.5 px-5 sm:px-7 py-5 sm:py-6 print:px-6 print:py-5">
          {experience.length > 0 && (
            <SectionBlock title="Experience">
              <div className="space-y-1">
                {experience.map((item, index) => (
                  <div
                    key={index}
                    className={`resume-section-avoid-break ${
                      index < experience.length - 1 ? "border-b border-dotted border-slate-300/90 py-1" : ""
                    }`}
                  >
                    <p className={`text-[11px] sm:text-[11px] font-bold ${TEXT_INK} leading-snug`}>{item.title || "Role"}</p>
                    {item.company && (
                      <p className={`text-[10px] sm:text-[11px] font-semibold mt-0.5`} style={{ color: ACCENT }}>
                        {item.company}
                      </p>
                    )}
                    {item.dateLine && <p className={`${TEXT_MUTED} text-[10px] mt-1`}>{item.dateLine}</p>}
                    {item.bullets.length > 0 && (
                      <ul className={`mt-2 space-y-1 pl-0 list-none ${TEXT_BODY} text-[10px] sm:text-[11px]`}>
                        {item.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="flex gap-2 leading-relaxed">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
                            <span className="min-w-0">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {projects.length > 0 && (
            <SectionBlock title="Projects" className={experience.length > 0 ? "pt-1" : ""}>
              <ul className={`space-y-2 pl-0 list-none   text-[10px] sm:text-[11px] m-0`}>
                {projects.map((project, index) => (
                  <li key={index} className="flex gap-2 leading-relaxed text-slate-900">
                    <div className="min-w-0">
                      {project.title ? <span className="font-semibold">{project.title}</span> : null}
                      {project.link ? (
                        <span className="block mt-0.5">
                          <ResumeProjectLink url={project.link} className="text-[#1e4976] underline print:text-black font-normal text-[10px]" />
                        </span>
                      ) : null}
                      {project.description ? (
                        <span className="block mt-0.5 whitespace-pre-wrap font-normal text-slate-800">{project.description}</span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </SectionBlock>
          )}

          {languageLines.length > 0 && (
            <SectionBlock title="Languages">
              <ul className={`space-y-1 pl-0 list-none ${TEXT_BODY} text-[10px] sm:text-[11px] m-0`}>
                {languageLines.map((line, index) => (
                  <li key={index} className="flex gap-2 leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
                    <span className="min-w-0">{line}</span>
                  </li>
                ))}
              </ul>
            </SectionBlock>
          )}
        </div>
      </div>
    </article>
  );
}
