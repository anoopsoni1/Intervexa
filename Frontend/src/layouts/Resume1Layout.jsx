import { Phone, Mail, MapPin, User, GraduationCap, Briefcase, FolderOpen, ListChecks, Award } from "lucide-react";
import { limitAchievements } from "../utils/resumeAchievements";

const DOCUMENT_CLASS =
  "resume-document w-full mx-auto bg-white text-black shadow-2xl rounded-none sm:rounded-lg overflow-visible print:shadow-none print:rounded-none flex-1 min-h-0 flex flex-col";

/** Parse experience entry into job title, company, dates/location line, and bullets */
function parseExperienceEntryDetailed(entry) {
  const lines = (entry || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const jobTitle = lines[0] || "";
  const company = lines[1] || "";
  const datesOrLocation = lines[2] || "";
  const bullets = lines.slice(3);
  return { jobTitle, company, datesOrLocation, bullets };
}

/** Parse education string into degree, institution, dates */
function parseEducation(education) {
  if (!education || !String(education).trim()) return null;
  const lines = education.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    degree: lines[0] || "",
    institution: lines[1] || "",
    dates: lines[2] || "",
  };
}

/** Resume 1: two-column classic (blue left with contact/about/skills, white right with purple accent, education/experience/projects). */
export default function Resume1Layout({ data }) {
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skillsList = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const educationParsed = parseEducation(data?.education);
  const experienceEntries = (data?.experience || []).map((e) => parseExperienceEntryDetailed(e));
  const achievementsList = limitAchievements(data?.achievements);

  return (
    <article className={`${DOCUMENT_CLASS} max-w-4xl flex flex-col md:flex-row print:flex-row overflow-visible`}>
      {/* Left column: solid dark blue – name, title, contact, ABOUT ME, ACHIEVEMENTS, SKILLS */}
      <div className="w-full md:w-[36%] print:w-[36%] min-h-full flex flex-col bg-[#1e3a5f] print:bg-[#1e3a5f] text-white overflow-visible">
        {/* Header: name + title + contact directly below */}
        <div className="pt-0 pb-4 px-4 sm:px-5 border-b border-white/10">
          <h1 className="text-2xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{name}</h1>
          <p className="mt-1 text-sm text-zinc-300 font-medium">{role}</p>
          <div className="mt-2.5 space-y-1 text-[11px] text-zinc-200">
            {data?.phone && (
              <p className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-white" /> {data.phone}
              </p>
            )}
            {data?.email && (
              <p className="flex items-center gap-2 break-all">
                <Mail size={14} className="shrink-0 text-white" /> {data.email}
              </p>
            )}
            {(data?.location || data?.address) && (
              <p className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-white" /> {data.location || data.address}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 sm:px-5 pt-3 pb-5 space-y-4">
          {summary && (
            <section>
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white mb-2">
                <User size={14} className="shrink-0 text-white" /> About Me
              </h2>
              <p className="text-[11px] text-zinc-200 leading-snug">{summary}</p>
            </section>
          )}

          {achievementsList.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white mb-2.5">
                <Award size={14} className="shrink-0 text-white" /> Achievements
              </h2>
              <ul className="space-y-0 list-none pl-0 text-[11px] text-zinc-200">
                {achievementsList.map((a, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-1.5" aria-hidden />
                    <span className="whitespace-pre-wrap wrap-break-word">{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white mb-2.5">
              <ListChecks size={14} className="shrink-0 text-white" /> Skills
            </h2>
            {skillsList.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-zinc-200 list-none pl-0">
                {skillsList.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2" aria-hidden />
                    <span className="leading-snug wrap-break-word">{typeof s === "string" ? s : s?.label ?? ""}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-400 italic">Add your skills in your details.</p>
            )}
          </section>
        </div>
      </div>

      {/* Right column: purple top line, education, experience, projects */}
      <div className="w-full md:w-[64%] print:w-[64%] min-h-0 flex flex-col bg-white print:bg-white overflow-visible relative">
        <div className="h-1 bg-violet-600 print:bg-violet-600 shrink-0" aria-hidden />

        <div className="flex-1 px-4 sm:px-5 py-3 space-y-4">
          {(data?.education || educationParsed) && (
            <section>
              <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-800 pb-1 mb-2 border-b border-zinc-300">
                <GraduationCap size={12} className="shrink-0 text-[#1e3a5f]" /> Education
              </h2>
              <div className="space-y-2">
                {educationParsed ? (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5">
                    <div>
                      <p className="text-[10px] font-bold text-black leading-snug">{educationParsed.degree}</p>
                      <p className="text-[10px] text-zinc-700 leading-snug">{educationParsed.institution}</p>
                    </div>
                    {educationParsed.dates && (
                      <span className="text-[9px] text-zinc-500 shrink-0 sm:mt-0 mt-0.5">{educationParsed.dates}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-700 whitespace-pre-wrap leading-snug">{data.education}</p>
                )}
              </div>
            </section>
          )}

          {experienceEntries.length > 0 && (
            <section>
              <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-800 pb-1 mb-2 border-b border-zinc-300">
                <Briefcase size={12} className="shrink-0 text-[#1e3a5f]" /> Experience
              </h2>
              <div className="space-y-1">
                {experienceEntries.map((entry, i) => (
                  <div key={i} className="flex flex-col sm:flex-col sm:items-start sm:justify-between gap-0.5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-black leading-snug">{entry.jobTitle || "Role"}</p>
                      {entry.company && <p className="text-[10px] text-zinc-700 leading-snug">{entry.company}</p>}
                      {entry.bullets.length > 0 && (
                        <ul className="mt-1 space-y-0.5 list-none pl-0 text-[10px] text-zinc-700">
                          {entry.bullets.map((b, j) => (
                            <li key={j} className="flex gap-1.5 leading-snug">
                              <span className="w-1 h-1 rounded-full bg-[#1e3a5f] shrink-0 mt-1.5" aria-hidden />
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {entry.datesOrLocation && (
                      <span className="text-[9px] text-zinc-500 shrink-0 sm:mt-0 mt-0.5">{entry.datesOrLocation}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(data?.projects?.length > 0) && (
            <section>
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800 pb-1.5 mb-3 border-b border-zinc-300">
                <FolderOpen size={14} className="shrink-0 text-[#1e3a5f]" /> Projects
              </h2>
              <ul className="space-y-1 list-none pl-0">
                {data.projects.filter(Boolean).map((project, i) => (
                  <li key={i} className="flex gap-2 text-[11px] text-zinc-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] shrink-0 mt-1.5" aria-hidden />
                    <span className="whitespace-pre-wrap">{typeof project === "string" ? project : project?.title || project?.description || ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
