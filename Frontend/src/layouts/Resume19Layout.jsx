/**
 * Resume 19 — Modern Two-Column Professional Resume
 * Left: Profile Summary, Work Experience, Projects
 * Right: Skills (with badges), Certification, Qualification, Languages, Awards
 * Teal/Green sidebar background with white main column
 * Header: Name, Title, Contact Info
 */

import { Mail, MapPin, Phone, Linkedin, Github, Award } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-neutral-800 rounded-none shadow-lg overflow-visible print:shadow-none flex-1 min-h-0 flex flex-col font-sans antialiased [print-color-adjust:exact]";

// Teal/Green color scheme
const SIDEBAR_BG = "#2d8e7f"; // Teal green
const ACCENT_COLOR = "#2d8e7f";
const TEXT_DARK = "#1a1a1a";
const TEXT_LIGHT = "#ffffff";

function cleanLink(url) {
  return String(url || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function parseFullName(raw) {
  const s = String(raw || "").trim();
  if (!s) return { first: "YOUR", last: "NAME" };
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { first: "", last: parts[0] };
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(" ");
  return { first, last };
}

function parseExperience(entry) {
  if (typeof entry === "object" && entry !== null) {
    const title = String(entry.role || entry.jobTitle || entry.title || "").trim();
    const company = String(entry.company || "").trim();
    const dates = String(entry.dates || entry.dateLine || entry.datesOrLocation || "").trim();
    const location = String(entry.location || entry.city || "").trim();
    const bullets = Array.isArray(entry.bullets)
      ? entry.bullets.map((b) => String(b || "").trim()).filter(Boolean)
      : [];
    return { title, company, dates, location, bullets };
  }
  const lines = String(entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    company: lines[1] || "",
    dates: lines[2] || "",
    location: "",
    bullets: lines.slice(3).map((b) => b.replace(/^\s*[•\-*]\s*/, "").trim()).filter(Boolean),
  };
}

function parseEducationBlocks(education) {
  if (!education || !String(education).trim()) return [];
  return String(education)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const yearLine = lines.find(
        (l) =>
          /\d{4}\s*[—–-]\s*\d{4}/i.test(l) ||
          /\d{4}\s*[—–-]\s*present/i.test(l) ||
          /^\w+\s+\d{4}/.test(l)
      ) || "";
      const rest = lines.filter((l) => l !== yearLine);
      const degree = rest[0] || "";
      const school = rest[1] || "";
      const extra = rest.slice(2).join(" ").trim();
      return { degree, school, years: yearLine, extra };
    });
}

function flattenSkills(skills) {
  if (!Array.isArray(skills)) return [];
  const out = [];
  for (const s of skills) {
    if (s == null) continue;
    if (typeof s === "string") {
      s.split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => out.push(line));
      continue;
    }
    if (typeof s === "object") {
      const cat = String(s.category || s.label || s.name || "").trim();
      const val = String(s.items || s.value || s.skills || "").trim();
      if (cat && val) out.push(`${cat}: ${val}`);
      else out.push(String(s.label ?? s.name ?? s.title ?? "").trim());
      continue;
    }
    out.push(String(s));
  }
  return out.map((t) => t.trim()).filter(Boolean);
}

function parseCert(cert) {
  const lines = String(cert || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return { title: lines[0] || "", body: lines.slice(1).join(" ").trim() };
}

function parseAchievementLine(s) {
  const str = String(s || "").trim();
  if (!str) return { title: "", desc: "" };
  for (const sp of [" — ", " – ", " - ", ": ", " | "]) {
    const i = str.indexOf(sp);
    if (i > 0) return { title: str.slice(0, i).trim(), desc: str.slice(i + sp.length).trim() };
  }
  return { title: str, desc: "" };
}

function SidebarSection({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="text-[13px] font-bold uppercase tracking-widest text-white mb-3 pb-2 border-b border-white border-opacity-30">
        {title}
      </h2>
      <div className="text-white text-[11px] space-y-2">
        {children}
      </div>
    </section>
  );
}

function SkillBadge({ skill }) {
  return (
    <div className="inline-flex items-center gap-1.5 mb-1">
      <span className="text-white text-[10px]">{skill}</span>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#ffd700" }}></span>
    </div>
  );
}

export default function Resume19Layout({ data }) {
  const { first: firstName, last: lastName } = parseFullName(data?.name || "Your Name");
  const role = (data?.role || "Professional Title").trim();
  const summary = (data?.summary || "").trim();

  const phone = (data?.phone || "").trim();
  const email = (data?.email || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");
  const github = cleanLink(data?.github || "");

  const educationBlocks = parseEducationBlocks(data?.education);
  const skillLines = flattenSkills(data?.skills);
//   const languageLines = (data?.languageProficiency || "").split("\n").map(l => l.trim()).filter(Boolean);
  const achievementItems = limitAchievements(data?.achievements);
  const certifications = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map(parseCert)
    .filter((c) => c.title || c.body);

  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((j) => j.title || j.company || j.bullets.length > 0);

  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((project) => project.title || project.description || project.link);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-5xl min-w-0 border border-neutral-200 print:border-neutral-300`}>
      {/* HEADER */}
      <header className="bg-white px-6 sm:px-8 py-6 border-b border-gray-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">
              <span style={{ color: TEXT_DARK }}>{firstName}</span>{" "}
              <span style={{ color: ACCENT_COLOR }}>{lastName}</span>
            </h1>
            <p className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
              {role}
            </p>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs text-gray-700">
          {email && (
            <a href={resumeMailtoHref(email)} className="flex items-center gap-2 hover:opacity-70">
              <Mail size={14} style={{ color: ACCENT_COLOR }} />
              <span>{email}</span>
            </a>
          )}
          {phone && (
            <a href={resumeTelHref(phone)} className="flex items-center gap-2 hover:opacity-70">
              <Phone size={14} style={{ color: ACCENT_COLOR }} />
              <span>{phone}</span>
            </a>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: ACCENT_COLOR }} />
              <span>{location}</span>
            </div>
          )}
          {linkedin && (
            <a href={resumeExternalHref(linkedin)} {...resumeHttpNewTabProps} className="flex items-center gap-2 hover:opacity-70">
              <Linkedin size={14} style={{ color: ACCENT_COLOR }} />
              <span>{linkedin}</span>
            </a>
          )}
          {github && (
            <a href={resumeExternalHref(github)} {...resumeHttpNewTabProps} className="flex items-center gap-2 hover:opacity-70">
              <Github size={14} style={{ color: ACCENT_COLOR }} />
              <span>{github}</span>
            </a>
          )}
        </div>
      </header>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 min-h-full">
        {/* LEFT COLUMN - MAIN CONTENT */}
        <div className="md:col-span-2 bg-white px-6 sm:px-8 py-6">
          {/* PROFILE SUMMARY */}
          {summary && (
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-3 pb-2 border-b-2" style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}>
                Profile Summary
              </h2>
              <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">
                {summary}
              </p>
            </section>
          )}

          {/* WORK EXPERIENCE */}
          {experienceItems.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-3 pb-2 border-b-2" style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {experienceItems.map((job, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
                      <span className="text-xs text-gray-600 whitespace-nowrap">{job.dates}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">
                      {job.company}
                      {job.location && ` — ${job.location}`}
                    </p>
                    {job.bullets.length > 0 && (
                      <ul className="space-y-1 ml-4 mt-2">
                        {job.bullets.map((bullet, bidx) => (
                          <li key={bidx} className="text-xs text-gray-800 list-disc">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {projectItems.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-3 pb-2 border-b-2" style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}>
                Projects
              </h2>
              <div className="space-y-3">
                {projectItems.map((project, idx) => (
                  <div key={idx}>
                    {project.title && (
                      <h3 className="text-sm font-bold text-gray-900">
                        {project.title}
                      </h3>
                    )}
                    {project.link && (
                      <p className="text-xs mt-0.5">
                        <ResumeProjectLink
                          url={project.link}
                          className="hover:opacity-70"
                          style={{ color: ACCENT_COLOR, textDecoration: "underline" }}
                        />
                      </p>
                    )}
                    {project.description && (
                      <ul className="space-y-0.5 ml-4 mt-1">
                        {project.description
                          .split("\n")
                          .map((bullet) => bullet.trim())
                          .filter(Boolean)
                          .map((bullet, bidx) => (
                            <li key={bidx} className="text-xs text-gray-800 list-disc">
                              {bullet.replace(/^\s*[•\-*]\s*/, "")}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <aside
          className="md:col-span-1 px-6 sm:px-8 py-3"
          style={{ backgroundColor: SIDEBAR_BG }}
        >
          {/* SKILLS */}
          {skillLines.length > 0 && (
            <SidebarSection title="Skills">
              <div className="grid grid-cols-2 space-y-1">
                {skillLines.map((skill, idx) => (
                  <div key={idx} className="col-span-1">
                    <SkillBadge skill={skill} />
                  </div>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* CERTIFICATION */}
          {certifications.length > 0 && (
            <SidebarSection title="Certification">
              <div className="space-y-1">
                {certifications.map((cert, idx) => (
                  <div key={idx}>
                    {cert.title && (
                      <p className="font-semibold text-white text-[11px]">
                        {cert.title}
                      </p>
                    )}
                    {cert.body && (
                      <p className="text-white text-[10px] mt-1 opacity-90">
                        {cert.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* QUALIFICATION (EDUCATION) */}
          {educationBlocks.length > 0 && (
            <SidebarSection title="Qualification">
              <div className="space-y-1">
                {educationBlocks.map((edu, idx) => (
                  <div key={idx}>
                    {edu.degree && (
                      <p className="font-semibold text-white text-[11px]">
                        {edu.degree}
                      </p>
                    )}
                    {edu.school && (
                      <p className="text-white text-[10px] mt-1">
                        {edu.school}
                      </p>
                    )}
                    {edu.years && (
                      <p className="text-white text-[10px] mt-1 opacity-80">
                        {edu.years}
                      </p>
                    )}
                    {edu.extra && (
                      <p className="text-white text-[10px] mt-1 opacity-80">
                        {edu.extra}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SidebarSection>
          )}


          {/* AWARDS */}
          {achievementItems.length > 0 && (
            <SidebarSection title="Awards">
              <div className="space-y-1">
                {achievementItems.map((raw, idx) => {
                  const { title, desc } = parseAchievementLine(raw);
                  return (
                    <div key={idx} className="flex gap-2">
                      <Award size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#ffd700" }} />
                      <div>
                        {title && (
                          <p className="font-semibold text-white text-[11px]">
                            {title}
                          </p>
                        )}
                        {desc && (
                          <p className="text-white text-[10px] mt-0.5 opacity-90">
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SidebarSection>
          )}
        </aside>
      </div>
    </article>
  );
}
