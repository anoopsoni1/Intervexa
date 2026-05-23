/**
 * Resume 17 — Modern Finance Template: Two-column layout with clean typography,
 * navy/slate accents. Left sidebar: Contact, Skills, Education, Certifications.
 * Right column: Summary, Experience, Languages. ATS-optimized with professional hierarchy.
 */

import { Phone, Mail, MapPin, Linkedin, Github } from "lucide-react";
import { resumeExternalHref, resumeHttpNewTabProps, resumeMailtoHref, resumeTelHref } from "../utils/resumeContactHref";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const NAVY = "#1e3a5f";
const LIGHT_GRAY = "#f8f9fa";
const ACCENT_BLUE = "#0066cc";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-neutral-900 rounded-none shadow-lg overflow-visible print:shadow-none flex-1 min-h-0 flex flex-col font-sans antialiased [print-color-adjust:exact]";

function cleanLink(url) {
  return String(url || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function parseFullName(raw) {
  const s = String(raw || "").trim();
  if (!s) return { first: "YOUR", last: "NAME", initial: "N" };
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const w = parts[0].toUpperCase();
    return { first: "", last: w, initial: (w[0] || "Y").toUpperCase() };
  }
  const last = parts[parts.length - 1].toUpperCase();
  const first = parts.slice(0, -1).join(" ").toUpperCase();
  return { first, last, initial: (last[0] || "?").toUpperCase() };
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
      const yearLine =
        lines.find(
          (l) =>
            /\d{4}\s*[—–-]\s*\d{4}/i.test(l) ||
            /\d{4}\s*[—–-]\s*present/i.test(l) ||
            /^\d{4}$/.test(l) ||
            /^\w+\s+\d{4}/.test(l)
        ) || "";
      const rest = lines.filter((l) => l !== yearLine);
      const degree = rest[0] || "";
      const school = rest[1] || "";
      const extra = rest.slice(2).join(" ").trim();
      return { degree, school, years: yearLine, extra };
    })
    .filter((b) => b.degree || b.school || b.years);
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

function SidebarSection({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: NAVY }}>
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function MainSection({ title, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: ACCENT_BLUE }}>
        <h2 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wide" style={{ color: NAVY }}>
          {title}
        </h2>
      </div>
      <div className="mt-3">{children}</div>
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
  const github = cleanLink(data?.github || "");

  const educationBlocks = parseEducationBlocks(data?.education);
  const skillLines = flattenSkills(data?.skills);
  const languageLines = parseLanguageProficiencyList(data?.languageProficiency);
  const achievements = limitAchievements(data?.achievements, 5);

  const experienceItems = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperience)
    .filter((j) => j.title || j.company || j.bullets.length > 0);

  const certifications = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map(parseCert)
    .filter((c) => c.title || c.body);

  return (
    <div className={DOCUMENT_CLASS}>
      <div className="flex flex-1 flex-col sm:flex-row">
        {/* SIDEBAR */}
        <aside
          className="w-full sm:w-1/3 px-5 sm:px-6 py-8 print:py-6"
          style={{ backgroundColor: LIGHT_GRAY }}
        >
          {/* CONTACT BLOCK */}
          <div className="mb-8">
            <h1 className="text-lg sm:text-xl font-bold mb-1" style={{ color: NAVY }}>
              {firstName} {lastName}
            </h1>
            <p className="text-sm font-semibold" style={{ color: ACCENT_BLUE }}>
              {role}
            </p>
          </div>

          <SidebarSection title="Contact">
            {email && (
              <a href={resumeMailtoHref(email)} {...resumeHttpNewTabProps} className="block text-xs leading-relaxed hover:opacity-70 transition-opacity">
                <span className="font-semibold">Email:</span> {email}
              </a>
            )}
            {phone && (
              <a href={resumeTelHref(phone)} {...resumeHttpNewTabProps} className="block text-xs leading-relaxed hover:opacity-70 transition-opacity">
                <span className="font-semibold">Phone:</span> {phone}
              </a>
            )}
            {location && (
              <p className="text-xs leading-relaxed">
                <span className="font-semibold">Location:</span> {location}
              </p>
            )}
            {linkedin && (
              <a href={resumeExternalHref(linkedin)} {...resumeHttpNewTabProps} className="block text-xs leading-relaxed hover:opacity-70 transition-opacity">
                <span className="font-semibold">LinkedIn:</span> {linkedin}
              </a>
            )}
            {github && (
              <a href={resumeExternalHref(github)} {...resumeHttpNewTabProps} className="block text-xs leading-relaxed hover:opacity-70 transition-opacity">
                <span className="font-semibold">GitHub:</span> {github}
              </a>
            )}
          </SidebarSection>

          {/* SKILLS */}
          {skillLines.length > 0 && (
            <SidebarSection title="Technical Skills">
              {skillLines.map((skill, idx) => (
                <div key={idx} className="text-xs leading-relaxed">
                  {skill}
                </div>
              ))}
            </SidebarSection>
          )}

          {/* EDUCATION */}
          {educationBlocks.length > 0 && (
            <SidebarSection title="Education">
              {educationBlocks.map((edu, idx) => (
                <div key={idx} className="text-xs leading-relaxed mb-2">
                  <div className="font-semibold">{edu.degree}</div>
                  <div className="text-neutral-700">{edu.school}</div>
                  {edu.years && <div className="text-neutral-600 text-[10px]">{edu.years}</div>}
                  {edu.extra && <div className="text-neutral-600 text-[10px]">{edu.extra}</div>}
                </div>
              ))}
            </SidebarSection>
          )}

          {/* CERTIFICATIONS */}
          {certifications.length > 0 && (
            <SidebarSection title="Certifications">
              {certifications.map((cert, idx) => (
                <div key={idx} className="text-xs leading-relaxed mb-1.5">
                  <div className="font-semibold">{cert.title}</div>
                  {cert.body && <div className="text-neutral-700 text-[10px]">{cert.body}</div>}
                </div>
              ))}
            </SidebarSection>
          )}

          {/* LANGUAGES */}
          {languageLines.length > 0 && (
            <SidebarSection title="Languages">
              {languageLines.map((lang, idx) => (
                <div key={idx} className="text-xs leading-relaxed">
                  {lang}
                </div>
              ))}
            </SidebarSection>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-5 sm:px-6 py-8 print:py-6">
          {/* SUMMARY */}
          {summary && (
            <MainSection title="Summary">
              <p className="text-xs sm:text-sm leading-relaxed text-neutral-800">{summary}</p>
            </MainSection>
          )}

          {/* EXPERIENCE */}
          {experienceItems.length > 0 && (
            <MainSection title="Professional Experience">
              {experienceItems.map((job, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                    <h3 className="text-xs sm:text-sm font-bold" style={{ color: NAVY }}>
                      {job.title}
                    </h3>
                    <span className="text-xs text-neutral-600">{job.dates}</span>
                  </div>
                  <p className="text-xs text-neutral-700 font-semibold mb-2">
                    {job.company}
                    {job.location && ` — ${job.location}`}
                  </p>
                  {job.bullets.length > 0 && (
                    <ul className="space-y-1 ml-4">
                      {job.bullets.slice(0, 4).map((bullet, bidx) => (
                        <li key={bidx} className="text-xs text-neutral-800 list-disc">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </MainSection>
          )}

          {/* ACHIEVEMENTS */}
          {achievements.length > 0 && (
            <MainSection title="Key Achievements">
              <ul className="space-y-1.5">
                {achievements.map((ach, idx) => (
                  <li key={idx} className="text-xs text-neutral-800 list-disc ml-4">
                    {ach}
                  </li>
                ))}
              </ul>
            </MainSection>
          )}
        </main>
      </div>
    </div>
  );
}
