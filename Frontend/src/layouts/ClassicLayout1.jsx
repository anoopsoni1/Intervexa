/**
 * Classic resume 1 — Two-column layout: left Summary, Experience, Projects;
 * right Key Achievements, Education, Languages. Light purple accent, decorative circles.
 */

import {
  Mail,
  MapPin,
  Linkedin,
  Globe,
  Calendar,
  Phone,
  TrendingUp,
  Trophy,
  Users,
  Settings,
} from "lucide-react";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";
import { parseProjectForResume } from "../utils/projectForm";
import ResumeProjectLink from "../components/resume/ResumeProjectLink";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased relative";

const ACCENT = "#6d28d9";
const SECTION_HEAD =
  "text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500 pb-1.5 mb-2 border-b border-neutral-300";

function cleanLink(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function parseExperienceEntry(entry) {
  if (typeof entry === "object" && entry !== null) {
    return {
      jobTitle: String(entry.role || entry.jobTitle || entry.title || "").trim(),
      company: String(entry.company || "").trim(),
      meta: String(entry.dates || entry.dateLine || entry.datesOrLocation || "").trim(),
      bullets: Array.isArray(entry.bullets)
        ? entry.bullets.map((b) => String(b || "").trim()).filter(Boolean)
        : [],
    };
  }
  const lines = String(entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    jobTitle: lines[0] || "",
    company: lines[1] || "",
    meta: lines[2] || "",
    bullets: lines.slice(3).map((b) => b.replace(/^\s*[•\-*]\s*/, "").trim()).filter(Boolean),
  };
}

function splitMeta(meta) {
  const s = String(meta || "").trim();
  if (!s) return { dates: "", location: "" };
  const pipe = s.indexOf("|");
  if (pipe >= 0) {
    return { dates: s.slice(0, pipe).trim(), location: s.slice(pipe + 1).trim() };
  }
  return { dates: s, location: "" };
}

function parseEducationBlocks(education) {
  if (!education || !String(education).trim()) return [];
  return String(education)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const metaLine = lines[2] || "";
      const { dates, location } = splitMeta(metaLine);
      return {
        degree: lines[0] || "",
        institution: lines[1] || "",
        dates,
        location,
      };
    });
}

function parseAchievementLine(s) {
  const str = String(s || "").trim();
  if (!str) return { title: "", desc: "" };
  for (const sp of [" — ", " – ", " - ", ": ", " | "]) {
    const i = str.indexOf(sp);
    if (i > 0) {
      return { title: str.slice(0, i).trim(), desc: str.slice(i + sp.length).trim() };
    }
  }
  return { title: str, desc: "" };
}

function parseLanguageRow(line) {
  const raw = String(line || "").trim();
  const parts = raw.split(/[—–\-]/).map((p) => p.trim());
  return { name: parts[0] || raw, level: parts[1] || "", full: raw };
}

function dotsForLevel(fullLine) {
  const lower = String(fullLine || "").toLowerCase();
  if (/native|fluent|professional|bilingual/.test(lower)) return 5;
  if (/advanced|proficient/.test(lower)) return 4;
  if (/intermediate|conversational|working/.test(lower)) return 3;
  if (/elementary|basic|limited/.test(lower)) return 2;
  return 4;
}

function LanguageRow({ line }) {
  const { name, level, full } = parseLanguageRow(line);
  const n = dotsForLevel(full);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
      <span className="min-w-[100px] flex-1 font-semibold text-black">{name}</span>
      <span className="min-w-[72px] text-neutral-500 text-[10px]">{level || "\u00a0"}</span>
      <span className="inline-flex gap-0.5 shrink-0" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full [print-color-adjust:exact]"
            style={{
              backgroundColor: i < n ? ACCENT : "transparent",
              border: i < n ? "none" : `1px solid ${ACCENT}40`,
            }}
          />
        ))}
      </span>
    </div>
  );
}

function AchievementIcon({ index }) {
  const icons = [TrendingUp, Trophy, Users, Settings];
  const Icon = icons[index % icons.length];
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white [print-color-adjust:exact]"
      style={{ backgroundColor: ACCENT }}
    >
      <Icon size={15} strokeWidth={2.25} className="text-white" aria-hidden />
    </span>
  );
}

function DecorativeCircles() {
  return (
    <div className="pointer-events-none absolute right-0 top-0 z-0 h-52 w-52 sm:h-64 sm:w-64 overflow-visible select-none print:opacity-30" aria-hidden>
      <div
        className="absolute rounded-full border border-violet-200/70"
        style={{ width: 180, height: 180, right: -36, top: -48 }}
      />
      <div
        className="absolute rounded-full border border-violet-200/50"
        style={{ width: 120, height: 120, right: 24, top: -12 }}
      />
      <div
        className="absolute rounded-full border border-violet-100/90"
        style={{ width: 100, height: 100, right: -8, top: 32 }}
      />
      <div
        className="absolute rounded-full border border-violet-100/60"
        style={{ width: 140, height: 140, right: 48, top: 48 }}
      />
    </div>
  );
}

export default function ClassicLayout1({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "Your Role").trim();
  const summary = (data?.summary || "").trim();
  const email = (data?.email || "").trim();
  const phone = (data?.phone || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");
  const website = cleanLink(data?.website || "");

  const experienceEntries = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperienceEntry)
    .filter((e) => e.jobTitle || e.company || e.meta || e.bullets.length > 0);

  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProjectForResume)
    .filter((p) => p.title || p.description || p.link);

  const educationBlocks = parseEducationBlocks(data?.education);
  const achievements = limitAchievements(data?.achievements);
  const languageLines = parseLanguageProficiencyList(data?.languageProficiency);

  const skillsList = Array.isArray(data?.skills)
    ? data.skills.map((s) => (typeof s === "string" ? s : s?.label ?? s?.name ?? "")).filter(Boolean)
    : [];

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl border border-neutral-200 print:border-neutral-200 bg-white`}>
      <DecorativeCircles />

      <header className="relative z-10 px-4 sm:px-6 pt-6 pb-4 border-b border-neutral-200">
        <h1 className="text-2xl sm:text-[28px] font-bold text-black tracking-tight leading-tight">{name}</h1>
        <p className="mt-1 text-[12px] sm:text-[13px] font-medium leading-snug" style={{ color: ACCENT }}>
          {role}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] sm:text-[11px] text-neutral-500">
          {email ? (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Mail size={12} className="shrink-0" style={{ color: ACCENT }} />
              <span className="break-all">{email}</span>
            </span>
          ) : null}
          {linkedin ? (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Linkedin size={12} className="shrink-0" style={{ color: ACCENT }} />
              <span className="break-all">{linkedin}</span>
            </span>
          ) : null}
          {website ? (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Globe size={12} className="shrink-0" style={{ color: ACCENT }} />
              <span className="break-all">{website}</span>
            </span>
          ) : null}
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} className="shrink-0 text-neutral-400" />
              {location}
            </span>
          ) : null}
          {phone ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone size={12} className="shrink-0 text-neutral-400" />
              {phone}
            </span>
          ) : null}
        </div>
      </header>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[3fr_2fr] print:grid-cols-[3fr_2fr]">
        {/* Left ~60% */}
        <div className="min-w-0 px-4 sm:px-6 py-5 md:border-r border-neutral-200">
          {summary ? (
            <section className="resume-section-avoid-break mb-6">
              <h2 className={SECTION_HEAD}>Summary</h2>
              <p className="text-[11px] leading-[1.55] text-black whitespace-pre-wrap">{summary}</p>
            </section>
          ) : null}

          {experienceEntries.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <h2 className={SECTION_HEAD}>Experience</h2>
              <div className="space-y-4">
                {experienceEntries.map((entry, i) => {
                  const { dates, location: loc } = splitMeta(entry.meta);
                  return (
                    <article key={i}>
                      {entry.jobTitle ? (
                        <p className="text-[12px] font-bold text-black leading-snug">{entry.jobTitle}</p>
                      ) : null}
                      {entry.company ? (
                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: ACCENT }}>
                          {entry.company}
                        </p>
                      ) : null}
                      {(dates || entry.meta || loc) ? (
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-neutral-500">
                          {(dates || (!loc && entry.meta)) ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={11} className="shrink-0 text-neutral-400" />
                              {dates || entry.meta}
                            </span>
                          ) : null}
                          {loc ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={11} className="shrink-0 text-neutral-400" />
                              {loc}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {entry.bullets.length > 0 ? (
                        <ul className="mt-2 space-y-1 pl-4 list-disc text-[11px] leading-relaxed text-black marker:text-neutral-400">
                          {entry.bullets.map((b, j) => (
                            <li key={j} className="pl-0.5">
                              {b}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {projectItems.length > 0 ? (
            <section className="resume-section-avoid-break">
              <h2 className={SECTION_HEAD}>Projects</h2>
              <div className="space-y-3">
                {projectItems.map((project, idx) => (
                  <article key={idx} className="min-w-0">
                    {project.title ? (
                      <p className="text-[12px] font-bold text-black leading-snug">{project.title}</p>
                    ) : null}
                    {project.link ? (
                      <p className="mt-0.5 text-[10px]">
                        <ResumeProjectLink
                          url={project.link}
                          className="font-semibold text-violet-800 underline print:text-black"
                        />
                      </p>
                    ) : null}
                    {project.description ? (
                      <p className="mt-1 text-[11px] leading-relaxed text-black whitespace-pre-wrap">{project.description}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Right ~40% */}
        <aside className="min-w-0 px-4 sm:px-5 py-5 bg-neutral-50/90 print:bg-neutral-50 [print-color-adjust:exact] border-t md:border-t-0 border-neutral-200">
          {educationBlocks.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <h2 className={SECTION_HEAD}>Education</h2>
              <div className="space-y-3">
                {educationBlocks.map((edu, idx) => (
                  <article key={idx}>
                    {edu.degree ? <p className="text-[12px] font-bold text-black">{edu.degree}</p> : null}
                    {edu.institution ? (
                      <p className="text-[11px] font-semibold mt-0.5" style={{ color: ACCENT }}>
                        {edu.institution}
                      </p>
                    ) : null}
                    {(edu.dates || edu.location) ? (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-neutral-500">
                        {edu.dates ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} className="shrink-0 text-neutral-400" />
                            {edu.dates}
                          </span>
                        ) : null}
                        {edu.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} className="shrink-0 text-neutral-400" />
                            {edu.location}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {achievements.length > 0 ? (
            <section className="resume-section-avoid-break mb-6">
              <h2 className={SECTION_HEAD}>Key achievements</h2>
              <div className="space-y-3">
                {achievements.map((item, i) => {
                  const { title, desc } = parseAchievementLine(typeof item === "string" ? item : String(item));
                  if (!title) return null;
                  return (
                    <div key={i} className="flex gap-3">
                      <AchievementIcon index={i} />
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[11px] font-bold text-black leading-snug">{title}</p>
                        {desc ? <p className="mt-0.5 text-[10px] leading-snug text-neutral-600">{desc}</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {skillsList.length > 0 ? (
            <section className={`resume-section-avoid-break ${languageLines.length > 0 ? "mb-6" : ""}`}>
              <h2 className={SECTION_HEAD}>Skills</h2>
              <p className="text-[11px] leading-relaxed text-black">{skillsList.join(", ")}</p>
            </section>
          ) : null}

          {languageLines.length > 0 ? (
            <section className="resume-section-avoid-break">
              <h2 className={SECTION_HEAD}>Languages</h2>
              <div className="space-y-2">
                {languageLines.map((line, i) => (
                  <LanguageRow key={i} line={line} />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
