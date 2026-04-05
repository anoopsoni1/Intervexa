/**
 * Premium layout 2 — Wharton / Ivy-style single column: Source Serif 4, tight spacing,
 * uppercase section titles with full-width rules, centered contact under name.
 */

import { limitAchievements } from "../utils/resumeAchievements";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none  flex-1 min-h-0 flex flex-col antialiased";

const DOC_FONT = { fontFamily: "var(--font-resume-premium-2)" };

function parseExperienceEntryDetailed(entry) {
  if (typeof entry === "object" && entry !== null) {
    return {
      jobTitle: entry.role || entry.jobTitle || "",
      company: entry.company || "",
      datesOrLocation: entry.dates || entry.datesOrLocation || "",
      bullets: Array.isArray(entry.bullets) ? entry.bullets.filter(Boolean) : [],
    };
  }
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    jobTitle: lines[0] || "",
    company: lines[1] || "",
    datesOrLocation: lines[2] || "",
    bullets: lines.slice(0).map((b) => b.replace(/^\s*[•\-]\s*/, "").trim()).filter(Boolean),
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

function parseEducationBlocks(education) {
  if (!education || !String(education).trim()) return [];
  const raw = String(education).trim();
  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    return {
      degree: lines[0] || "",
      institution: lines[1] || "",
      meta: lines[2] || "",
      rest: lines.slice(2),
    };
  });
}

function skillLabel(s) {
  if (s == null) return "";
  return typeof s === "string" ? s : s?.label ?? s?.name ?? "";
}

function parseProjectBlock(p) {
  if (typeof p === "string") {
    const lines = p.split("\n").map((l) => l.trim()).filter(Boolean);
    return { title: lines[0] || "", bullets: lines.slice(0) };
  }
  const title = String(p?.title || "").trim();
  const desc = p?.description;
  let bullets = [];
  if (Array.isArray(desc)) bullets = desc.map((x) => String(x).trim()).filter(Boolean);
  else if (typeof desc === "string")
    bullets = desc.split("\n").map((l) => l.trim()).filter(Boolean);
  const fallback = String(p?.title || p?.description || "").trim();
  if (!title && !bullets.length && fallback) {
    const lines = fallback.split("\n").map((l) => l.trim()).filter(Boolean);
    return { title: lines[0] || "", bullets: lines.slice(1) };
  }
  return { title, bullets };
}

function SectionRule({ title, children }) {
  if (children == null) return null;
  return (
    <section className="mb-2 print:mb-1.5 print:m-2 resume-section-avoid-break">
      <h2
        className="text-[12px] font-bold uppercase tracking-wide text-black mb-0 leading-none"
        style={DOC_FONT}
      >
        {title}
      </h2>
      <hr className="border-0 border-t border-black m-0 mt-0.5 mb-1" />
      <div className="text-[11px] leading-[1.28] text-black" style={DOC_FONT}>
        {children}
      </div>
    </section>
  );
}

function ExperienceWhartonRow({ company, title, location, dates, bullets }) {
  const head = [company, title, location].filter(Boolean).join(", ");
  return (
    <div className="mb-1.5 last:mb-0 resume-section-avoid-break">
      <div className="flex flex-wrap justify-between gap-x-2 gap-y-0 text-[11px] leading-tight">
        <span className="font-bold min-w-0 flex-1">{head || title || company || "Role"}</span>
        {dates ? (
          <span className="font-bold shrink-0 whitespace-nowrap text-right">{dates}</span>
        ) : null}
      </div>
      {bullets.length > 0 ? (
        <ul className="mt-0.5 mb-0 ml-3 list-disc pl-0.5 space-y-0 text-[10px] leading-[1.28]">
          {bullets.map((b, i) => (
            <li key={i} className="pl-0.5">
              {typeof b === "string" ? b : String(b)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function PremiumLayout2({ data }) {
  const name = (data?.name || "Your Name").trim();
  const role = (data?.role || "").trim();
  const email = (data?.email || "").trim();
  const phone = (data?.phone || "").trim();
  const location = (data?.location || "").trim();
  const address = (data?.address || "").trim();
  const showAddrLine = address && address !== location;

  const educationBlocks = parseEducationBlocks(data?.education);
  const experienceEntries = (Array.isArray(data?.experience) ? data.experience : []).map((e) =>
    parseExperienceEntryDetailed(e)
  );
  const projects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const achievementsLines = limitAchievements(data?.achievements);

  const skillsRaw = Array.isArray(data?.skills) ? data.skills : [];
  const skillStrings = skillsRaw.map(skillLabel).filter(Boolean);
  const langRaw = (data?.languageProficiency || "").toString().trim();
  const langOneLine = langRaw.replace(/\n+/g, ", ").replace(/\s+/g, " ").trim();
  const passions = (data?.passions != null ? String(data.passions).trim() : "") || "";

  const mailHref = email ? `mailto:${email.replace(/^mailto:/i, "")}` : "";

  return (
    <article
      className={`${DOCUMENT_CLASS} max-w-3xl px-3 py-3 sm:px-4 sm:py-3 print:px-2 print:py-2 print:max-w-none bg-white text-black`}
      style={DOC_FONT}
    >
      <header className="text-center print:mt-2 print:mb-1.5 resume-section-avoid-break">
        <h1 className="text-[10px] sm:text-[18px] font-bold tracking-tight text-black mt-2 leading-tight">{name}</h1>
        {role ? <p className="text-[10px] italic text-black mt-0.5 leading-snug">{role}</p> : null}
        {(email || phone) && (
          <p className="mt-1 text-[10px] leading-snug text-black">
            {email ? (
              <a href={mailHref} className="text-blue-700 underline decoration-blue-700 print:text-black print:underline">
                {email}
              </a>
            ) : null}
            {email && phone ? <span className="mx-1 select-none">|</span> : null}
            {phone ? <span>{phone}</span> : null}
          </p>
        )}
        {location ? <p className="text-[10px] leading-snug mt-0.5">{location}</p> : null}
        {showAddrLine ? <p className="text-[9px] leading-snug mt-0.5">{address}</p> : null}
        {data?.linkedin || data?.website || data?.github ? (
          <p className="text-[9px] mt-0.5 break-all">
            {data?.linkedin ? (
              <a
                href={String(data.linkedin).startsWith("http") ? data.linkedin : `https://${data.linkedin}`}
                className="text-blue-700 underline print:text-black"
                target="_blank"
                rel="noreferrer"
              >
                {String(data.linkedin).replace(/^https?:\/\//i, "")}
              </a>
            ) : null}
            {data?.linkedin && (data?.website || data?.github) ? " · " : null}
            {data?.website ? (
              <a
                href={String(data.website).startsWith("http") ? data.website : `https://${data.website}`}
                className="text-blue-700 underline print:text-black"
                target="_blank"
                rel="noreferrer"
              >
                {String(data.website).replace(/^https?:\/\//i, "")}
              </a>
            ) : null}
            {(data?.linkedin || data?.website) && data?.github ? " · " : null}
            {data?.github ? (
              <a
                href={String(data.github).startsWith("http") ? data.github : `https://${data.github}`}
                className="text-blue-700 underline print:text-black"
                target="_blank"
                rel="noreferrer"
              >
                {String(data.github).replace(/^https?:\/\//i, "")}
              </a>
            ) : null}
          </p>
        ) : null}
      </header>

      {educationBlocks.length > 0 ? (
        <SectionRule title="Education">
          <div className="space-y-1.5">
            {educationBlocks.map((ed, idx) => {
              const { dates, location: loc } = splitDatesAndLocation(ed.meta);
              const leftInst =
                [ed.institution, ed.degree].filter(Boolean).join(" — ") || ed.degree || ed.institution;
              return (
                <div key={idx} className="resume-section-avoid-break">
                  <div className="flex flex-wrap justify-between gap-x-2 gap-y-0 text-[9px] leading-tight">
                    <span className="font-bold min-w-0">{leftInst}</span>
                    <span className="font-bold shrink-0 whitespace-nowrap text-right">{loc || dates || ed.meta}</span>
                  </div>
                  {ed.rest.length > 0 ? (
                    <ul className="mt-0.5 ml-3 list-disc pl-0.5 space-y-0 text-[9px] leading-[1.28]">
                      {ed.rest.map((line, i) => (
                        <li key={i} className="italic pl-0.5">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SectionRule>
      ) : null}

      {experienceEntries.some((e) => e.company || e.jobTitle || e.bullets.length || e.datesOrLocation) ? (
        <SectionRule title="Professional Experience">
          <div>
            {experienceEntries.map((entry, i) => {
              const { dates, location: loc } = splitDatesAndLocation(entry.datesOrLocation);
              return (
                <ExperienceWhartonRow
                  key={i}
                  company={entry.company}
                  title={entry.jobTitle}
                  location={loc}
                  dates={dates || (!loc ? entry.datesOrLocation : "")}
                  bullets={entry.bullets}
                />
              );
            })}
          </div>
        </SectionRule>
      ) : null}

      {projects.length > 0 ? (
        <SectionRule title="Projects ">
          <div className="text-[10px] leading-[1.28]">
            {projects.map((p, i) => {
              const { title, bullets } = parseProjectBlock(p);
              return (
                <ExperienceWhartonRow
                  key={i}
                  company={title}
                  title=""
                  location=""
                  dates=""
                  bullets={bullets.length ? bullets : title ? [] : []}
                />
              );
            })}
          </div>
        </SectionRule>
      ) : null}

      {achievementsLines.length > 0 ? (
        <SectionRule title="Honors and Awards">
          <ul className="ml-3 list-disc pl-0.5 space-y-0.5 text-[10px] leading-[1.28]">
            {achievementsLines.map((line, i) => (
              <li key={i} className="pl-0.5 resume-section-avoid-break">
                {line}
              </li>
            ))}
          </ul>
        </SectionRule>
      ) : null}

      {langOneLine || skillStrings.length > 0 || passions ? (
        <SectionRule title="Skills and Interests">
          <div className="space-y-1">
            {langOneLine ? (
              <p className="text-[10px] leading-[1.35]">
                <span className="font-bold text-[10.5px]">Language:</span> {langOneLine}
              </p>
            ) : null}
            {skillStrings.length > 0 ? (
              <p className="text-[10px] leading-[1.35]">
                <span className="font-bold text-[10.5px]">Skills:</span> {skillStrings.join(", ")}
              </p>
            ) : null}
            {passions ? (
              <p className="text-[10px] leading-[1.35]">
                <span className="font-bold text-[10.5px]">Interests:</span>{" "}
                {passions
                  .split(/\n/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .join(" | ")}
              </p>
            ) : null}
          </div>
        </SectionRule>
      ) : null}
    </article>
  );
}
