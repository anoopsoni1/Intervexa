import { MapPin, Phone, Mail, Globe, Linkedin, Github } from "lucide-react";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased";

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

function cleanLink(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
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
        degree: lines[0] || "",
        school: lines[1] || "",
        dates: lines[2] || "",
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

function SectionTitle({ children }) {
  return (
    <h2 className="text-[35px] leading-none font-semibold text-[#0b4870] mb-2 border-b border-[#d7dce2] pb-2">
      {children}
    </h2>
  );
}

function ContactLine({ icon: Icon, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-[11px] leading-[1.4] text-[#11314a]">
      <Icon size={12} className="mt-[2px] shrink-0 text-[#0b4870]" />
      <span className="break-all">{value}</span>
    </div>
  );
}

export default function Resume13Layout({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "Professional Title").trim();
  const summary = (data?.summary || "").trim();

  const phone = (data?.phone || "").trim();
  const email = (data?.email || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const website = cleanLink(data?.website || "");
  const linkedin = cleanLink(data?.linkedin || "");
  const github = cleanLink(data?.github || "");

  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((job) => job.role || job.company || job.dates || job.bullets.length > 0);
  const educationItems = parseEducation(data?.education);
  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((project) => project.title || project.description || project.link);

  const skillItems = splitList(data?.skills);
  const skillColumns = twoColumns(skillItems);
  const achievementItems = splitList(data?.achievements).slice(0, 4);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl min-w-0 border border-[#e1e4e8] print:border-[#e1e4e8]`}>
      <div className="grid grid-cols-1 md:grid-cols-[33%_1fr] print:grid-cols-[33%_1fr] min-h-full">
        <aside className="bg-[#dfe2e6] [print-color-adjust:exact] border-r border-[#cfd5db]">
          <div className="bg-[#0b4870] text-white px-5 py-6 rounded-br-[70px]">
            <h1 className="text-[30px] leading-[1.05] font-semibold tracking-wide">{name}</h1>
            <p className="mt-2 text-[12px] uppercase tracking-[0.12em] text-white/90">{role}</p>
          </div>

          <div className="px-5 py-5 space-y-5">
            <section className="resume-section-avoid-break">
              <h3 className="text-[31px] font-semibold text-[#0b4870] border-b border-[#c6ccd2] pb-2">
                Contact
              </h3>
              <div className="mt-3 space-y-2.5">
                <ContactLine icon={Mail} value={email} />
                <ContactLine icon={Phone} value={phone} />
                <ContactLine icon={MapPin} value={location} />
                <ContactLine icon={Globe} value={website} />
                <ContactLine icon={Linkedin} value={linkedin} />
                <ContactLine icon={Github} value={github} />
              </div>
            </section>

            {educationItems.length > 0 && (
              <section className="resume-section-avoid-break">
                <h3 className="text-[31px] font-semibold text-[#0b4870] border-b border-[#c6ccd2] pb-2">Education</h3>
                <div className="mt-3 space-y-2">
                  {educationItems.map((edu, idx) => (
                    <article key={idx}>
                      {edu.degree && <p className="text-[12px] font-semibold text-[#183149]">{edu.degree}</p>}
                      {edu.school && <p className="text-[11px] text-[#365067]">{edu.school}</p>}
                      {edu.dates && <p className="text-[10px] text-[#3d5164]">{edu.dates}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {skillItems.length > 0 && (
              <section className="resume-section-avoid-break">
                <h3 className="text-[31px] font-semibold text-[#0b4870] border-b border-[#c6ccd2] pb-2">Skills</h3>
                <div className="mt-3 grid grid-cols-2 gap-x-4 text-[11px] text-[#1a3a53]">
                  <ul className="space-y-1.5 list-none pl-0 m-0">
                    {skillColumns[0].map((skill, idx) => (
                      <li key={`skill-l-${skill}-${idx}`} className="wrap-break-word">
                        {skill}
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-1.5 list-none pl-0 m-0">
                    {skillColumns[1].map((skill, idx) => (
                      <li key={`skill-r-${skill}-${idx}`} className="wrap-break-word">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        </aside>

        <div className="px-5 py-5 bg-[#f8f8f8] [print-color-adjust:exact]">
          <section className="resume-section-avoid-break">
            <SectionTitle>Summary</SectionTitle>
            <p className="text-[11px] leading-[1.6] text-[#283743] whitespace-pre-wrap">
              {summary || "Write a concise summary about your profile, strengths, and career goals."}
            </p>
          </section>

          {experienceItems.length > 0 && (
            <section className="mt-5">
              <SectionTitle>Work Experience</SectionTitle>
              <div className="space-y-3">
                {experienceItems.map((job, idx) => (
                  <article key={idx} className="resume-section-avoid-break">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {job.role && <p className="text-[12px] font-semibold text-[#183149]">{job.role}</p>}
                        {job.company && <p className="text-[11px] text-[#365067]">{job.company}</p>}
                      </div>
                      {job.dates && <p className="text-[10px] text-[#3d5164] shrink-0">{job.dates}</p>}
                    </div>
                    {job.bullets.length > 0 && (
                      <ul className="mt-1.5 list-disc pl-4 text-[11px] leading-normal text-[#2e4456] space-y-1">
                        {job.bullets.map((bullet, bulletIdx) => (
                          <li key={bulletIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {achievementItems.length > 0 && (
            <section className="mt-5">
              <SectionTitle>Achievements</SectionTitle>
              <ul className="list-disc pl-4 text-[11px] leading-normal text-[#2e4456] space-y-1">
                {achievementItems.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="resume-section-avoid-break">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {projectItems.length > 0 && (
            <section className="mt-5">
              <SectionTitle>Projects</SectionTitle>
              <div className="space-y-2.5">
                {projectItems.map((project, idx) => (
                  <article key={idx} className="resume-section-avoid-break">
                    {project.title && <p className="text-[12px] font-semibold text-[#183149]">{project.title}</p>}
                    {project.link && (
                      <p className="mt-0.5 text-[10px]">
                        <ResumeProjectLink url={project.link} className="text-[#0b4870] underline print:text-black" />
                      </p>
                    )}
                    {project.description && (
                      <p className="mt-1 text-[11px] leading-normal text-[#2e4456] whitespace-pre-wrap">
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
