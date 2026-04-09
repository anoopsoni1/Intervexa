import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  Briefcase,
  Code2,
  Compass,
  Globe,
  LayoutGrid,
  Layers,
  Lightbulb,
  Map,
  MessageCircle,
  MessageSquare,
  Mic,
  Palette,
  Terminal,
  Timer,
  Video,
} from "lucide-react";
/** Four career-guidance cards (2×2) in the roadmap section—same visual pattern as the product reference card. */
const CAREER_GUIDANCE_BOXES = [
  {
    icon: Compass,
    title: "Career suggestions that become a plan",
    description:
      "Map skills, milestones, and next moves in one roadmap view. Intervexa™ turns broad goals into steps you can act on—not a wall of generic advice.",
    cta: "Open career roadmap",
    to: "/career-roadmap",
  },
  {
    icon: Map,
    title: "From today’s role to your next title",
    description:
      "Plot a realistic lane change: seniority, industry, or specialty—with checkpoints so you are not guessing what comes first.",
    cta: "Shape your path",
    to: "/career-roadmap",
  },
  {
    icon: Lightbulb,
    title: "Skills the market actually asks for",
    description:
      "Cross-check learning time with job descriptions you save. Focus on gaps recruiters screen for, not random tutorial rabbit holes.",
    cta: "Prioritize skills",
    to: "/career-roadmap",
  },
  {
    icon: Briefcase,
    title: "A narrative that fits the roles you want",
    description:
      "Align your headline, bullets, and proof so hiring managers see one coherent arc—from past wins to the job you are targeting next.",
    cta: "Sharpen your story",
    to: "/career-roadmap",
  },
];

const AI_INTERVIEW_BOXES = [
  {
    icon: Bot,
    title: "AI interviews you can run on your schedule",
    description:
      "Practice with paced questions and room to think out loud. Rehearse before a real panel without coordinating calendars or burning favors.",
    cta: "Start AI interviews",
    to: "/dashboard/interviews",
  },
  {
    icon: Mic,
    title: "Speak answers, not just think them",
    description:
      "Get comfortable hearing your own phrasing—filler words, pacing, and structure—before a human interviewer evaluates the same audio.",
    cta: "Practice speaking",
    to: "/dashboard/interviews",
  },
  {
    icon: Video,
    title: "Session flow that feels like a real loop",
    description:
      "Move through screens-style prompts and transitions so the rhythm of a long interview day is less of a shock the first time you live it.",
    cta: "Open mock interviews",
    to: "/dashboard/interviews",
  },
  {
    icon: MessageSquare,
    title: "Behavioral and role-style prompts",
    description:
      "Swap generic worry for targeted practice—stories, trade-offs, and follow-ups aligned with how hiring managers actually probe.",
    cta: "Browse sessions",
    to: "/dashboard/interviews",
  },
];

const CODING_INTERVIEW_BOXES = [
  {
    icon: Terminal,
    title: "Leetcode-style flow with real interview timing",
    description:
      "Editor practice plus a clock that matches on-site pressure. Build the habit of coding and explaining before the hiring loop tightens.",
    cta: "Open coding practice",
    to: "/coding-interview",
  },
  {
    icon: Code2,
    title: "Patterns you will recognize under stress",
    description:
      "Revisit data structures and problem shapes in a focused environment—fewer surprises when the prompt is new but the shape is familiar.",
    cta: "Start a problem set",
    to: "/coding-interview",
  },
  {
    icon: Timer,
    title: "A clock you train with, not against",
    description:
      "See how forty-five minutes actually feels while you type, debug, and summarize—so budget during the real loop is instinctive.",
    cta: "Timed practice",
    to: "/coding-interview",
  },
  {
    icon: MessageCircle,
    title: "Code plus narration, together",
    description:
      "Practice the double track panels expect: working solution and a clear play-by-play—so your silent IDE habit does not cost you onsite.",
    cta: "Try narrated run",
    to: "/coding-interview",
  },
];

const PORTFOLIO_BOXES = [
  {
    icon: LayoutGrid,
    title: "Portfolio builder that matches your resume",
    description:
      "Ship a shareable project page with clean hierarchy and strong type—something recruiters can open beside your CV in one click.",
    cta: "Browse portfolio templates",
    to: "/templates",
  },
  {
    icon: Palette,
    title: "Layouts built for scan-first readers",
    description:
      "Choose sections and spacing that reward a ten-second skim—headline, proof, links—without fighting the browser default look.",
    cta: "See designs",
    to: "/templates",
  },
  {
    icon: Globe,
    title: "One link worth sending",
    description:
      "Replace a buried GitHub profile with a single URL that frames your work the way you would in a conversation.",
    cta: "Share your page",
    to: "/templates",
  },
  {
    icon: Layers,
    title: "Projects that read like a product story",
    description:
      "Stack case study, stack, and outcomes in order so each build reinforces the narrative your resume already started.",
    cta: "Build a case study",
    to: "/templates",
  },
];

const PLATFORM_FEATURE_BOXES_BY_ID = {
  career: CAREER_GUIDANCE_BOXES,
  "ai-interview": AI_INTERVIEW_BOXES,
  coding: CODING_INTERVIEW_BOXES,
  portfolio: PORTFOLIO_BOXES,
};

const PARTS = [
  {
    id: "career",
    kicker: "Career roadmap",
    headline: (
      <>
        Turn vague goals into a path you can{" "}
        <span className="bg-linear-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
          follow
        </span>
      </>
    ),
    to: "/career-roadmap",
    image: "/landing/platform-career.svg",
    imageAlt: "Stylized career roadmap with milestones and a winding path",
    preview: {
      leftCaption: "Before",
      rightCaption: "With Intervexa™",
      hint: "Career roadmap",
      rows: [
        {
          label: "Clarity",
          before: "Vague north star—“better job,” no milestones or dates.",
          after: "Roadmap turns intent into ordered steps you can execute weekly.",
        },
        {
          label: "Alignment",
          before: "Skills you learn don’t match postings you actually want.",
          after: "Suggestions tied to target roles: gaps, proof, and priority.",
        },
        {
          label: "Next move",
          before: "You stop because “what now?” has no obvious answer.",
          after: "The next action is explicit: project, bullet, or application wave.",
        },
      ],
    },
  },
  {
    id: "ai-interview",
    kicker: "AI interview",
    headline: (
      <>
        Practice answers before a real panel{" "}
        <span className="bg-linear-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
          sees you
        </span>
      </>
    ),
    to: "/dashboard/interviews",
    image: "/landing/platform-ai-interview.svg",
    imageAlt: "Illustration of an AI interview session with audio levels",
    preview: {
      leftCaption: "Before",
      rightCaption: "With Intervexa™",
      hint: "AI interview",
      rows: [
        {
          label: "Cadence",
          before: "One cram session the night before.",
          after: "Repeated reps on your own clock.",
        },
        {
          label: "Pressure",
          before: "First real answer is in the actual interview.",
          after: "Warm up with AI so the first live answer hits cleaner.",
        },
        {
          label: "Focus",
          before: "Generic “tell me about yourself” loops in your head.",
          after: "Structured prompts that mirror real screens.",
        },
      ],
    },
  },
  {
    id: "coding",
    kicker: "Coding interview",
    headline: (
      <>
        Code under a clock that feels like the{" "}
        <span className="bg-linear-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
          real room
        </span>
      </>
    ),
    to: "/coding-interview",
    image: "/landing/platform-coding.svg",
    imageAlt: "Code editor window with timer and run control for interview practice",
    preview: {
      leftCaption: "Before",
      rightCaption: "With Intervexa™",
      hint: "Coding interview",
      rows: [
        {
          label: "Environment",
          before: "Bookmarked solutions only—never fingers on keys with a deadline.",
          after: "Same-style editor session: type, run, and iterate like onsite.",
        },
        {
          label: "Clock",
          before: "Forty-five minutes feels abstract until you’re mid-loop.",
          after: "Timer matches real rounds so pacing becomes muscle memory.",
        },
        {
          label: "Voice",
          before: "You code in silence; the panel expects a play-by-play.",
          after: "Practice that marries working code with a clear narrative.",
        },
      ],
    },
  },
  {
    id: "portfolio",
    kicker: "Portfolio builder",
    headline: (
      <>
        A project page that sits next to your{" "}
        <span className="bg-linear-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
          resume
        </span>
      </>
    ),
    to: "/templates",
    image: "/landing/platform-portfolio.svg",
    imageAlt: "Browser mockup showing a portfolio layout with content blocks",
    preview: {
      leftCaption: "Before",
      rightCaption: "With Intervexa™",
      hint: "Portfolio builder",
      rows: [
        {
          label: "Discovery",
          before: "GitHub-only signal—recruiters skim past buried repo links.",
          after: "One URL: headline, narrative, and proof stacked for a fast read.",
        },
        {
          label: "Structure",
          before: "Readme walls of text; hierarchy fights the reader.",
          after: "Templates with clear sections so projects scan like a product page.",
        },
        {
          label: "Consistency",
          before: "Resume says senior polish; the web presence says weekend hack.",
          after: "Visual tone matches your CV—same story, upgraded surface.",
        },
      ],
    },
  },
];

function BeforeAfterPreview({ featureId, leftCaption, rightCaption, hint, rows }) {
  return (
    <div className="relative flex min-h-[272px] gap-0 sm:min-h-[292px]">
      <div className="min-w-0 flex-1 space-y-4 pr-4 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
        <div className="pb-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:text-xs">
            {leftCaption}
          </p>
          {hint ? (
            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500 sm:text-[10px]">
              {hint}
            </p>
          ) : null}
        </div>
        {rows.map((row) => (
          <div key={`${featureId}-${row.label}`}>
            <p className="font-semibold uppercase tracking-wide text-slate-500">{row.label}</p>
            <p className="mt-2 text-slate-400">{row.before}</p>
          </div>
        ))}
      </div>
      <div
        className="mx-1 w-px shrink-0 self-stretch min-h-48 rounded-full bg-linear-to-b from-cyan-400 via-indigo-500 to-violet-500 shadow-[0_0_14px_rgba(99,102,241,0.55)]"
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-4 pl-4 text-[10px] leading-relaxed text-slate-100 sm:text-[11px]">
        <div className="pb-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white sm:text-xs">
            {rightCaption}
          </p>
          {hint ? (
            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wider text-cyan-300/80 sm:text-[10px]">
              {hint}
            </p>
          ) : null}
        </div>
        {rows.map((row) => (
          <div key={`${featureId}-${row.label}-after`}>
            <p className="font-semibold uppercase tracking-wide text-cyan-300">{row.label}</p>
            <p className="mt-2 font-medium text-slate-200">{row.after}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePlatformLanes() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {PARTS.map((block, index) => {
        const reverse = index % 2 === 1;
        const featureBoxes = PLATFORM_FEATURE_BOXES_BY_ID[block.id];

        return (
          <section
            key={block.id}
            className="relative z-10 border-t border-white/10 py-16 px-4 sm:px-6 lg:px-10"
            aria-labelledby={`platform-${block.id}-heading`}
          >
            <div className="relative z-10 mx-auto max-w-8xl">
              <motion.p
                className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/90"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45 }}
              >
                {block.kicker}
              </motion.p>

              <motion.h2
                id={`platform-${block.id}-heading`}
                className="mx-auto mt-4 max-w-3xl text-center text-balance text-3xl font-semibold tracking-tight text-white"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: 0.05, duration: 0.5 }}
              >
                {block.headline}
              </motion.h2>

              <div className="mt-16 grid items-start gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-12 lg:gap-y-10 xl:gap-x-14">
                <motion.div
                  className={`mx-auto flex w-full max-w-xl flex-col lg:mx-0 lg:max-w-none ${reverse ? "lg:order-2" : ""} ${featureBoxes ? "lg:max-w-none" : ""}`}
                  initial={reduceMotion ? false : { opacity: 0, x: reverse ? 20 : -20 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
                    {featureBoxes.map((box, boxIndex) => {
                      const BoxIcon = box.icon;
                      return (
                        <Link
                          key={box.title}
                          to={box.to}
                          className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        >
                          <motion.div
                            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.12 }}
                            transition={{
                              delay: reduceMotion ? 0 : 0.06 + boxIndex * 0.06,
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
                            className="group flex h-full flex-col items-start rounded-xl border border-white/10 bg-black/35 p-7 text-left shadow-[0_20px_50px_-24px_rgba(0,0,0,0.75)] backdrop-blur-md transition-colors duration-300 sm:p-8"
                          >
                            <div className="mb-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-indigo-500/15 text-cyan-200 shadow-inner transition duration-300 group-hover:border-cyan-300/25 group-hover:bg-indigo-500/25 sm:h-11 sm:w-11">
                              <BoxIcon className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" strokeWidth={1.75} aria-hidden />
                            </div>
                            <h3 className="font-semibold text-white sm:text-lg">{box.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                              {box.description}
                            </p>
                            <span className="mt-6 inline-flex items-center gap-1 pt-1 text-sm font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200 sm:mt-auto sm:pt-6">
                              {box.cta}
                              <span aria-hidden>→</span>
                            </span>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div
                  className={`relative mx-auto flex w-full max-w-md justify-center  self-stretch lg:mx-0 lg:max-w-lg ${reverse ? "lg:order-1 lg:justify-start" : "lg:justify-end"}`}
                  initial={reduceMotion ? false : { opacity: 0, x: reverse ? -24 : 24 }}
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
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 }}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,440px)] w-[min(100%,400px)] -translate-x-1/2 -translate-y-1/2 rounded-4xl bg-linear-to-br from-indigo-500/30 via-violet-500/18 to-cyan-400/22 blur-3xl"
                    aria-hidden
                  />

                  <motion.div
                    whileHover={reduceMotion ? {} : { y: -6, scale: 1.02, rotate: 0.25 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    className="relative flex h-full  min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-linear-to-br from-indigo-500/10 via-slate-900/80 to-cyan-500/10 shadow-2xl shadow-indigo-900/50 backdrop-blur-xl"
                  >
                    <div
                      className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-linear-to-r from-transparent via-cyan-300/50 to-transparent"
                      aria-hidden
                    />
                    <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/20 blur-2xl" aria-hidden />
                    <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-cyan-400/15 blur-2xl" aria-hidden />

                    <div className="relative overflow-hidden border-b border-white/10">
                      <img
                        src={block.image}
                        alt={block.imageAlt}
                        width={800}
                        height={360}
                        className="h-40 w-full object-cover object-center sm:h-44"
                        loading="lazy"
                        decoding="async"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent"
                        aria-hidden
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-7 sm:p-8">
                      <BeforeAfterPreview
                        featureId={block.id}
                        leftCaption={block.preview.leftCaption}
                        rightCaption={block.preview.rightCaption}
                        hint={block.preview.hint}
                        rows={block.preview.rows}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
