import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  FileText,
  LayoutGrid,
  Target,
  Terminal,
  Video,
} from "lucide-react";
import Particles from "../ui/Lighting.jsx";

const CAREER_TOOLS = [
  {
    id: "resume",
    label: "Resume Builder",
    icon: FileText,
    title: "AI-powered resume creation",
    description:
      "Go from a rough draft to an ATS-friendly resume with smart suggestions for impact, keywords, and structure. Pick modern templates and export when you are ready.",
    cta: "Start building",
    to: "/upload",
  },
  {
    id: "ats",
    label: "ATS score & checker",
    icon: Target,
    title: "Know how recruiters see your resume",
    description:
      "Run an ATS-style analysis to spot gaps before you apply. Get a clear score and targeted fixes aligned with how screening systems read your CV.",
    cta: "Check your ATS score",
    to: "/atsscore",
  },
  {
    id: "portfolio",
    label: "Portfolio sites",
    icon: LayoutGrid,
    title: "Showcase projects in minutes",
    description:
      "Turn your experience into a polished portfolio layout. Designed for shareable links and a standout first impression alongside your resume.",
    cta: "Browse portfolio templates",
    to: "/templates",
  },
  {
    id: "interviews",
    label: "Mock interviews",
    icon: Video,
    title: "Practice with AI-driven interviews",
    description:
      "Rehearse video and AI-assisted sessions with feedback on communication and answers. Built for serious prep without the pressure of a real panel.",
    cta: "Open mock interviews",
    to: "/dashboard/interviews",
  },
  {
    id: "coding",
    label: "Coding interview",
    icon: Terminal,
    title: "Technical interview practice that feels real",
    description:
      "Work through coding-style prompts and timed practice flows designed for interview pacing. Build confidence before you face a real whiteboard or shared editor.",
    cta: "Open coding interview",
    to: "/coding-interview",
  },
  {
    id: "guidance",
    label: "Career guidance",
    icon: Compass,
    title: "A clearer path from today to your next role",
    description:
      "Turn goals into steps with structured career guidance and roadmap-style planning. See what to prioritize next — skills, projects, or applications.",
    cta: "View career roadmap",
    to: "/career-roadmap",
  },
];

function BrowserMockup({ active }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/15 bg-slate-950/90 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_25px_60px_-20px_rgba(0,0,0,0.85)]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="mx-2 min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-400 sm:text-xs">
          app.intervexa.co / {active.id}
        </div>
      </div>
      <div className="relative min-h-[200px] p-4 sm:min-h-[240px] sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(99,102,241,0.06))]" />
        {active.id === "resume" && (
          <div className="relative space-y-3">
            <div className="h-2 w-1/3 rounded bg-white/15" />
            <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="h-1.5 w-full rounded bg-white/10" />
              <div className="h-1.5 w-[90%] rounded bg-white/10" />
              <div className="h-1.5 w-4/5 rounded bg-white/10" />
            </div>
            <div className="flex gap-2">
              <div className="h-16 flex-1 rounded-lg border border-cyan-400/20 bg-cyan-500/10" />
              <div className="h-16 flex-1 rounded-lg border border-indigo-400/20 bg-indigo-500/10" />
            </div>
          </div>
        )}
        {active.id === "ats" && (
          <div className="relative flex flex-col items-center justify-center gap-4 pt-2">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/10 border-t-cyan-400 border-r-indigo-400">
              <span className="text-2xl font-bold text-white">88</span>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 sm:text-xs">
                <span>Keywords</span>
                <span className="text-emerald-300">Strong</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-linear-to-r from-cyan-400 to-indigo-400" />
              </div>
            </div>
          </div>
        )}
        {active.id === "portfolio" && (
          <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
            <div className="col-span-2 row-span-2 rounded-lg border border-white/10 bg-linear-to-br from-violet-500/20 to-transparent p-3">
              <div className="h-2 w-1/2 rounded bg-white/20" />
              <div className="mt-4 h-16 rounded bg-white/5" />
            </div>
            <div className="h-16 rounded-lg border border-white/10 bg-black/30" />
            <div className="h-16 rounded-lg border border-white/10 bg-black/30" />
          </div>
        )}
        {active.id === "interviews" && (
          <div className="relative flex flex-col items-center justify-end gap-3 rounded-lg border border-white/10 bg-black/40 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-indigo-500/20 text-white">
              <Video className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <div className="h-1.5 w-24 rounded-full bg-white/15" />
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="h-1 w-4 rounded-full bg-cyan-400/40" />
              ))}
            </div>
          </div>
        )}
        {active.id === "coding" && (
          <div className="relative rounded-lg border border-white/10 bg-black/50 font-mono text-[10px] leading-relaxed text-slate-300 sm:text-[11px]">
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
              <Terminal className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
              <span className="text-slate-400">practice.ts</span>
            </div>
            <div className="space-y-2 p-3">
              <div>
                <span className="text-violet-300">function</span>{" "}
                <span className="text-cyan-200">twoSum</span>
                <span className="text-slate-500">(nums, target) {"{"}</span>
              </div>
              <div className="pl-3 text-slate-500">// your solution…</div>
              <div className="h-1.5 w-2/3 rounded bg-white/10" />
              <div className="h-1.5 w-1/2 rounded bg-white/10" />
              <div className="mt-3 flex gap-2">
                <span className="rounded border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300">
                  Run
                </span>
                <span className="rounded border border-white/15 px-2 py-0.5 text-[9px] text-slate-500">
                  Timer 25:00
                </span>
              </div>
            </div>
          </div>
        )}
        {active.id === "guidance" && (
          <div className="relative space-y-4 rounded-lg border border-white/10 bg-black/35 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/15 text-violet-200">
                <Compass className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-2 w-24 rounded bg-white/15" />
                <div className="mt-1.5 h-1.5 w-32 rounded bg-white/10" />
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-indigo-400/40 pl-4">
              {[
                { w: "w-3/4", on: true },
                { w: "w-2/3", on: false },
                { w: "w-4/5", on: false },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      row.on ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-white/20"
                    }`}
                  />
                  <div className={`h-1.5 rounded bg-white/12 ${row.w}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntervexaOfferings() {
  const reduceMotion = useReducedMotion();
  const [toolIndex, setToolIndex] = useState(0);

  const activeTool = CAREER_TOOLS[toolIndex];
  const ToolIcon = activeTool.icon;

  return (
    <section
      className="relative z-10 border-t border-white/10 py-16 px-4 sm:px-6 lg:py-20 lg:px-10"
      aria-labelledby="intervexa-tools-heading"
    >
        <div
          className="pointer-events-none absolute inset-0 z-0 min-h-full w-full opacity-45 mix-blend-screen"
          aria-hidden
        >
          <Particles
            id="offerings-tools-particles"
            particleColors={["#ffffff", "#818cf8", "#c084fc"]}
            particleCount={100}
            particleSpread={8}
            speed={0.07}
            particleBaseSize={70}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
            pixelRatio={1}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
          aria-hidden
        >
          <div className="absolute right-0 top-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-600/12 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-8xl">
          <h2
            id="intervexa-tools-heading"
            className="mx-auto max-w-2xl text-balance text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            All the career tools you need
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-center text-sm text-slate-400 sm:text-base">
            Intervexa™ bundles resumes, ATS checks, portfolios, mock interviews, coding practice, and
            career guidance in one place.
          </p>

          <div className="mt-8 -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
            {CAREER_TOOLS.map((t, i) => {
              const Icon = t.icon;
              const active = i === toolIndex;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setToolIndex(i)}
                  className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? "border-cyan-300/40 bg-indigo-500/25 text-white shadow-[0_0_24px_-8px_rgba(99,102,241,0.55)]"
                      : "border-white/15 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10"
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="h-4 w-4 shrink-0 text-cyan-200/90" aria-hidden />
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              className="relative mx-auto w-full max-w-lg lg:mx-0"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-linear-to-br from-violet-500/25 via-indigo-500/15 to-cyan-400/20 opacity-80 blur-2xl"
                aria-hidden
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTool.id}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? {} : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <BrowserMockup active={activeTool} />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool.id}
                initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? {} : { opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="text-center lg:text-left"
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-indigo-200">
                  <ToolIcon className="h-3.5 w-3.5" aria-hidden />
                  {activeTool.label}
                </div>
                <h3 className="text-2xl font-semibold text-white sm:text-3xl">{activeTool.title}</h3>
                <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
                  {activeTool.description}
                </p>
                <Link
                  to={activeTool.to}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  {activeTool.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
    </section>
  );
}
