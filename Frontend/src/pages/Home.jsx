import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import TextType from "../components/ui/TextType";
import AppHeader from "../components/layout/AppHeader";
import InstallPrompt from "../components/ui/Install.jsx";
import { API_BASE } from "../config";

function Navbar() {
  return <AppHeader />;
}

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stats = [
  { value: "95%", label: "ATS match improvement" },
  { value: "3x", label: "Faster resume creation" },
];

const features = [
  {
    title: "AI Resume Optimization",
    description: "Get instant suggestions to improve keywords, impact, and clarity.",
  },
  {
    title: "ATS Smart Scoring",
    description: "Know how well your resume performs before you apply.",
  },
  {
    title: "One-Click Premium Templates",
    description: "Choose beautiful designs that stay professional and readable.",
  },
];

/** Matches FAQ structured data in index.html for consistency with search previews. */
const HOME_FAQ = [
  {
    question: "What is Intervexa?",
    answer:
      "Intervexa is an AI-powered interview platform that analyzes your performance and provides feedback, scoring, and improvement suggestions.",
  },
  {
    question: "Is Intervexa free?",
    answer: "Yes, Intervexa offers free interview practice features for users.",
  },
  {
    question: "How does Intervexa work?",
    answer:
      "Intervexa uses AI to simulate interviews, analyze your answers, and provide detailed feedback along with performance scores.",
  },
  {
    question: "Can Intervexa help me prepare for technical interviews?",
    answer:
      "Yes, Intervexa helps users prepare for technical interviews by providing practice sessions, coding questions, and AI-based feedback.",
  },
  {
    question: "Does Intervexa provide interview feedback?",
    answer:
      "Yes, Intervexa provides detailed feedback on your answers, communication skills, and overall interview performance.",
  },
  {
    question: "Is Intervexa suitable for beginners?",
    answer:
      "Yes, Intervexa is designed for beginners as well as experienced candidates to improve their interview skills.",
  },
  {
    question: "Can I track my progress on Intervexa?",
    answer:
      "Yes, Intervexa allows users to track their interview performance, scores, and improvements over time.",
  },
  {
    question: "Does Intervexa support mock interviews?",
    answer: "Yes, Intervexa provides AI-powered mock interviews to simulate real interview scenarios.",
  },
  {
    question: "Is Intervexa available online?",
    answer: "Yes, Intervexa is a web-based platform accessible from anywhere with an internet connection.",
  },
  {
    question: "Why should I use Intervexa for interview preparation?",
    answer:
      "Intervexa helps you improve your interview skills with AI-driven insights, real-time feedback, and performance tracking, making you better prepared for real interviews.",
  },
];


/** Deterministic positions for FAQ lower background starfield (no SSR/random mismatch). */
const FAQ_LOWER_STARS = Array.from({ length: 56 }, (_, i) => {
  const x = ((i * 53 + 11) % 90) + 2;
  const y = ((i * 97 + 23) % 84) + 5;
  const size = 1.1 + (i % 5) * 0.5;
  const delay = (i * 0.19) % 3.4;
  const duration = 2.4 + (i % 6) * 0.42;
  return { id: i, left: `${x}%`, top: `${y}%`, size, delay, duration };
});

const FAQ_LOWER_SPARKLES = [
  { left: "12%", top: "18%", size: 10, delay: 0, rotate: 0 },
  { left: "78%", top: "28%", size: 8, delay: 0.4, rotate: 12 },
  { left: "45%", top: "42%", size: 12, delay: 0.8, rotate: -8 },
  { left: "88%", top: "58%", size: 9, delay: 0.2, rotate: 20 },
  { left: "22%", top: "65%", size: 11, delay: 1.1, rotate: -15 },
  { left: "62%", top: "12%", size: 7, delay: 0.6, rotate: 6 },
];

function FaqSection() {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const openSpring = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 38, mass: 0.85 };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative z-10 min-h-screen border-t border-white/10"
    >
      {/* Full-bleed ambient layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-[20%] top-[10%] h-[min(90vw,520px)] w-[min(90vw,520px)] rounded-full bg-indigo-600/18 blur-3xl"
          animate={
            reduceMotion
              ? {}
              : {
                  scale: [1, 1.08, 1],
                  x: [0, 32, 0],
                  opacity: [0.35, 0.5, 0.35],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-[15%] bottom-[5%] h-[min(85vw,480px)] w-[min(85vw,480px)] rounded-full bg-cyan-500/14 blur-3xl"
          animate={
            reduceMotion
              ? {}
              : {
                  scale: [1.06, 1, 1.06],
                  x: [0, -28, 0],
                  opacity: [0.28, 0.42, 0.28],
                }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[min(120vw,900px)] w-[min(120vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/8 blur-3xl"
          animate={
            reduceMotion
              ? {}
              : {
                  rotate: [0, 360],
                  opacity: [0.12, 0.2, 0.12],
                }
          }
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent_55%)]" />

        {/* Lower starfield + sparkles */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[min(68vh,720px)] min-h-[260px] sm:h-[min(62vh,780px)] sm:min-h-[300px]"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.55)_0%,transparent_72%)]" />
          {FAQ_LOWER_STARS.map((star) => (
            <motion.span
              key={star.id}
              className="absolute rounded-full bg-white shadow-[0_0_8px_1px_rgba(199,210,254,0.45)]"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
              }}
              animate={
                reduceMotion
                  ? { opacity: 0.4 }
                  : {
                      opacity: [0.12, 0.5, 0.22, 0.62, 0.15],
                      scale: [1, 1.45, 1.05, 1.35, 1],
                    }
              }
              transition={{
                duration: star.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: star.delay,
              }}
            />
          ))}
          {FAQ_LOWER_SPARKLES.map((sp, i) => (
            <motion.span
              key={`sparkle-${i}`}
              className="absolute flex items-center justify-center text-cyan-200/90"
              style={{ left: sp.left, top: sp.top, width: sp.size, height: sp.size }}
              initial={false}
              animate={
                reduceMotion
                  ? { opacity: 0.35, rotate: sp.rotate }
                  : {
                      opacity: [0.25, 0.85, 0.35, 0.75, 0.28],
                      rotate: [sp.rotate, sp.rotate + 90, sp.rotate],
                      scale: [1, 1.15, 0.95, 1.08, 1],
                    }
              }
              transition={{
                duration: 5.5 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: sp.delay,
              }}
            >
              <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-[0_0_6px_rgba(165,243,252,0.5)]" fill="currentColor" aria-hidden>
                <path d="M12 0l2.2 6.8H22l-5.5 4 2.1 6.5L12 15.2 5.4 17.3l2.1-6.5L2 6.8h7.8L12 0z" />
              </svg>
            </motion.span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-8xl flex-col px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        <div className="grid flex-1 gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16 xl:gap-20">
          {/* Intro column — sticky on large screens */}
          <motion.div
            className="flex flex-col justify-center lg:sticky lg:top-24 lg:self-start"
            initial={reduceMotion ? false : { opacity: 0, x: -32 }}
            whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/90"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05, duration: 0.5 }}
            >
              FAQ
            </motion.p>
            <h2
              id="faq-heading"
              className="mt-4 text-balance text-3xl font-extrabold leading-[1.12] text-white sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
            >
              <motion.span
                className="inline-block"
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                Everything you need to know about{" "}
              </motion.span>
              <span className="relative inline-block">
                <motion.span
                  className="inline-block bg-linear-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  Intervexa
                </motion.span>
                {!reduceMotion ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-1 left-0 block h-px w-full rounded-full bg-linear-to-r from-transparent via-cyan-300/60 to-transparent"
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.55, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originX: 0 }}
                  />
                ) : null}
              </span>
            </h2>
            <motion.p
              className="mt-5 max-w-md text-pretty text-base leading-relaxed text-slate-300 sm:text-lg"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22, duration: 0.55 }}
            >
              Mock interviews, ATS-ready resumes, and AI feedback — clear answers below. Tap a question to
              reveal the full response.
            </motion.p>
            <motion.div
              className="mt-8 hidden h-px max-w-xs overflow-hidden rounded-full bg-white/10 lg:block"
              initial={reduceMotion ? false : { scaleX: 0 }}
              whileInView={reduceMotion ? {} : { scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{ originX: 0 }}
            />
          </motion.div>

          {/* items-start: avoid grid row stretch so a sibling FAQ doesn’t grow an empty “ghost” panel when one opens. */}
          <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-2 xl:gap-5">
            {HOME_FAQ.map((item, index) => {
              const isOpen = openIndex === index;
              const n = String(index + 1).padStart(2, "0");
              return (
                <motion.div
                  key={`faq-${index}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.75)] backdrop-blur-md"
                  initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.08, margin: "0px 0px -8% 0px" }}
                  transition={{
                    duration: reduceMotion ? 0.2 : 0.5,
                    delay: reduceMotion ? 0 : 0.05 + index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={
                    reduceMotion
                      ? {}
                      : {
                          borderColor: "rgba(255,255,255,0.2)",
                          boxShadow: "0 24px 60px -20px rgba(99,102,241,0.25)",
                          transition: { type: "spring", stiffness: 400, damping: 28 },
                        }
                  }
                >
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-cyan-400/80 via-indigo-400/50 to-violet-500/40"
                    initial={false}
                    animate={{
                      opacity: isOpen ? 1 : 0.35,
                      scaleY: isOpen ? 1 : 0.65,
                    }}
                    transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originY: 0 }}
                  />
                  <h3 className="m-0 text-base font-semibold text-white sm:text-lg">
                    <motion.button
                      type="button"
                      onClick={() => toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      id={`faq-trigger-${index}`}
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5 sm:py-5"
                      whileTap={reduceMotion ? {} : { scale: 0.992 }}
                    >
                      <span className="flex min-w-0 gap-3 sm:gap-4">
                        <motion.span
                          className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-indigo-300/70 sm:text-sm"
                          animate={{ color: isOpen ? "rgba(165, 180, 252, 0.95)" : "rgba(165, 180, 252, 0.55)" }}
                        >
                          {n}
                        </motion.span>
                        <span className="leading-snug">{item.question}</span>
                      </span>
                      <motion.span
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-indigo-200 shadow-inner shadow-black/20"
                        animate={
                          reduceMotion ? {} : { rotate: isOpen ? 180 : 0, backgroundColor: isOpen ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)" }
                        }
                        transition={{ type: "spring", stiffness: 360, damping: 26 }}
                      >
                        <ChevronDown className="h-5 w-5" aria-hidden />
                      </motion.span>
                    </motion.button>
                  </h3>
                  <AnimatePresence initial={false} mode="sync">
                    {isOpen ? (
                      <motion.div
                        key={`faq-panel-body-${index}`}
                        id={`faq-panel-${index}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={openSpring}
                        className="overflow-hidden border-t border-white/10"
                      >
                        <motion.p
                          className="px-4 pb-5 pl-[3.25rem] pt-3 text-sm leading-relaxed text-slate-300 sm:px-5 sm:pb-6 sm:pl-[3.75rem] sm:text-[0.9375rem]"
                          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                          animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                          transition={{ delay: reduceMotion ? 0 : 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {item.answer}
                        </motion.p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const homeFooterLinks = [
  {
    title: "Product",
    links: [
      { to: "/upload", label: "Upload resume" },
      { to: "/templates", label: "Templates" },
      { to: "/atsscore", label: "ATS score" },
      { to: "/add-details", label: "Add details" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/price", label: "Pricing" },
    ],
  },
  {
    title: "Practice",
    links: [
      { to: "/coding-interview", label: "Coding interview" },
      { to: "/dashboard/interviews", label: "Mock interviews" },
      { to: "/#faq", label: "FAQ" },
    ],
  },
];

function HomeFooter() {
  const reduceMotion = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <motion.footer
      role="contentinfo"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 border-t border-white/10 bg-black/20 print:hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/35 to-transparent" aria-hidden />
      <div className="mx-auto max-w-8xl px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.45 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <p className="text-lg font-extrabold tracking-tight text-white">Intervexa</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              AI-powered resumes, portfolio templates, and interview practice — built so you can apply with confidence.
            </p>
            <Link
              to="/upload"
              className="mt-5 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/15"
            >
              Get started
            </Link>
          </motion.div>

          {homeFooterLinks.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + gi * 0.06, duration: 0.45 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/80">{group.title}</p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((item) => (
                  <li key={item.to + item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={reduceMotion ? {} : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row"
        >
          <p className="text-center text-sm text-slate-500 sm:text-left">
            © {year} Intervexa. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link to="/about" className="transition-colors hover:text-slate-300">
              About
            </Link>
            <Link to="/contact" className="transition-colors hover:text-slate-300">
              Contact
            </Link>
            <Link to="/price" className="transition-colors hover:text-slate-300">
              Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

function Hero({ resumeStats }) {
  const statsForDisplay = [
    ...stats,
    {
      value: `${resumeStats.totalDownloads}`,
      label: "Total Resume downloads",
    },
  ];

  return (
    <section className="relative z-10 px-4 pb-16 pt-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid w-full max-w-8xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <div className="mb-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <motion.div
              variants={itemVariant}
              className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100 backdrop-blur"
            >
              AI Powered Career Builder
            </motion.div>
            <motion.div
              variants={itemVariant}
              className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur"
            >
              Recruiter Friendly
            </motion.div>
          </div>

          <motion.div
            variants={itemVariant}
            className="min-h-[200px] sm:min-h-[230px] lg:min-h-[250px]"
          >
            <TextType
              as="h1"
              text={[
                "Land your dream job\nwith AI-powered resumes",
                "Build an ATS-ready resume\nin minutes",
                "Get a high ATS score\nwith our AI resume builder",
              ]}
              typingSpeed={65}
              pauseDuration={1300}
              showCursor
              cursorCharacter="|"
              deletingSpeed={75}
              variableSpeedEnabled={false}
              variableSpeedMin={60}
              variableSpeedMax={120}
              cursorBlinkDuration={0.5}
              cursorClassName="text-indigo-300/90"
              className="mx-auto block w-full max-w-[22ch] whitespace-pre-line text-balance wrap-break-word text-4xl font-extrabold leading-[1.05] text-white sm:max-w-[24ch] sm:text-[3.25rem] lg:mx-0 lg:max-w-[26ch] lg:text-[4.25rem]"
            />
          </motion.div>

          <motion.h3
            variants={itemVariant}
            className="pt-3 text-xl font-semibold text-orange-300 sm:text-2xl"
          >
            Build resumes that get interviews — not rejections.
          </motion.h3>

          <motion.p
            variants={itemVariant}
            className="mx-auto mt-5 max-w-2xl text-base text-slate-200 sm:text-lg lg:mx-0"
          >
            Optimize your resume with AI suggestions, beat ATS filters, and generate a
            polished professional profile with modern templates.
          </motion.p>

          <motion.div
            variants={itemVariant}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link to="/upload">
              <motion.span
                className="inline-flex min-w-44 items-center justify-center rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-cyan-500 px-7 py-3 text-lg font-semibold text-white shadow-xl shadow-indigo-500/40"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 22px 45px -12px rgba(99, 102, 241, 0.55)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                Get Started
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariant}
            className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-sm sm:gap-4 sm:p-4 lg:grid-cols-3"
          >
            {statsForDisplay.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="rounded-xl border border-white/10 bg-black/20 px-2 py-4 text-center"
              >
                <p className="text-xl font-bold text-indigo-300 sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <motion.div
            animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-4 -z-10 rounded-4xl bg-linear-to-r from-indigo-500/25 via-violet-500/15 to-cyan-400/20 blur-2xl"
          />

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ y: -8, rotate: 0.25, scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl border border-white/20 bg-linear-to-br from-indigo-500/10 via-slate-900/75 to-cyan-500/10 p-5 shadow-2xl shadow-indigo-900/50 backdrop-blur-xl sm:p-7"
          >
            <motion.div
              aria-hidden
              animate={{ x: ["-120%", "160%"] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "linear", repeatDelay: 1.4 }}
              className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-linear-to-r from-transparent via-white/20 to-transparent blur-md"
            />
            <motion.div
              aria-hidden
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/80 to-transparent"
            />
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute -bottom-12 -left-14 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-200">
                  Why users love INTERVEXA
                </p>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
                  Smart features
                </span>
              </div>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.14, duration: 0.45 }}
                  whileHover={{
                    y: -5,
                    scale: 1.012,
                    borderColor: "rgba(103,232,249,0.45)",
                    backgroundColor: "rgba(15, 23, 42, 0.62)",
                    boxShadow: "0 16px 30px -18px rgba(34,211,238,0.55)",
                  }}
                  className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/30 p-4 transition-colors"
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-cyan-300/70 via-indigo-300/40 to-transparent" />
                  <div className="flex items-start gap-3">
                    <motion.span
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.2 }}
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300"
                    />
                    <div>
                      <h4 className="text-base font-semibold text-white sm:text-lg">{feature.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-10 flex justify-center"
      >
        {/* <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="rounded-full border border-white/30 px-4 py-2 text-xs text-slate-300"
        >
          Scroll to explore
        </motion.div> */}
      </motion.div>
    </section>
  );
}

function Home() {
  const reduceMotion = useReducedMotion();
  const [resumeStats, setResumeStats] = useState({
    totalDownloads: 0,
  });

  useEffect(() => {
    const fetchResumeStats = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        // Use same source as AdminDashboard: sum downloads from all users.
        const adminRes = await fetch(`${API_BASE}/get-all-users`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          const raw = adminData?.data;
          const users = Array.isArray(raw) ? raw : (raw?.users ?? []);
          const totalDownloads = users.reduce(
            (sum, u) => sum + (u.downloadCount ?? u.resumesDownloadedToday ?? 0),
            0
          );
          setResumeStats({ totalDownloads });
          return;
        }

        // Fallback for non-admin users.
        const res = await fetch(`${API_BASE}/get-resume-stats`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const statsData = data?.data ?? {};
        const fallbackTotal =
          statsData.totalDownloads ??
          statsData.totalDownloadCount ??
          statsData.downloadCount ??
          statsData.resumesDownloadedTotal ??
          statsData.resumesdownloadedtotal ??
          statsData.resumesDownloadedToday ??
          statsData.resumesdownloadedToday ??
          0;
        setResumeStats({ totalDownloads: fallbackTotal });
      } catch {
        // Keep fallback values if request fails.
      }
    };

    fetchResumeStats();
  }, []);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl"
        animate={
          reduceMotion
            ? {}
            : {
                x: [0, 24, -24, 0],
                y: [0, -18, 10, 0],
                opacity: [0.18, 0.28, 0.22, 0.18],
                scale: [1, 1.08, 0.96, 1],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 right-8 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"
        animate={
          reduceMotion
            ? {}
            : {
                x: [0, -18, 14, 0],
                y: [0, -12, 8, 0],
                opacity: [0.14, 0.24, 0.18, 0.14],
                scale: [1, 0.94, 1.06, 1],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      <Navbar />
      <Hero resumeStats={resumeStats} />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <InstallPrompt />
      </motion.div>
      <FaqSection />
      <HomeFooter />
    </motion.div>
  );
}

export default Home;
