import { MapPin, Phone, Mail, Linkedin, Github } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased";

function cleanLink(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function splitList(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item || "").split(/\n|,|;/))
      .map((line) => line.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,|;/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

function twoColumns(list) {
  if (list.length === 0) return [[], []];
  const mid = Math.ceil(list.length / 2);
  return [list.slice(0, mid), list.slice(mid)];
}

function parseEducation(education) {
  if (!education || !String(education).trim()) return [];
  return String(education)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      return {
        title: lines[0] || "",
        subtitle: lines[1] || "",
        dates: lines[2] || "",
        details: lines.slice(3),
      };
    });
}

function parseExperience(entry) {
  if (typeof entry === "object" && entry !== null) {
    return {
      role: String(entry.role || entry.jobTitle || entry.title || "").trim(),
      company: String(entry.company || "").trim(),
      dates: String(entry.dates || entry.dateLine || "").trim(),
      bullets: Array.isArray(entry.bullets)
        ? entry.bullets.map((b) => String(b || "").trim()).filter(Boolean)
        : [],
    };
  }
  const lines = String(entry || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    role: lines[0] || "",
    company: lines[1] || "",
    dates: lines[2] || "",
    bullets: lines.slice(3).map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim()).filter(Boolean),
  };
}

function monogramFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "YN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function SectionTitle({ children }) {
  return <h2 className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8b8b8b]">{children}</h2>;
}

function DotList({ items }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 space-y-1.5 list-none pl-0 text-[11px] leading-[1.6] text-[#585858]">
      {items.map((line, idx) => (
        <li key={`${line}-${idx}`} className="flex gap-1.5">
          <span className="mt-[6px] h-1 w-1 rounded-full bg-[#9d9d9d] shrink-0" />
          <span className="min-w-0 wrap-break-word">{line}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Resume12Layout({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "Professional Title").trim();
  const summary = (data?.summary || "").trim();

  const phone = (data?.phone || "").trim();
  const email = (data?.email || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");
  const github = cleanLink(data?.github || "");

  const educationItems = parseEducation(data?.education);
  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((job) => job.role || job.company || job.dates || job.bullets.length > 0);
  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((project) => project.title || project.description || project.link);
  const skillItems = splitList(data?.skills);
  const skillCols = twoColumns(skillItems);
  const achievementItems = limitAchievements(data?.achievements);
  const languageItems = parseLanguageProficiencyList(data?.languageProficiency);

  const contactItems = [
    location ? { icon: MapPin, value: location } : null,
    phone ? { icon: Phone, value: phone, href: resumeTelHref(phone) } : null,
    email ? { icon: Mail, value: email, href: resumeMailtoHref(email) } : null,
    linkedin ? { icon: Linkedin, value: linkedin, href: resumeExternalHref(linkedin) } : null,
    github ? { icon: Github, value: github, href: resumeExternalHref(github) } : null,
  ].filter(Boolean);

  const mono = monogramFromName(name);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl min-w-0 border border-[#e7e7e7] print:border-[#e7e7e7] text-[#2b2b2b]`}>
      <header className="relative overflow-hidden border-b border-[#e5e5e5] px-4 sm:px-6 md:px-8 pt-5 pb-4 sm:pt-6 print:px-6 print:pt-5 print:pb-4">
        <div className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rounded-full bg-[#ececec] max-md:opacity-60" />
        <div className="pointer-events-none absolute left-24 top-6 hidden h-24 w-40 -rotate-[8deg] rounded-3xl border border-[#e6e6e6] sm:block" />
        <div className="relative z-1 grid grid-cols-1 md:grid-cols-[132px_1fr] print:grid-cols-[132px_1fr] gap-4 md:gap-5 items-center text-center md:text-left">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border border-[#dedede] bg-[#f2f2f2] flex items-center justify-center text-[22px] sm:text-[26px] font-light tracking-[0.08em] text-[#777] shadow-inner mx-auto md:mx-0 shrink-0">
            {mono}
          </div>
          <div className="min-w-0">
            <h1 className="text-[26px] leading-[1.05] sm:text-[34px] md:text-[38px] lg:text-[44px] font-light tracking-[0.06em] sm:tracking-[0.08em] uppercase text-[#555] hyphens-auto">
              {name}
            </h1>
            <p className="mt-2 sm:mt-3 text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.28em] text-[#8b8b8b]">
              {role}
            </p>
            {contactItems.length > 0 && (
              <div className="mt-3 flex flex-col min-[380px]:flex-row min-[380px]:flex-wrap items-stretch min-[380px]:items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[11px] text-[#8a8a8a]">
                {contactItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <span key={`${item.value}-${idx}`} className="inline-flex items-center justify-center md:justify-start gap-1.5 min-w-0">
                      <Icon size={11} className="text-[#a0a0a0] shrink-0" />
                      {item.href ? (
                        <a
                          href={item.href}
                          className="min-w-0 wrap-break-word break-all text-inherit hover:underline"
                          {...resumeHttpNewTabProps(item.href)}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="min-w-0 wrap-break-word break-all">{item.value}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,33%)_1fr] print:grid-cols-[minmax(0,33%)_1fr]">
        <aside className="min-w-0 px-4 sm:px-6 md:px-7 py-5 sm:py-6 print:px-6 print:py-5 border-b border-[#ececec] md:border-b-0 md:border-r md:border-[#ececec] bg-[#f7f7f7] [print-color-adjust:exact] space-y-5 sm:space-y-6">
          {educationItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionTitle>Education</SectionTitle>
              <div className="mt-3 space-y-2">
                {educationItems.map((edu, idx) => (
                  <div key={idx} className="text-[11px] leading-normal text-[#6a6a6a]">
                    {edu.title && <p className="font-semibold uppercase text-[#454545] tracking-[0.08em]">{edu.title}</p>}
                    {edu.subtitle && <p className="mt-0.5">{edu.subtitle}</p>}
                    {edu.dates && <p className="mt-0.5 text-[#8e8e8e]">{edu.dates}</p>}
                    <DotList items={edu.details} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {skillItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionTitle>Skills</SectionTitle>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 sm:gap-y-0 text-[11px] text-[#585858] print:grid-cols-2">
                <ul className="space-y-1 list-none pl-0 m-0 min-w-0">
                  {skillCols[0].map((skill, idx) => (
                    <li key={`skill-l-${skill}-${idx}`} className="flex gap-1.5">
                      <span className="mt-[6px] h-1 w-1 rounded-full bg-[#9d9d9d] shrink-0" />
                      <span className="min-w-0 wrap-break-word">{skill}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1.5 list-none pl-0 m-0 min-w-0">
                  {skillCols[1].map((skill, idx) => (
                    <li key={`skill-r-${skill}-${idx}`} className="flex gap-1.5">
                      <span className="mt-[6px] h-1 w-1 rounded-full bg-[#9d9d9d] shrink-0" />
                      <span className="min-w-0 wrap-break-word">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {achievementItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionTitle>Achievements</SectionTitle>
              <DotList items={achievementItems} />
            </section>
          )}

          {languageItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionTitle>Languages</SectionTitle>
              <DotList items={languageItems} />
            </section>
          )}
        </aside>

        <div className="min-w-0 px-4 sm:px-6 md:px-8 py-5 sm:py-6 print:px-6 print:py-5 bg-white">
          <section className="resume-section-avoid-break">
            <SectionTitle> Summary</SectionTitle>
            <p className="mt-1 text-[11px] leading-[1.7] text-[#656565] whitespace-pre-wrap wrap-break-word">
              {summary || "Write a concise summary highlighting your strengths, impact, and core expertise."}
            </p>
          </section>

          {experienceItems.length > 0 && (
            <section className="mt-6">
              <SectionTitle>Work Experience</SectionTitle>
              <div className="mt-3 space-y-1">
                {experienceItems.map((job, idx) => (
                  <article key={idx} className="resume-section-avoid-break">
                    <div className="flex items-start justify-between gap-x-3 gap-y-0.5 flex-wrap">
                      <div className="min-w-0 flex-1">
                        {job.role && (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#444]">
                            {job.role}
                          </p>
                        )}
                        {(job.company || job.dates) && (
                          <p className="mt-0.5 text-[11px] text-[#7d7d7d]">
                            {job.company}
                            {job.company && job.dates ? " | " : ""}
                            {job.dates}
                          </p>
                        )}
                      </div>
                    </div>
                    <DotList items={job.bullets} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {projectItems.length > 0 && (
            <section className={experienceItems.length > 0 ? "mt-6" : "mt-6"}>
              <SectionTitle>Projects</SectionTitle>
              <div className="mt-3 space-y-2">
                {projectItems.map((project, idx) => (
                  <article key={idx} className="resume-section-avoid-break">
                    {project.title && (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#444]">
                        {project.title}
                      </p>
                    )}
                    {project.link && (
                      <p className="mt-0.5 text-[10px]">
                        <ResumeProjectLink url={project.link} className="text-[#2563eb] underline print:text-black" />
                      </p>
                    )}
                    {project.description && (
                      <p className="mt-1 text-[11px] leading-[1.6] text-[#666] whitespace-pre-wrap">
                        {project.description}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
