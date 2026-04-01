import { MapPin, Phone, Mail, Globe, Linkedin, Github } from "lucide-react";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased";

const ACCENT = "#b7897a";

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

function parseCertification(cert) {
  const lines = String(cert || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  return {
    title: lines[0] || "",
    subtitle: lines[1] || "",
    dates: lines[2] || "",
  };
}

function parseProject(project) {
  if (typeof project === "object" && project !== null) {
    const title = String(project.title || project.name || "").trim();
    const description = String(project.description || project.summary || project.details || "").trim();
    return { title, description };
  }
  const lines = String(project || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    description: lines.slice(1).join(" "),
  };
}

function LeftHeading({ children }) {
  return (
    <h2
      className="text-[11px] font-semibold uppercase tracking-[0.08em] pb-1 border-b border-[#d8d8d8]"
      style={{ color: ACCENT }}
    >
      {children}
    </h2>
  );
}

function RightHeading({ children }) {
  return (
    <h2
      className="text-[12px] font-semibold uppercase tracking-[0.08em] pb-1 border-b border-[#d8d8d8]"
      style={{ color: ACCENT }}
    >
      {children}
    </h2>
  );
}

export default function Resume11Layout({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "Professional Title").trim();
  const summary = (data?.summary || "").trim();

  const phone = (data?.phone || "").trim();
  const email = (data?.email || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const website = cleanLink(data?.website || "");
  const linkedin = cleanLink(data?.linkedin || "");
  const github = cleanLink(data?.github || "");

  const educationItems = parseEducation(data?.education);
  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((job) => job.role || job.company || job.dates || job.bullets.length > 0);
  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProject)
    .filter((project) => project.title || project.description);
  const skillItems = splitList(data?.skills);
  const skillCols = twoColumns(skillItems);
  const languageItems = parseLanguageProficiencyList(data?.languageProficiency);
  const certificationItems = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map(parseCertification)
    .filter(Boolean);

  const contactItems = [
    location ? { icon: MapPin, value: location } : null,
    phone ? { icon: Phone, value: phone } : null,
    email ? { icon: Mail, value: email } : null,
    website ? { icon: Globe, value: website } : null,
    linkedin ? { icon: Linkedin, value: linkedin } : null,
    github ? { icon: Github, value: github } : null,
  ].filter(Boolean);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl min-w-0 border border-[#e4e1de] print:border-[#e4e1de] text-[#1b1b1b]`}>
      <header className="px-4 sm:px-6 md:px-8 pt-5 pb-4 sm:pt-7 sm:pb-5 print:px-6 print:pt-6 print:pb-4 border-b border-[#e5e2df]">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,38%)_1fr] print:grid-cols-[minmax(0,38%)_1fr] gap-4 md:gap-5">
          <div className="min-w-0">
            <h1 className="text-[26px] leading-[1.05] sm:text-[32px] md:text-[42px] uppercase tracking-[0.04em] sm:tracking-[0.06em] font-light text-[#3a3a3a] hyphens-auto">
              {name}
            </h1>
            <p className="mt-3 sm:mt-4 text-[11px] sm:text-[12px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#7a7a7a]">
              {role}
            </p>
          </div>
          <div className="min-w-0">
            <RightHeading>Summary</RightHeading>
            <p className="mt-2 text-[10px] sm:text-[12px] leading-[1.55] sm:leading-[1.6] text-[#636363] whitespace-pre-wrap wrap-break-word">
              {summary || "Use this section to summarize your profile and key strengths."}
            </p>
          </div>
        </div>

        {contactItems.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-col min-[400px]:flex-row min-[400px]:flex-wrap items-stretch min-[400px]:items-center gap-x-3 gap-y-2 text-[11px] text-[#666]">
            {contactItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <span key={`${item.value}-${idx}`} className="inline-flex items-center gap-1.5 min-w-0">
                  <span
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#d7cec9]"
                    style={{ color: ACCENT }}
                  >
                    <Icon size={10} />
                  </span>
                  <span className="min-w-0 wrap-break-word break-all">{item.value}</span>
                </span>
              );
            })}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,34%)_1fr] print:grid-cols-[minmax(0,34%)_1fr]">
        <aside className="min-w-0 px-4 sm:px-6 md:px-7 py-5 sm:py-6 print:px-6 print:py-5 border-b border-[#ece8e5] md:border-b-0 md:border-r md:border-[#ece8e5] space-y-5 sm:space-y-6 bg-[#faf8f7] print:bg-[#faf8f7] [print-color-adjust:exact]">
          {educationItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <LeftHeading>Education</LeftHeading>
              <div className="mt-3 space-y-1">
                {educationItems.map((edu, idx) => (
                  <div key={idx} className="text-[10px] leading-normal text-[#666]">
                    {edu.title && <p className="font-semibold text-[#333]">{edu.title}</p>}
                    {edu.subtitle && <p className="mt-0.5">{edu.subtitle}</p>}
                    {edu.dates && <p className="mt-0.5 text-[#8a8a8a]">{edu.dates}</p>}
                    {edu.details.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-none pl-0">
                        {edu.details.map((line, detailIdx) => (
                          <li key={detailIdx} className="flex gap-1.5">
                            <span className="mt-[5px] h-1 w-1 rounded-full bg-[#c2b8b2] shrink-0" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {skillItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <LeftHeading>Competencies</LeftHeading>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 sm:gap-y-0 text-[11px] text-[#555] print:grid-cols-2">
                <ul className="space-y-1.5 list-none pl-0 m-0 min-w-0">
                  {skillCols[0].map((skill, idx) => (
                    <li key={`skill-l-${skill}-${idx}`} className="flex gap-1.5">
                      <span className="mt-[5px] h-1 w-1 rounded-full bg-[#c2b8b2] shrink-0" />
                      <span className="min-w-0 wrap-break-word">{skill}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1.5 list-none pl-0 m-0 min-w-0">
                  {skillCols[1].map((skill, idx) => (
                    <li key={`skill-r-${skill}-${idx}`} className="flex gap-1.5">
                      <span className="mt-[5px] h-1 w-1 rounded-full bg-[#c2b8b2] shrink-0" />
                      <span className="min-w-0 wrap-break-word">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {certificationItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <LeftHeading>Certifications</LeftHeading>
              <div className="mt-3 space-y-1 text-[10px] text-[#666]">
                {certificationItems.map((cert, idx) => (
                  <div key={idx}>
                    {cert.title && <p className="font-semibold text-[#333] uppercase">{cert.title}</p>}
                    {cert.subtitle && <p className="mt-0.5">{cert.subtitle}</p>}
                    {cert.dates && <p className="mt-0.5 text-[#8a8a8a]">{cert.dates}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {languageItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <LeftHeading>Languages</LeftHeading>
              <ul className="mt-3 space-y-1.5 list-none pl-0 text-[11px] text-[#555]">
                {languageItems.map((line, idx) => (
                  <li key={idx} className="flex gap-1.5">
                    <span className="mt-[5px] h-1 w-1 rounded-full bg-[#c2b8b2] shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <div className="min-w-0 px-4 sm:px-6 md:px-8 py-5 sm:py-6 print:px-6 print:py-5 bg-white">
          {experienceItems.length > 0 && (
            <section>
              <RightHeading> Experience</RightHeading>
              <div className="mt-3 space-y-2">
                {experienceItems.map((job, idx) => (
                  <article key={idx} className="resume-section-avoid-break">
                    <div className="flex items-start justify-between gap-x-3  flex-wrap">
                      <div className="min-w-0 flex-1">
                        {job.role && (
                          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#373737]">
                            {job.role}
                          </p>
                        )}
                        {job.company && <p className="mt-0.5 text-[10px] text-[#6a6a6a]">{job.company}</p>}
                      </div>
                      {job.dates && (
                        <p className="text-[10px] text-[#888] shrink-0 tabular-nums">
                          {job.dates}
                        </p>
                      )}
                    </div>
                    {job.bullets.length > 0 && (
                      <ul className="mt-2 space-y-1 list-none pl-0 text-[11px] leading-[1.45] text-[#666]">
                        {job.bullets.map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex gap-1.5">
                            <span className="mt-[5px] h-1 w-1 rounded-full bg-[#c2b8b2] shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {projectItems.length > 0 && (
            <section className={experienceItems.length > 0 ? "mt-6" : ""}>
              <RightHeading>Projects</RightHeading>
              <div className="mt-3 space-y-1">
                {projectItems.map((project, idx) => (
                  <article key={idx} className="resume-section-avoid-break">
                    {project.title && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#373737]">
                        {project.title}
                      </p>
                    )}
                    {project.description && (
                      <p className="mt-1 text-[11px] leading-[1.45] text-[#666] whitespace-pre-wrap">
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
