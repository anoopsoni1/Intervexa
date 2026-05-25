/**
 * Resume 17 — Classic Two-Column Finance Resume
 * Left: Summary, Professional Experience
 * Right: Technical Skills, Education, Languages, Certifications
 * Header: Name, Title, Contact Info (top-right)
 * Light gray sidebar background
 */

import { Mail, MapPin, Phone, Linkedin } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document max-w-4xl mx-auto bg-white text-black shadow-lg rounded-none sm:rounded-md overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased font-sans relative";

const NAVY = "#1e3a5f";
const LIGHT_BG = "#e8eef5";

function cleanLink(url) {
  return String(url || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function twoColumns(list) {
  if (list.length === 0) return [[], []];
  const mid = Math.ceil(list.length / 2);
  return [list.slice(0, mid), list.slice(mid)];
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

function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: NAVY }}>
        ●
      </span>
      <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: NAVY }}>
        {children}
      </h2>
    </div>
  );
}

export default function Resume17Layout({ data }) {
  const { first: firstName, last: lastName } = parseFullName(data?.name || "Your Name");
  const role = (data?.role || "Professional Title").trim();
  const summary = (data?.summary || "").trim();

  const phone = (data?.phone || "").trim();
  const email = (data?.email || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");

  const educationBlocks = parseEducationBlocks(data?.education);
  const skillLines = flattenSkills(data?.skills);
  const skillCols = twoColumns(skillLines);
  const languageLines = (data?.languageProficiency || "").split("\n").map(l => l.trim()).filter(Boolean);
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
    <div className={DOCUMENT_CLASS}>
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-300 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>
            {firstName} {lastName}
          </h1>
          <p className="text-sm italic text-gray-700">{role}</p>
        </div>
        <div className="text-right text-xs space-y-0.5 text-gray-700">
          {email && (
            <div className="flex items-center justify-end gap-1">
              <Mail className="h-3 w-3" />
              <a href={resumeMailtoHref(email)} {...resumeHttpNewTabProps} className="hover:opacity-70">
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div className="flex items-center justify-end gap-1">
              <Phone className="h-3 w-3" />
              <a href={resumeTelHref(phone)} {...resumeHttpNewTabProps} className="hover:opacity-70">
                {phone}
              </a>
            </div>
          )}
          {linkedin && (
            <div className="flex items-center justify-end gap-1">
              <Linkedin className="h-3 w-3" />
              <a href={resumeExternalHref(linkedin)} {...resumeHttpNewTabProps} className="hover:opacity-70">
                {linkedin}
              </a>
            </div>
          )}
          {location && (
            <div className="flex items-center justify-end gap-1">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex flex-1">
        {/* LEFT COLUMN */}
        <div className="flex-[3] px-6 py-5 border-r border-gray-300">
          {/* SUMMARY */}
          {summary && (
            <div className="mb-5">
              <SectionHeader>Summary</SectionHeader>
              <p className="text-xs leading-relaxed text-gray-800 mt-2">{summary}</p>
            </div>
          )}

          {/* PROFESSIONAL EXPERIENCE */}
          {experienceItems.length > 0 && (
            <div className="mb-5">
              <SectionHeader>Professional Experience</SectionHeader>
              <div className="mt-2 space-y-4">
                {experienceItems.map((job, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-xs font-bold" style={{ color: NAVY }}>
                        {job.title}
                      </h3>
                      <span className="text-xs text-gray-600">{job.dates}</span>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold mb-1.5">
                      {job.company}
                      {job.location && ` — ${job.location}`}
                    </p>
                    {job.bullets.length > 0 && (
                      <ul className="space-y-0.5 ml-3">
                        {job.bullets.slice(0, 3).map((bullet, bidx) => (
                          <li key={bidx} className="text-xs text-gray-800 list-disc">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {projectItems.length > 0 && (
            <div className="mb-5">
              <SectionHeader>Projects</SectionHeader>
              <div className="mt-2 space-y-3">
                {projectItems.map((project, idx) => (
                  <div key={idx}>
                    {project.title && (
                      <h3 className="text-xs font-bold" style={{ color: NAVY }}>
                        {project.title}
                      </h3>
                    )}
                    {project.link && (
                      <p className="text-xs mt-0.5">
                        <ResumeProjectLink url={project.link} className="text-blue-600 underline hover:opacity-70" />
                      </p>
                    )}
                    {project.description && (
                      <ul className="space-y-0.5 ml-3 mt-1">
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
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-[2]  px-6 py-5" style={{ backgroundColor: LIGHT_BG }}>
          {/* TECHNICAL SKILLS */}
          {skillLines.length > 0 && (
            <div className="mb-5">
              <SectionHeader>Technical Skills</SectionHeader>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                <div className="space-y-1">
                  {skillCols[0].map((skill, idx) => {
                    const parts = skill.split(":").map(p => p.trim());
                    return (
                      <div key={idx} className="text-xs text-gray-800">
                        <span>{parts[0]}</span>
                        {parts[1] && <span className="text-gray-600 block text-[10px]">{parts[1]}</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  {skillCols[1].map((skill, idx) => {
                    const parts = skill.split(":").map(p => p.trim());
                    return (
                      <div key={idx} className="text-xs text-gray-800">
                        <span>{parts[0]}</span>
                        {parts[1] && <span className="text-gray-600 block text-[10px]">{parts[1]}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {achievementItems.length > 0 && (
            <div className="mb-5">
              <SectionHeader>Achievements</SectionHeader>
              <div className="mt-2 space-y-1">
                {achievementItems.map((achievement, idx) => (
                  <p key={idx} className="text-xs text-gray-800">• {achievement}</p>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION */}
          {educationBlocks.length > 0 && (
            <div className="mb-5">
              <SectionHeader>Education</SectionHeader>
              <div className="mt-2 space-y-2">
                {educationBlocks.map((edu, idx) => (
                  <div key={idx}>
                    <p className="text-xs font-semibold text-gray-900">{edu.degree}</p>
                    <p className="text-xs text-gray-700">{edu.school}</p>
                    {edu.years && <p className="text-xs text-gray-600">{edu.years}</p>}
                    {edu.extra && <p className="text-xs text-gray-600">{edu.extra}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGES */}
          {languageLines.length > 0 && (
            <div className="mb-5">
              <SectionHeader>Languages</SectionHeader>
              <div className="mt-2 space-y-1">
                {languageLines.map((lang, idx) => (
                  <p key={idx} className="text-xs text-gray-800">{lang}</p>
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATIONS */}
          {certifications.length > 0 && (
            <div>
              <SectionHeader>Certifications</SectionHeader>
              <div className="mt-2 space-y-2">
                {certifications.map((cert, idx) => (
                  <div key={idx}>
                    <p className="text-xs font-semibold text-gray-900">{cert.title}</p>
                    {cert.body && <p className="text-xs text-gray-700">{cert.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
