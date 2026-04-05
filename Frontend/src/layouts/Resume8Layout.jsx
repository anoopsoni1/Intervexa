import {
  Mail,
  MapPin,
  Calendar,
  Link2,
  Linkedin,
  Github,
  Phone,
} from "lucide-react";

import { limitAchievements } from "../utils/resumeAchievements";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col antialiased";

const TEXT = "text-black";
const TEXT_SEC = "text-[#555555]";
const RULE = "bg-black";
const DOTTED = "border-[#cccccc]";
const META_SIZE = "text-[10px] text-[#666666]";

function cleanLink(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function parseExperienceEntry(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    title: lines[0] || "",
    company: lines[1] || "",
    dateLine: lines[2] || "",
    bullets: lines.slice(3),
  };
}

function splitDatesAndLocation(str) {
  if (!str || !String(str).trim()) return { dates: "", location: "" };
  const s = String(str).trim();
  const pipe = s.indexOf("|");
  if (pipe >= 0) {
    return { dates: s.slice(0, pipe).trim(), location: s.slice(pipe + 1).trim() };
  }
  return { dates: s, location: "" };
}

function parseEducationList(education) {
  if (!education || !String(education).trim()) return [];
  const blocks = String(education)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    return {
      degree: lines[0] || "",
      school: lines[1] || "",
      dateLine: lines[2] || "",
    };
  });
}

function getSkillItems(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((skill) => (typeof skill === "string" ? skill : skill?.label || ""))
    .map((s) => s.trim())
    .filter(Boolean);
}

function levelToFilledDots(levelStr) {
  const l = (levelStr || "").toLowerCase();
  if (l.includes("native") || l.includes("fluent") || l.includes("bilingual")) return 5;
  if (l.includes("advanced") || l.includes("proficient") || l.includes("professional")) return 4;
  if (l.includes("intermediate") || l.includes("working")) return 3;
  if (l.includes("basic") || l.includes("elementary") || l.includes("limited")) return 2;
  return 3;
}

function parseLanguagesBlock(raw) {
  const t = (raw || "").toString().trim();
  if (!t) return [];
  const lines = [];
  for (const chunk of t.split(/\n/).map((line) => line.trim()).filter(Boolean)) {
    if (/,.+[–—\-:]/.test(chunk)) {
      chunk.split(",").forEach((s) => {
        const x = s.trim();
        if (x) lines.push(x);
      });
    } else lines.push(chunk);
  }
  const out = [];
  for (const line of lines.length ? lines : [t]) {
    const m = line.match(/^(.+?)\s*[–—:\-]\s*(.+)$/);
    if (m) {
      out.push({
        name: m[1].trim(),
        level: m[2].trim(),
        filled: levelToFilledDots(m[2]),
      });
    } else {
      out.push({ name: line, level: "", filled: 3 });
    }
  }
  return out;
}

function projectToTitleDesc(p) {
  const raw = typeof p === "string" ? p : p?.title || p?.description || "";
  const t = String(raw).trim();
  if (!t) return null;
  const nl = t.indexOf("\n");
  if (nl > 0) {
    return { title: t.slice(0, nl).trim(), desc: t.slice(nl + 1).trim() };
  }
  return { title: t, desc: "" };
}

function SectionRule({ title }) {
  return (
    <div className="mb-2.5">
      <h2 className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] ${TEXT}`}>{title}</h2>
      <div className={`h-[1.5px] w-full mt-1 ${RULE}`} />
    </div>
  );
}

function LangDots({ filled }) {
  return (
    <span className="inline-flex gap-0.5 align-middle ml-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < filled ? "bg-[#555555]" : "bg-[#cccccc]"}`}
        />
      ))}
    </span>
  );
}

/**
 * Resume 8: left — Summary, Achievements, Skills, Certification;
 * right — Education, Experience, Projects.
 */
export default function Resume8Layout({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "").trim();
  const summary = (data?.summary || "").trim();
  const email = (data?.email || "").trim();
  const linkedinRaw = (data?.linkedin || "").trim();
  const linkedin = cleanLink(linkedinRaw);
  const linkedinIsLinkedIn = /linkedin\.com/i.test(linkedinRaw);
  const websiteRaw = (data?.website || "").trim();
  const websiteDisplay = cleanLink(websiteRaw);
  const githubRaw = (data?.github || "").trim();
  const github = cleanLink(githubRaw);
  const phone = (data?.phone || "").trim();
  const location = (data?.location || data?.address || "").trim();

  const experience = (Array.isArray(data?.experience) ? data.experience : [])
    .filter(Boolean)
    .map(parseExperienceEntry)
    .filter((item) => item.title || item.company || item.dateLine || item.bullets.length > 0);

  const educationList = parseEducationList(data?.education);
  const skillItems = getSkillItems(data?.skills);
  const langs = parseLanguagesBlock(data?.languageProficiency);

  const certList = (Array.isArray(data?.certifications) ? data.certifications : [])
    .map((c) => (c != null ? String(c).trim() : ""))
    .filter(Boolean);

  const projects = (Array.isArray(data?.projects) ? data.projects : []).filter(Boolean);
  const projParsed = projects.map(projectToTitleDesc).filter(Boolean);
  const achievementsList = limitAchievements(data?.achievements);

  return (
    <article
      className={`${DOCUMENT_CLASS} max-w-4xl px-0 pt-0 pb-5 sm:pb-6 overflow-hidden print:overflow-visible bg-white print:bg-white text-[11px] leading-[1.45]`}
    >
      {/* Full-bleed header: no horizontal padding on article so black bar spans the full card width */}
      <header className="resume-section-avoid-break w-full mb-4 sm:mb-5 rounded-t-none sm:rounded-t-lg bg-cyan-500 text-white print:bg-cyan-500 border-b border-white/15 print:border-white/20 [print-color-adjust:exact]">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-nowrap sm:items-start sm:justify-between sm:gap-7 print:flex-row print:flex-nowrap print:items-start print:justify-between print:gap-7 px-6 sm:px-8 pt-5 pb-4 sm:pt-6 sm:pb-4 print:px-6 print:pt-5 print:pb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] sm:text-[28px] print:text-[25px] font-bold text-black tracking-[-0.02em] leading-[1.08]">
              {name}
            </h1>
            {role && (
              <>
                <p className="mt-2 text-[10px] sm:text-[11px] font-medium text-black/82 leading-snug tracking-wide print:text-black/88">
                  {role}
                </p>
                <div className="mt-2.5 h-px w-11 bg-black print:bg-black print:w-12" aria-hidden />
              </>
            )}
          </div>
          {(location || email || phone || linkedin || websiteDisplay || github) && (
            <div className="flex w-full min-w-0 flex-col items-end gap-1.5 text-[9px] leading-snug text-black sm:w-auto sm:max-w-[min(100%,19rem)] sm:text-[10px] sm:leading-relaxed print:max-w-76 print:text-[9px] print:gap-1">
              {location && (
                <span className="inline-flex items-start justify-end gap-1.5 text-right">
                  <MapPin color="black" size={12} className="mt-0.5 shrink-0 text-black print:text-black" strokeWidth={1.75} />
                  <span>{location}</span>
                </span>
              )}
              {email && (
                <span className="inline-flex items-center justify-end gap-1.5">
                  <Mail color="black" size={11} className="shrink-0   text-black print:text-black" strokeWidth={1.75} />
                  <span className="break-all text-right">{email}</span>
                </span>
              )}
              {phone && (
                <span className="inline-flex items-center justify-end gap-1.5">
                  <Phone color="black" size={11} className="shrink-0 text-black print:text-black" strokeWidth={1.75} />
                  <span className="text-right tabular-nums">{phone}</span>
                </span>
              )}
              {linkedin && (
                <span className="inline-flex items-center justify-end gap-1.5 min-w-0">
                  {linkedinIsLinkedIn ? (
                    <Linkedin color="black" size={11} className="shrink-0 text-black print:text-black" strokeWidth={1.75} />
                  ) : (
                    <Link2 color="black" size={11} className="shrink-0 text-black print:text-black" strokeWidth={1.75} />
                  )}
                  <span className="break-all text-right">{linkedin}</span>
                </span>
              )}
              {websiteDisplay && (
                <span className="inline-flex items-center justify-end gap-1.5 min-w-0">
                  <Link2 color="black" size={11} className="shrink-0 text-black print:text-black" strokeWidth={1.75} />
                  <span className="break-all text-right">{websiteDisplay}</span>
                </span>
              )}
              {github && (
                <span className="inline-flex items-center justify-end gap-1.5 min-w-0">
                  <Github color="black" size={11} className="shrink-0 text-black print:text-black" strokeWidth={1.75} />
                  <span className="break-all text-right">{github}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.65fr] print:grid-cols-[1fr_1.65fr] gap-6 md:gap-7 print:gap-6 items-start px-6 sm:px-8 print:px-6">
        {/* Left: Summary, Achievements, Skills, Certification */}
        <div className="min-w-0 space-y-6 md:border-r md:border-[#d8d8d8] md:pr-6 print:border-r print:border-[#d8d8d8] print:pr-6">
          {summary && (
            <section className="resume-section-avoid-break">
              <SectionRule title="Summary" />
              <p className={`text-[11px] leading-[1.65] ${TEXT_SEC} text-justify hyphens-auto`}>{summary}</p>
            </section>
          )}

          {achievementsList.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionRule title="Achievements" />
              <ul className="space-y-0 list-none pl-0 text-[11px] text-[#555]">
                {achievementsList.map((a, i) => (
                  <li key={i} className="flex gap-2 leading-snug">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#b8b8b8]" aria-hidden />
                    <span className="min-w-0 wrap-break-word">{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skillItems.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionRule title="Skills" />
              <ul className="m-0 grid grid-cols-2 gap-x-3 gap-y-1.5 p-0 list-none text-[11px] text-[#555] items-start">
                {skillItems.map((s, i) => (
                  <li key={i} className="flex gap-2 min-w-0 leading-snug">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#b8b8b8]" aria-hidden />
                    <span className="min-w-0 wrap-break-word">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {certList.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionRule title="Certification" />
              <div className="space-y-3">
                {certList.map((c, i) => {
                  const lines = c.split("\n").map((l) => l.trim()).filter(Boolean);
                  const head = lines[0] || c;
                  const body = lines.slice(1).join(" ").trim();
                  return (
                    <div key={i} className={`text-[10px] leading-[1.6] ${TEXT_SEC}`}>
                      <p className={`text-[11px] font-bold ${TEXT}`}>{head}</p>
                      {body ? <p className="mt-1.5">{body}</p> : null}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>

        {/* Right: Education, Experience, Projects, Languages */}
        <div className="min-w-0 space-y-6">
          {educationList.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionRule title="Education" />
              <div className="space-y-0">
                {educationList.map((edu, index) => (
                  <div
                    key={index}
                    className={`resume-section-avoid-break ${index < educationList.length - 1 ? `border-b border-dotted ${DOTTED} pb-4 mb-4` : ""}`}
                  >
                    <p className={`text-[12px] font-bold ${TEXT} leading-tight`}>{edu.degree || "Degree"}</p>
                    {edu.school && (
                      <p className={`${TEXT_SEC} mt-1 text-[11px] font-medium`}>{edu.school}</p>
                    )}
                    {edu.dateLine && (
                      <div className={`mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 ${META_SIZE}`}>
                        {(() => {
                          const { dates, location: loc } = splitDatesAndLocation(edu.dateLine);
                          return (
                            <>
                              {dates && (
                                <span className="inline-flex items-center gap-1">
                                  <Calendar size={12} className="text-[#cccccc]" strokeWidth={1.5} />
                                  {dates}
                                </span>
                              )}
                              {loc && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin size={12} className="text-[#cccccc]" strokeWidth={1.5} />
                                  {loc}
                                </span>
                              )}
                              {!dates && !loc && <span>{edu.dateLine}</span>}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionRule title="Experience" />
              <div className="space-y-0">
                {experience.map((item, index) => (
                  <div
                    key={index}
                    className={`resume-section-avoid-break ${index < experience.length - 1 ? `border-b border-dotted ${DOTTED} pb-2 mb-1` : ""}`}
                  >
                    <p className={`text-[12px] font-bold ${TEXT} leading-tight`}>{item.title || "Role"}</p>
                    {item.company && (
                      <p className={`${TEXT_SEC} mt-1 text-[11px] font-medium`}>{item.company}</p>
                    )}
                    {item.dateLine && (
                      <div className={`mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 ${META_SIZE}`}>
                        {(() => {
                          const { dates, location: loc } = splitDatesAndLocation(item.dateLine);
                          return (
                            <>
                              {dates && (
                                <span className="inline-flex items-center gap-1 text-black">
                                  <Calendar size={12} className="text-[#000000]" strokeWidth={1.5} />
                                  {dates}
                                </span>
                              )}
                              {loc && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin size={12} className="text-[#cccccc]" strokeWidth={1.5} />
                                  {loc}
                                </span>
                              )}
                              {!dates && !loc && <span>{item.dateLine}</span>}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    {item.bullets.length > 0 && (
                      <ul className={`mt-2 space-y-0 pl-0 list-none ${TEXT_SEC} text-[11px] leading-[1.55]`}>
                        {item.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2">
                            <span className={`mt-2 h-1 w-1 shrink-0 rounded-full bg-[#b8b8b8]`} />
                            <span className="min-w-0">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projParsed.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionRule title="Projects" />
              <div className="space-y-0">
                {projParsed.map((proj, index) => (
                  <div
                    key={index}
                    className={`resume-section-avoid-break ${index < projParsed.length - 1 ? `border-b border-dotted ${DOTTED} pb-3 mb-3` : ""}`}
                  >
                    <p className={`text-[10px] sm:text-[11px] font-bold ${TEXT} leading-tight`}>{proj.title}</p>
                    {proj.desc ? (
                      <p className={`mt-0.5 text-[9px] sm:text-[10px] leading-normal ${TEXT_SEC}`}>{proj.desc}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {langs.length > 0 && (
            <section className="resume-section-avoid-break">
              <SectionRule title="Languages" />
              <div className="grid grid-cols-1 gap-y-2.5">
                {langs.map((L, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <p className={`text-[11px] font-bold ${TEXT}`}>{L.name}</p>
                    <p className={`flex flex-wrap items-center gap-x-1.5 text-[10px] ${TEXT_SEC}`}>
                      {L.level && <span>{L.level}</span>}
                      <LangDots filled={L.filled} />
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
