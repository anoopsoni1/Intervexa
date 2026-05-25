/**
 * Resume 18 — Modern Professional Resume
 * Clean single-column layout with organized sections
 * Header: Name, Title, Contact Info
 * Sections: Education, Skills, Experience, Projects, Positions
 */

import { Mail, MapPin, Phone, Linkedin, Github } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document max-w-4xl mx-auto bg-white text-black shadow-lg rounded-none sm:rounded-md overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased font-serif relative";

const PRIMARY_COLOR = "#1a1a1a";
const ACCENT_COLOR = "#d84e42";

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

function SectionTitle({ children }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest mb-2 pb-1 border-b"
      style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
    >
      {children}
    </h2>
  );
}

export default function Resume18Layout({ data }) {
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
  const languageLines = (data?.languageProficiency || "").split("\n").map(l => l.trim()).filter(Boolean);
  const achievementItems = limitAchievements(data?.achievements);

  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((j) => j.title || j.company || j.bullets.length > 0);

  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((project) => project.title || project.description || project.link);

  return (
    <div className={DOCUMENT_CLASS}>
      {/* HEADER */}
      <div className="px-6 py-5 border-b text-center border-gray-300">
        <div className="mb-2">
          <h1 className="text-3xl font-serif font-bold tracking-wider" style={{ color: PRIMARY_COLOR }}>
            {firstName} {lastName}
          </h1>
          <p className="text-sm font-serif italic mt-1" style={{ color: PRIMARY_COLOR }}>
            {role}
          </p>
        </div>

        {/* CONTACT INFO */}
        <div className="flex flex-wrap gap-10 text-xs mt-2 justify-center text-gray-700">
          {phone && (
            <div className="flex items-center gap-1">
              <Phone size={12} />
              <a href={resumeTelHref(phone)} className="hover:opacity-70">
                {phone}
              </a>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1">
              <Mail size={12} />
              <a href={resumeMailtoHref(email)} className="hover:opacity-70">
                {email}
              </a>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{location}</span>
            </div>
          )}
          {linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin size={12} />
              <a href={resumeExternalHref(linkedin)} {...resumeHttpNewTabProps} className="hover:opacity-70">
                {linkedin}
              </a>
            </div>
          )}
          {github && (
            <div className="flex items-center gap-1">
              <Github size={12} />
              <a href={resumeExternalHref(github)} {...resumeHttpNewTabProps} className="hover:opacity-70">
                {github}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 py-4 flex-1">
        {/* EDUCATION */}
        {educationBlocks.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-1">
              {educationBlocks.map((edu, idx) => (
                <div key={idx} className="text-xs text-gray-800">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="font-semibold">
                      {edu.degree}
                    </p>
                    {edu.years && <p className="text-gray-600 whitespace-nowrap">{edu.years}</p>}
                  </div>
                  <p className="text-gray-700">{edu.school}</p>
                  {edu.extra && <p className="text-gray-600 text-[10px]">{edu.extra}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TECHNICAL SKILLS */}
        {skillLines.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Technical Skills</SectionTitle>
            <div className="space-y-1 text-xs text-gray-800">
              {(() => {
                // Prefer explicit Languages / Technologies lines like in the image
                const lines = skillLines.map((s) => String(s || "").trim()).filter(Boolean);
                const languagesIndex = lines.findIndex((l) => /^languages\s*:/i.test(l));
                const techIndex = lines.findIndex((l) => /^technolog(?:y|ies)\s*:/i.test(l));

                const rendered = [];

                if (languagesIndex >= 0) {
                  const parts = lines[languagesIndex].split(":").map(p => p.trim());
                  rendered.push(
                    <p key="langs"><span className="font-semibold" style={{ color: PRIMARY_COLOR }}>{parts[0]}:</span> <span className="ml-1">{parts[1]}</span></p>
                  );
                }

                if (techIndex >= 0) {
                  const parts = lines[techIndex].split(":").map(p => p.trim());
                  rendered.push(
                    <p key="tech"><span className="font-semibold" style={{ color: PRIMARY_COLOR }}>{parts[0]}:</span> <span className="ml-1">{parts[1]}</span></p>
                  );
                }

                // Render any remaining lines (not the explicit two) as condensed comma separated lines
                const remaining = lines.filter((_, i) => i !== languagesIndex && i !== techIndex);
                if (remaining.length) {
                  // join remaining entries with comma (preserve any existing colon formatting)
                  rendered.push(
                    <p key="other">{remaining.join(", ")}</p>
                  );
                }

                return rendered;
              })()}
            </div>
          </section>
        )}

        {/* WORK EXPERIENCE */}
        {experienceItems.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Work Experience</SectionTitle>
            <div className="space-y-2">
              {experienceItems.map((job, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="text-xs font-bold text-gray-900">
                      {job.title}
                    </h3>
                    <span className="text-xs text-gray-600 whitespace-nowrap">{job.dates}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">
                    {job.company}
                    {job.location && ` — ${job.location}`}
                  </p>
                  {job.bullets.length > 0 && (
                    <ul className="space-y-0.5 ml-3">
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
          <section className="mb-4">
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-2">
              {projectItems.map((project, idx) => (
                <div key={idx}>
                  {project.title && (
                    <h3 className="text-xs font-bold text-gray-900">
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
                    <ul className="space-y-0.5 ml-3 mt-0.5">
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

        {/* ACHIEVEMENTS */}
        {achievementItems.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Achievements</SectionTitle>
            <div className="space-y-0.5">
              {achievementItems.map((achievement, idx) => (
                <p key={idx} className="text-xs text-gray-800">• {achievement}</p>
              ))}
            </div>
          </section>
        )}

        {/* LANGUAGES */}
        {languageLines.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Languages</SectionTitle>
            <div className="space-y-0.5">
              {languageLines.map((lang, idx) => (
                <p key={idx} className="text-xs text-gray-800">{lang}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
