
import { Mail, MapPin, Linkedin, Calendar, Phone, TrendingUp, BarChart3, Award, FolderOpen } from "lucide-react";
import { limitAchievements } from "../utils/resumeAchievements";
import { parseLanguageProficiencyList } from "../utils/resumeLanguage";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased";

const TEAL = "#2a9d9a";
const SECTION_HEAD =
  "text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500 pb-1.5 mb-2 border-b border-neutral-300";

function cleanLink(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function parseExperienceEntry(entry) {
  if (typeof entry === "object" && entry !== null) {
    return {
      jobTitle: String(entry.role || entry.jobTitle || entry.title || "").trim(),
      company: String(entry.company || "").trim(),
      meta: String(entry.dates || entry.dateLine || entry.datesOrLocation || "").trim(),
      bullets: Array.isArray(entry.bullets) ? entry.bullets.map((b) => String(b || "").trim()).filter(Boolean) : [],
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
      const meta = lines[2] || "";
      const { dates, location } = splitMeta(meta);
      return {
        degree: lines[0] || "",
        institution: lines[1] || "",
        dates,
        location,
      };
    });
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

function parseCertification(cert) {
  const lines = String(cert || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  return {
    title: lines[0] || "",
    body: lines.slice(1).join(" "),
  };
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
  const name = parts[0] || raw;
  const level = parts[1] || "";
  return { name, level, full: raw };
}

function dotsForLevel(nameAndLevel) {
  const lower = nameAndLevel.toLowerCase();
  if (/native|fluent|professional|bilingual/.test(lower)) return 5;
  if (/advanced|proficient|full\s*professional/.test(lower)) return 4;
  if (/intermediate|conversational|working/.test(lower)) return 3;
  if (/elementary|basic|limited/.test(lower)) return 2;
  return 4;
}

function LanguageDots({ line }) {
  const { name, level, full } = parseLanguageRow(line);
  const n = dotsForLevel(full);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-black">
      <span className="min-w-0">
        <span className="font-semibold text-black">{name}</span>
        {level ? <span className="text-neutral-500 font-normal"> {level}</span> : null}
      </span>
      <span className="inline-flex gap-0.5 shrink-0" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i < n ? "bg-neutral-700" : "border border-neutral-300 bg-white"}`}
          />
        ))}
      </span>
    </div>
  );
}

function AchievementIcon({ index }) {
  const icons = [TrendingUp, BarChart3, Award];
  const Icon = icons[index % icons.length];
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white [print-color-adjust:exact]"
      style={{ backgroundColor: TEAL }}
    >
      <Icon size={15} strokeWidth={2.25} className="text-white" aria-hidden />
    </span>
  );
}

function monogramFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function PremiumLayout3({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "Your Role").trim();
  const summary = (data?.summary || "").trim();
  const email = (data?.email || "").trim();
  const phone = (data?.phone || "").trim();
  const location = (data?.location || data?.address || "").trim();
  const linkedin = cleanLink(data?.linkedin || "");
  const website = cleanLink(data?.website || "");
  const photo =
    (data?.photo && String(data.photo).trim()) ||
    (data?.photoUrl && String(data.photoUrl).trim()) ||
    (data?.profileImage && String(data.profileImage).trim()) ||
    (data?.avatar && String(data.avatar).trim()) ||
    "";

  const experienceEntries = (Array.isArray(data?.experience) ? data.experience : [])
    .map(parseExperienceEntry)
    .filter((e) => e.jobTitle || e.company || e.meta || e.bullets.length > 0);

  const educationBlocks = parseEducationBlocks(data?.education);

  const skillsList = Array.isArray(data?.skills) ? data.skills.map((s) => (typeof s === "string" ? s : s?.label ?? s?.name ?? "")).filter(Boolean) : [];

  const achievements = limitAchievements(data?.achievements);

  const languageLines = parseLanguageProficiencyList(data?.languageProficiency);

  const certificationItems = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map(parseCertification)
    .filter(Boolean);

  const projectItems = (Array.isArray(data?.projects) ? data.projects : [])
    .map(parseProject)
    .filter((p) => p.title || p.description);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl border border-neutral-200 print:border-neutral-200`}>
      <header className="px-4 sm:px-6 pt-5 pb-4 border-b border-neutral-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-[28px] font-bold uppercase tracking-tight text-black leading-tight">{name}</h1>
            <p className="mt-1 text-[12px] sm:text-[13px] font-medium leading-snug" style={{ color: TEAL }}>
              {role}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] sm:text-[11px] text-neutral-500">
              {email ? (
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <Mail size={12} className="shrink-0 text-neutral-400" />
                  <span className="break-all">{email}</span>
                </span>
              ) : null}
              {linkedin ? (
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <Linkedin size={12} className="shrink-0 text-neutral-400" />
                  <span className="break-all">{linkedin}</span>
                </span>
              ) : website ? (
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <Linkedin size={12} className="shrink-0 text-neutral-400" />
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
          </div>
          <div className="shrink-0">
            {photo ? (
              <img
                src={photo}
                alt=""
                className="h-[72px] w-[72px] sm:h-[80px] sm:w-[80px] rounded-full object-cover border border-neutral-200"
              />
            ) : (
              <div
                className="flex h-[72px] w-[72px] sm:h-[80px] sm:w-[80px] items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-lg font-semibold text-neutral-500"
                aria-hidden
              >
                {monogramFromName(name)}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(200px,34%)] print:grid-cols-[1fr_minmax(200px,34%)]">
        {/* Left — main column (~2/3) */}
        <div className="min-w-0 px-4 sm:px-6 py-4 md:border-r border-neutral-200">
          {experienceEntries.length > 0 ? (
            <section className="resume-section-avoid-break mb-5">
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
                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: TEAL }}>
                          {entry.company}
                        </p>
                      ) : null}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-neutral-500">
                        {(dates || entry.meta) && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} className="shrink-0 text-neutral-400" />
                            {dates || entry.meta}
                          </span>
                        )}
                        {loc ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} className="shrink-0 text-neutral-400" />
                            {loc}
                          </span>
                        ) : null}
                      </div>
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
            <section className={`resume-section-avoid-break ${languageLines.length > 0 ? "mb-5" : ""}`}>
              <h2 className={SECTION_HEAD}>Projects</h2>
              <div className="space-y-3">
                {projectItems.map((project, idx) => (
                  <article key={idx} className="flex gap-2">
                    <FolderOpen size={14} className="mt-0.5 shrink-0" style={{ color: TEAL }} aria-hidden />
                    <div className="min-w-0">
                      {project.title ? (
                        <p className="text-[12px] font-bold text-black leading-snug">{project.title}</p>
                      ) : null}
                      {project.description ? (
                        <p className="mt-1 text-[11px] leading-relaxed text-black whitespace-pre-wrap">{project.description}</p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {languageLines.length > 0 ? (
            <section className="resume-section-avoid-break">
              <h2 className={SECTION_HEAD}>Languages</h2>
              <div className="space-y-2">
                {languageLines.map((line, i) => (
                  <LanguageDots key={i} line={line} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Right — sidebar (~1/3) */}
        <aside className="min-w-0 px-4 sm:px-5 py-4 bg-neutral-50/80 print:bg-neutral-50 [print-color-adjust:exact] border-t md:border-t-0 border-neutral-200">
          {summary ? (
            <section className="resume-section-avoid-break mb-5">
              <h2 className={SECTION_HEAD}>Summary</h2>
              <p className="text-[11px] leading-relaxed text-black whitespace-pre-wrap">{summary}</p>
            </section>
          ) : null}

          {educationBlocks.length > 0 ? (
            <section className="resume-section-avoid-break mb-5">
              <h2 className={SECTION_HEAD}>Education</h2>
              <div className="space-y-3">
                {educationBlocks.map((edu, idx) => (
                  <article key={idx}>
                    {edu.degree ? <p className="text-[12px] font-bold text-black">{edu.degree}</p> : null}
                    {edu.institution ? (
                      <p className="text-[11px] font-semibold mt-0.5" style={{ color: TEAL }}>
                        {edu.institution}
                      </p>
                    ) : null}
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
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {achievements.length > 0 ? (
            <section className="resume-section-avoid-break mb-5">
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
            <section className="resume-section-avoid-break mb-5">
              <h2 className={SECTION_HEAD}>Skills</h2>
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {skillsList.map((label, i) => (
                  <span
                    key={i}
                    className="inline-block text-[11px] text-black border-b border-neutral-400 pb-0.5"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {certificationItems.length > 0 ? (
            <section className="resume-section-avoid-break">
              <h2 className={SECTION_HEAD}>Certification</h2>
              <div className="space-y-3">
                {certificationItems.map((cert, idx) => (
                  <article key={idx}>
                    {cert.title ? (
                      <p className="text-[11px] font-bold" style={{ color: TEAL }}>
                        {cert.title}
                      </p>
                    ) : null}
                    {cert.body ? <p className="mt-1 text-[10px] leading-snug text-black">{cert.body}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
