import { Phone, Mail, MapPin, Globe, Linkedin, Github, Briefcase, GraduationCap, Sparkles, FolderOpen, Award } from "lucide-react";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

function parseExperienceEntry(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    title: lines[0] || "",
    company: lines[1] || "",
    meta: lines[2] || "",
    bullets: lines.slice(3),
  };
}

function parseEducationEntries(education) {
  if (!education || !String(education).trim()) return [];
  const blocks = String(education).split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    return {
      degree: lines[0] || "",
      institution: lines[1] || "",
      meta: lines[2] || "",
      extra: lines.slice(3),
    };
  });
}

function toList(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((item) => (typeof item === "string" ? item : item?.label || item?.title || item?.description || ""))
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanUrl(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <h2 className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#0f172a] border-b border-slate-300 pb-1.5 mb-2.5">
      <Icon size={12} className="text-[#1d4ed8] shrink-0" />
      {title}
    </h2>
  );
}

export default function Resume6Layout({ data }) {
  const name = String(data?.name || "Your Name").toUpperCase();
  const role = String(data?.role || "Your Role").trim();
  const summary = String(data?.summary || "").trim();

  const phone = String(data?.phone || "").trim();
  const email = String(data?.email || "").trim();
  const location = String(data?.location || data?.address || "").trim();
  const website = cleanUrl(data?.website);
  const linkedin = cleanUrl(data?.linkedin);
  const github = cleanUrl(data?.github);

  const experiences = toList(data?.experience).map(parseExperienceEntry);
  const educationEntries = parseEducationEntries(data?.education);
  const skills = toList(data?.skills);
  const projects = toList(data?.projects);
  const certifications = toList(data?.certifications);
  const languages = parseLanguageProficiencyList(data?.languageProficiency);
  const achievements = limitAchievements(toList(data?.achievements));

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col overflow-hidden print:overflow-visible border border-slate-200 print:border-slate-300 bg-white`}>
      <header className="px-5 sm:px-7 pt-6 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 text-center sm:text-left">
            <h1 className="text-3xl sm:text-[34px] leading-none font-extrabold tracking-tight text-slate-900">{name}</h1>
            {role && <p className="mt-1.5 text-sm sm:text-[15px] text-slate-600 font-semibold">{role}</p>}
          </div>
          {(phone || email || location || website || linkedin || github) && (
            <div className="flex w-full min-w-0 flex-col items-center gap-1.5 text-[11px] sm:text-xs text-slate-700 sm:w-auto sm:max-w-[min(100%,20rem)] sm:items-end sm:text-right print:items-end print:text-right">
              {phone && (
                <span className="inline-flex items-center justify-center gap-1.5 sm:justify-end print:justify-end">
                  <Phone size={12} className="shrink-0 text-slate-500" />
                  <span className="tabular-nums">{phone}</span>
                </span>
              )}
              {email && (
                <span className="inline-flex max-w-full items-center justify-center gap-1.5 break-all sm:justify-end print:justify-end">
                  <Mail size={12} className="shrink-0 text-slate-500" />
                  {email}
                </span>
              )}
              {location && (
                <span className="inline-flex max-w-full items-start justify-center gap-1.5 text-left sm:justify-end sm:text-right print:justify-end">
                  <MapPin size={12} className="mt-0.5 shrink-0 text-slate-500" />
                  <span className="leading-snug">{location}</span>
                </span>
              )}
              {website && (
                <span className="inline-flex max-w-full items-center justify-center gap-1.5 break-all sm:justify-end print:justify-end">
                  <Globe size={12} className="shrink-0 text-slate-500" />
                  {website}
                </span>
              )}
              {linkedin && (
                <span className="inline-flex max-w-full items-center justify-center gap-1.5 break-all sm:justify-end print:justify-end">
                  <Linkedin size={12} className="shrink-0 text-slate-500" />
                  {linkedin}
                </span>
              )}
              {github && (
                <span className="inline-flex max-w-full items-center justify-center gap-1.5 break-all sm:justify-end print:justify-end">
                  <Github size={12} className="shrink-0 text-slate-500" />
                  {github}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row print:flex-row flex-1 min-h-0">
        {/* Left: Summary, Achievements, Skills, Certifications (contact in header) */}
        <aside className="w-full md:w-[34%] print:w-[34%] min-h-0 px-5 sm:px-6 py-5 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
          {summary && (
            <div className="mb-4">
              <SectionTitle icon={Sparkles} title="About Me" />
              <p className="text-[11px] text-slate-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {achievements.length > 0 && (
            <div className="mb-4">
              <SectionTitle icon={Award} title="Achievements" />
              <ul className="space-y-0 list-none pl-0 text-[11px] text-slate-700">
                {achievements.map((a, idx) => (
                  <li key={idx} className="flex gap-1.5 leading-snug">
                    <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0 mt-1.5" aria-hidden />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div className="mb-4">
              <SectionTitle icon={Sparkles} title="Skills" />
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-700">
                {skills.slice(0, 20).map((skill, idx) => (
                  <li key={idx} className="inline-flex items-start gap-1.5 min-w-0">
                    <span className="w-1 h-1 rounded-full bg-slate-500 shrink-0 mt-1.5" aria-hidden />
                    <span className="min-w-0 wrap-break-word">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="mb-4">
              <SectionTitle icon={Sparkles} title="Certifications" />
              <ul className="space-y-1 list-none pl-0 text-[11px] text-slate-700">
                {certifications.slice(0, 8).map((cert, idx) => (
                  <li key={idx} className="flex gap-1.5 leading-snug">
                    <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0 mt-1.5" aria-hidden />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </aside>

        {/* Right: Education, Work Experience, Projects, Languages */}
        <section className="w-full md:w-[66%] print:w-[66%] min-h-0 px-5 sm:px-7 py-5">
          {educationEntries.length > 0 && (
            <div className="mb-4 resume-section-avoid-break">
              <SectionTitle icon={GraduationCap} title="Education" />
              <div className="space-y-3">
                {educationEntries.map((ed, idx) => (
                  <div key={idx}>
                    {ed.degree && <p className="text-xs font-semibold text-slate-900">{ed.degree}</p>}
                    {ed.institution && <p className="text-xs text-slate-700">{ed.institution}</p>}
                    {ed.meta && <p className="text-[11px] text-slate-500">{ed.meta}</p>}
                    {ed.extra.length > 0 && (
                      <ul className="mt-1 space-y-0.5 list-none pl-0 text-[11px] text-slate-700">
                        {ed.extra.map((line, i) => (
                          <li key={i} className="leading-snug">{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {experiences.length > 0 && (
            <div className="mb-4">
              <SectionTitle icon={Briefcase} title="Work Experience" />
              <div className="space-y-2">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="resume-section-avoid-break">
                    {exp.title && <p className="text-[12px] font-bold text-slate-900">{exp.title}</p>}
                    {exp.company && <p className="text-[11px] text-slate-700">{exp.company}</p>}
                    {exp.meta && <p className="text-[11px] text-slate-500">{exp.meta}</p>}
                    {exp.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-none pl-0 text-[11px] text-slate-700">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i} className="flex gap-1.5 leading-snug">
                            <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" aria-hidden />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div className="mb-4">
              <SectionTitle icon={FolderOpen} title="Projects" />
              <ul className="space-y-1.5 list-none pl-0 text-[11px] text-slate-700">
                {projects.slice(0, 6).map((project, idx) => (
                  <li key={idx} className="flex gap-1.5 leading-snug">
                    <span className="w-1 h-1 rounded-full bg-blue-600 shrink-0 mt-1.5" aria-hidden />
                    <span className="whitespace-pre-wrap">{project}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <SectionTitle icon={Sparkles} title="Languages" />
              <ul className="space-y-1 list-none pl-0 text-[11px] text-slate-700">
                {languages.map((line, idx) => (
                  <li key={idx} className="flex gap-1.5 leading-snug">
                    <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
