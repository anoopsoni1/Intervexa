import { motion, useReducedMotion } from "framer-motion";
import {
  FileText,
  Sparkles,
  LayoutTemplate,
  Download,
} from "lucide-react";
const FEATURES = [
  {
    icon: FileText,
    title: "Clear sections hiring teams expect",
    description:
      "Build summary, experience, skills, and education in order so your story is easy to scan and works with common hiring software.",
  },
  {
    icon: Sparkles,
    title: "AI tips for stronger lines",
    description:
      "Turn vague bullets into clear wins with stronger verbs, numbers where they help, and wording that fits the jobs you want.",
  },
  {
    icon: LayoutTemplate,
    title: "Layouts that look sharp in print",
    description:
      "Choose templates with readable type and spacing. Switch designs anytime without retyping your content.",
  },
  {
    icon: Download,
    title: "Download and apply today",
    description:
      "Export a neat PDF when you are ready. Adjust, download, and attach to applications in minutes.",
  },
];

export default function ResumeSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative z-10 border-t border-white/10 py-16 px-4 sm:px-6 lg:px-10"
      aria-labelledby="resume-section-heading"
    >
      <div className="mx-auto max-w-8xl">
        <motion.p
          className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/90"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
        >
          Resume builder
        </motion.p>

        <motion.h2
          id="resume-section-heading"
          className="mx-auto mt-4 max-w-3xl text-center text-balance text-3xl font-semibold tracking-tight text-white"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.05, duration: 0.5 }}
        >
          Build a strong{" "}
          <span className="bg-linear-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
            resume
          </span>{" "}
          fast—and download when you are done
        </motion.h2>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Features */}
          <motion.div
            className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none"
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5">
              {FEATURES.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={`resume-feature-${index}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    delay: reduceMotion ? 0 : 0.06 + index * 0.06,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={
                    reduceMotion
                      ? {}
                      : {
                          y: -4,
                          borderColor: "rgba(103, 232, 249, 0.35)",
                          boxShadow: "0 20px 45px -28px rgba(99, 102, 241, 0.45)",
                        }
                  }
                  className="group flex flex-col items-center rounded-2xl border border-white/10 bg-black/35 p-5 text-center shadow-[0_20px_50px_-24px_rgba(0,0,0,0.75)] backdrop-blur-md transition-colors duration-300 sm:items-start sm:text-left"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-indigo-500/15 text-cyan-200 shadow-inner transition duration-300 group-hover:border-cyan-300/25 group-hover:bg-indigo-500/25">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="font-medium text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Resume preview */}
          <motion.div
            className="relative mx-auto flex w-full max-w-md justify-center lg:mx-0 lg:max-w-lg lg:justify-end"
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={
                reduceMotion
                  ? {}
                  : { opacity: [0.4, 0.65, 0.4], scale: [1, 1.06, 1] }
              }
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,440px)] w-[min(100%,400px)] -translate-x-1/2 -translate-y-1/2 rounded-4xl bg-linear-to-br from-indigo-500/30 via-violet-500/18 to-cyan-400/22 blur-3xl"
              aria-hidden
            />

            <motion.div
              whileHover={reduceMotion ? {} : { y: -6, scale: 1.02, rotate: 0.25 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="relative w-full overflow-hidden rounded-3xl border border-white/20 bg-linear-to-br from-indigo-500/10 via-slate-900/80 to-cyan-500/10 p-6 shadow-2xl shadow-indigo-900/50 backdrop-blur-xl sm:p-7"
            >
              <div
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/50 to-transparent"
                aria-hidden
              />
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/20 blur-2xl" aria-hidden />
              <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-cyan-400/15 blur-2xl" aria-hidden />

              <div className="relative flex min-h-[280px] gap-0 sm:min-h-[300px]">
                {/* Before */}
                <div className="min-w-0 flex-1 space-y-3 pr-3 text-[10px] leading-snug text-slate-500 sm:text-[11px]">
                  <p className="font-bold uppercase tracking-wider text-slate-400">
                    Jane Doe
                  </p>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-slate-500">
                      Objective
                    </p>
                    <p className="mt-1 line-clamp-3">
                      Seeking role. Good worker. Many skills and experience…
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-slate-500">
                      Work experience
                    </p>
                    <p className="mt-1 line-clamp-2">
                      Company — did stuff, helped team, used tools.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-slate-500">
                      Education
                    </p>
                    <p className="mt-1">University — Degree</p>
                  </div>
                </div>

                <div
                  className="w-1 shrink-0 rounded-full bg-linear-to-b from-cyan-400 via-indigo-500 to-violet-500 shadow-[0_0_14px_rgba(99,102,241,0.55)]"
                  aria-hidden
                />

                {/* After */}
                <div className="min-w-0 flex-1 space-y-3 pl-3 text-[10px] leading-snug text-slate-100 sm:text-[11px]">
                  <p className="font-bold uppercase tracking-wider text-white">
                    Jane Doe
                  </p>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-cyan-300">
                      Objective
                    </p>
                    <p className="mt-1 line-clamp-3 font-medium text-slate-200">
                      Product-minded engineer driving measurable outcomes through
                      clear communication and ownership.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-cyan-300">
                      Work experience
                    </p>
                    <p className="mt-1 line-clamp-2 font-medium text-slate-200">
                      Acme Inc. — Led migration (−32% latency); mentored 4
                      engineers.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-cyan-300">
                      Education
                    </p>
                    <p className="mt-1 font-medium text-slate-200">
                      State University — B.S. Computer Science
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
