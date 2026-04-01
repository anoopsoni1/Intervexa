import React from "react";
import { motion } from "framer-motion";
import { FiLayers, FiCode, FiAlertCircle, FiBook, FiClock, FiExternalLink } from "react-icons/fi";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function getDifficultyColor(diff) {
  const d = (diff || "").toLowerCase();
  if (d.includes("beginner") || d.includes("easy")) return "bg-emerald-500/30 text-emerald-200 border-emerald-500/50";
  if (d.includes("intermediate") || d.includes("medium")) return "bg-amber-500/30 text-amber-200 border-amber-500/50";
  if (d.includes("advanced") || d.includes("hard")) return "bg-rose-500/30 text-rose-200 border-rose-500/50";
  return "bg-slate-600/80 text-slate-300 border-slate-500/50";
}

export default function RoadmapResult({ data }) {
  if (!data) return null;

  const {
    phases = [],
    projects = [],
    missingSkills = [],
    learningResources = [],
  } = data;

  const hasAny =
    (Array.isArray(phases) && phases.length > 0) ||
    (Array.isArray(projects) && projects.length > 0) ||
    (Array.isArray(missingSkills) && missingSkills.length > 0) ||
    (Array.isArray(learningResources) && learningResources.length > 0);

  if (!hasAny) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center">
        <p className="text-slate-400 font-medium">No roadmap content was generated.</p>
        <p className="text-slate-500 text-sm mt-2">Click &quot;New roadmap&quot; and try again with your career goal and skills.</p>
      </div>
    );
  }

  // Limit items so everything fits on one page
  const phasesSlice = Array.isArray(phases) ? phases.slice(0, 4) : [];
  const projectsSlice = Array.isArray(projects) ? projects.slice(0, 3) : [];
  const skillsSlice = Array.isArray(missingSkills) ? missingSkills.slice(0, 8) : [];
  const resourcesSlice = Array.isArray(learningResources) ? learningResources.slice(0, 3) : [];

  return (
    <motion.div
      className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 sm:p-6 lg:p-8 min-h-0 overflow-hidden text-slate-100 antialiased"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Learning Phases — top-left */}
      {phases.length > 0 && (
        <motion.section
          variants={item}
          className="flex flex-col min-h-0 rounded-2xl border border-slate-700/60 bg-slate-900/95 overflow-hidden shadow-xl shadow-black/40"
        >
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/90 shrink-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/25 border border-amber-500/50 text-amber-400">
              <FiLayers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Learning phases</h3>
              <p className="text-sm text-slate-400 mt-0.5 font-medium">{phases.length} phases · follow in order</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-4">
            <ul className="h-full flex flex-col gap-3">
              {phasesSlice.map((phase, i) => (
                <motion.li
                  key={i}
                  variants={item}
                  className="flex gap-3 shrink-0 rounded-xl border border-slate-700/50 bg-slate-800/70 p-3.5 hover:border-amber-500/40 hover:bg-slate-800/90 transition-all duration-200"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/30 border border-amber-500/50 text-sm font-bold text-amber-200">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-white">{phase.title}</h4>
                      {phase.duration && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/80 px-2.5 py-1 text-xs font-medium text-slate-300">
                          <FiClock className="w-3 h-3" />
                          {phase.duration}
                        </span>
                      )}
                    </div>
                    {phase.description && (
                      <p className="text-sm text-slate-300 leading-relaxed mt-1 line-clamp-2 font-medium">
                        {phase.description}
                      </p>
                    )}
                    {Array.isArray(phase.skills) && phase.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {phase.skills.slice(0, 3).map((skill, j) => (
                          <span
                            key={j}
                            className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200 border border-amber-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}

      {/* Projects — top-right */}
      {projects.length > 0 && (
        <motion.section
          variants={item}
          className="flex flex-col min-h-0 rounded-2xl border border-slate-700/60 bg-slate-900/95 overflow-hidden shadow-xl shadow-black/40"
        >
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/90 shrink-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/25 border border-emerald-500/50 text-emerald-400">
              <FiCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Projects to build</h3>
              <p className="text-sm text-slate-400 mt-0.5 font-medium">Portfolio projects</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-4">
            <ul className="h-full flex flex-col gap-3">
              {projectsSlice.map((project, i) => (
                <motion.li
                  key={i}
                  variants={item}
                  className="shrink-0 rounded-xl border border-slate-700/50 bg-slate-800/70 p-3.5 hover:border-emerald-500/40 hover:bg-slate-800/90 transition-all duration-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">{project.title}</h4>
                    {project.difficulty && (
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getDifficultyColor(
                          project.difficulty
                        )}`}
                      >
                        {project.difficulty}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-300 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                      {project.description}
                    </p>
                  )}
                  {Array.isArray(project.skills) && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.skills.slice(0, 3).map((skill, j) => (
                        <span
                          key={j}
                          className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-200 border border-emerald-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}

      {/* Missing skills — bottom-left */}
      {missingSkills.length > 0 && (
        <motion.section
          variants={item}
          className="flex flex-col min-h-0 rounded-2xl border border-slate-700/60 bg-slate-900/95 overflow-hidden shadow-xl shadow-black/40"
        >
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/90 shrink-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/25 border border-rose-500/50 text-rose-400">
              <FiAlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Skills to learn</h3>
              <p className="text-sm text-slate-400 mt-0.5 font-medium">Focus areas</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-4">
            <div className="flex flex-wrap gap-2 content-start">
              {skillsSlice.map((skill, i) => (
                <motion.span
                  key={i}
                  variants={item}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-2 text-sm font-semibold text-rose-200 shrink-0 hover:border-rose-500/50 hover:bg-rose-500/25 transition-colors"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Learning resources — bottom-right */}
      {learningResources.length > 0 && (
        <motion.section
          variants={item}
          className="flex flex-col min-h-0 rounded-2xl border border-slate-700/60 bg-slate-900/95 overflow-hidden shadow-xl shadow-black/40"
        >
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/90 shrink-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/25 border border-indigo-500/50 text-indigo-400">
              <FiBook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Learning resources</h3>
              <p className="text-sm text-slate-400 mt-0.5 font-medium">Curated links</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-4">
            <ul className="space-y-3">
              {resourcesSlice.map((group, i) => (
                <motion.li key={i} variants={item} className="rounded-xl border border-slate-700/50 bg-slate-800/70 p-3 hover:border-indigo-500/40 transition-colors">
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    {group.skill}
                  </h4>
                  {Array.isArray(group.resources) && group.resources.length > 0 ? (
                    <ul className="space-y-1.5">
                      {group.resources.slice(0, 2).map((r, j) => (
                        <li key={j}>
                          <a
                            href={r.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/80 px-3 py-2.5 text-sm font-medium text-indigo-200 hover:border-indigo-500/50 hover:bg-indigo-500/20 hover:text-indigo-100 transition-all duration-200 group"
                          >
                            <FiExternalLink className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100" />
                            <span className="truncate flex-1">{r.title || "Resource"}</span>
                            {r.type && (
                              <span className="shrink-0 text-xs text-slate-400">({r.type})</span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-sm font-medium">No resources listed.</p>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
