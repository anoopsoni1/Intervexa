import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import TextType from "../components/ui/TextType";
import AppHeader from "../components/layout/AppHeader";
import ResumeSection from "../components/landing/ResumeSection.jsx";
import AnsoyalAIOfferings from "../components/landing/AnsoyalAIOfferings.jsx";
import HomePlatformLanes from "../components/landing/HomePlatformLanes.jsx";
import InstallPrompt from "../components/ui/Install.jsx";
import Particles from "../components/ui/Lighting.jsx";
import { API_BASE } from "../config";
import { intervexaCopyrightLine } from "../constants/branding.js";

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

/** Keep copy aligned with FAQPage JSON-LD in index.html. */
const HOME_FAQ = [
  {
    id: "what-is",
    group: "overview",
    question: "What is Ansoyal AI?",
    answer:
      "Ansoyal AI is an AI-powered career platform: ATS-friendly resume and portfolio tools, career guidance, coding practice, and AI mock interviews with scoring and feedback.",
  },
  {
    id: "is-free",
    group: "overview",
    question: "Is Ansoyal AI free?",
    answer:
      "Yes. Core interview practice and resume features are available free so you can try the product. Paid plans may unlock higher usage or premium templates—see Pricing for details.",
  },
  {
    id: "how-works",
    group: "overview",
    question: "How does Ansoyal AI work?",
    answer:
      "You upload or build your profile, improve it with AI suggestions and ATS scoring, then practice with mock or coding interviews. After each session you get structured feedback and scores you can act on.",
  },
  {
    id: "technical-interviews",
    group: "interviews",
    question: "Can Ansoyal AI help me prepare for technical interviews?",
    answer:
      "Yes. You can practice technical and coding-style questions in a focused environment and review AI feedback on your approach and communication—not just the final answer.",
  },
  {
    id: "interview-feedback",
    group: "interviews",
    question: "Does Ansoyal AI provide interview feedback?",
    answer:
      "Yes. You get feedback on clarity, structure, and relevance of your answers, plus an overall performance picture so you know what to improve before the real interview.",
  },
  {
    id: "beginners",
    group: "interviews",
    question: "Is Ansoyal AI suitable for beginners?",
    answer:
      "Yes. Flows are built for first-time job seekers and experienced hires alike—guided steps for resumes and gentle, repeatable practice for interviews.",
  },
  {
    id: "progress",
    group: "interviews",
    question: "Can I track my progress on Ansoyal AI?",
    answer:
      "Yes. You can follow scores and practice history over time so you can see whether your answers and confidence are trending in the right direction.",
  },
  {
    id: "mock-interviews",
    group: "interviews",
    question: "Does Ansoyal AI support mock interviews?",
    answer:
      "Yes. AI-powered mock interviews simulate realistic prompts and pacing so you can rehearse without scheduling a human partner every time.",
  },
  {
    id: "online",
    group: "overview",
    question: "Is Ansoyal AI available online?",
    answer:
      "Yes. It runs in the browser—sign in from any device with an internet connection; nothing to install for the web app.",
  },
  {
    id: "why-use",
    group: "overview",
    question: "Why should I use Ansoyal AI for interview preparation?",
    answer:
      "You get one place to tighten your resume, rehearse under pressure, and read feedback you can apply immediately—so you walk into interviews prepared, not guessing.",
  },
];

const FAQ_TOPIC_FILTERS = [
  { id: "all", label: "All topics" },
  { id: "overview", label: "Platform & pricing" },
  { id: "interviews", label: "Interview practice" },
];

/** Four equal-height bands so the field is split evenly from hero through footer (same count + settings per band). */
const HOME_PARTICLE_BAND_COUNT = 4;
const HOME_PARTICLES_PER_BAND = 58;

function HomePageParticles({ reduceMotion }) {
  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 grid min-h-full w-full grid-rows-4 opacity-[0.36] mix-blend-screen"
      aria-hidden
    >
      {Array.from({ length: HOME_PARTICLE_BAND_COUNT }, (_, slot) => (
        <div key={slot} className="relative min-h-0">
          <Particles
            id={`home-page-particles-${slot}`}
            particleColors={["#ffffff", "#a5b4fc", "#67e8f9"]}
            particleCount={400}
            particleSpread={6}
            speed={0.072}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
            pixelRatio={1}
          />
        </div>
      ))}
    </div>
  );
}

function FaqSection() {
  const reduceMotion = useReducedMotion();
  const [openIds, setOpenIds] = useState(() => new Set());
  const [topicFilter, setTopicFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredFaq = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HOME_FAQ.filter((item) => {
      if (topicFilter !== "all" && item.group !== topicFilter) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    });
  }, [search, topicFilter]);

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandFiltered = () => {
    setOpenIds(new Set(filteredFaq.map((item) => item.id)));
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative z-10 border-t border-white/10"
    >
      <div className="relative z-10 mx-auto flex min-h-screen max-w-8xl flex-col px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
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
                Answers about{" "}
              </motion.span>
              <span className="relative inline-block">
                <motion.span
                  className="inline-block bg-linear-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  resumes & interviews
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
              Search or filter by topic, open several answers at once, and dig into how Ansoyal AI fits your
              prep flow.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-2"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.26, duration: 0.5 }}
            >
              {FAQ_TOPIC_FILTERS.map((chip) => {
                const active = topicFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setTopicFilter(chip.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:text-sm ${
                      active
                        ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                        : "border-white/15 bg-white/4 text-slate-300 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </motion.div>
            <motion.div
              className="mt-8 hidden h-px max-w-xs overflow-hidden rounded-full bg-white/10 lg:block"
              initial={reduceMotion ? false : { scaleX: 0 }}
              whileInView={reduceMotion ? {} : { scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{ originX: 0 }}
            />
            <motion.div
              className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm sm:p-5"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32, duration: 0.55 }}
            >
              <p className="text-sm font-semibold text-white">Still stuck?</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                We&apos;re happy to help with accounts, billing, or product questions.
              </p>
              <Link
                to="/contact"
                className="mt-3 inline-flex text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Contact support →
              </Link>
            </motion.div>
          </motion.div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1">
                <label htmlFor="faq-search" className="sr-only">
                  Search questions
                </label>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
                <input
                  id="faq-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 shadow-inner shadow-black/20 backdrop-blur-sm transition-colors focus:border-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={expandFiltered}
                  disabled={filteredFaq.length === 0}
                  className="rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 sm:text-sm"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 sm:text-sm"
                >
                  Collapse all
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Showing {filteredFaq.length} of {HOME_FAQ.length} questions
              {topicFilter !== "all" ? ` · ${FAQ_TOPIC_FILTERS.find((c) => c.id === topicFilter)?.label}` : ""}
            </p>

            {/* items-start: avoid grid row stretch; CSS grid-rows accordion avoids height:auto layout thrash */}
            {filteredFaq.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/25 px-6 py-14 text-center backdrop-blur-sm">
                <p className="text-sm font-medium text-slate-300">No questions match that search.</p>
                <p className="mt-1 text-sm text-slate-500">Try different words or reset the topic filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setTopicFilter("all");
                  }}
                  className="mt-4 text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-2 xl:gap-5">
                {filteredFaq.map((item) => {
                  const isOpen = openIds.has(item.id);
                  const globalIndex = HOME_FAQ.findIndex((f) => f.id === item.id);
                  const n = String(globalIndex + 1).padStart(2, "0");
                  return (
                    <div
                      key={item.id}
                      className={`group relative overflow-hidden rounded-2xl border bg-black/35 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.75)] backdrop-blur-sm transition-[border-color,box-shadow] duration-200 hover:border-white/20 hover:shadow-[0_24px_60px_-20px_rgba(99,102,241,0.18)] ${
                        isOpen
                          ? "border-indigo-400/35 shadow-[0_24px_60px_-20px_rgba(99,102,241,0.22)]"
                          : "border-white/10"
                      }`}
                    >
                      <div
                        aria-hidden
                        className={`pointer-events-none absolute inset-y-0 left-0 w-1 origin-top bg-linear-to-b from-cyan-400/80 via-indigo-400/50 to-violet-500/40 transition-transform duration-200 ease-out ${
                          isOpen ? "scale-y-100 opacity-100" : "scale-y-[0.65] opacity-[0.35]"
                        }`}
                      />
                      <h3 className="m-0 text-base font-semibold text-white sm:text-lg">
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${item.id}`}
                          id={`faq-trigger-${item.id}`}
                          className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/45 sm:px-5 sm:py-5 active:scale-[0.99] motion-reduce:active:scale-100"
                        >
                          <span className="grid min-w-0 grid-cols-[auto_1fr] gap-x-3 sm:gap-x-4">
                            <span
                              className={`mt-0.5 font-mono text-xs font-semibold tabular-nums transition-colors duration-200 sm:text-sm ${
                                isOpen ? "text-indigo-200" : "text-indigo-300/55"
                              }`}
                            >
                              {n}
                            </span>
                            <span className="leading-snug">{item.question}</span>
                          </span>
                          <span
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-indigo-200 shadow-inner shadow-black/20 transition-[transform,background-color] duration-200 ease-out ${
                              isOpen ? "rotate-180 bg-indigo-500/25" : "rotate-0 bg-white/5"
                            }`}
                          >
                            <ChevronDown className="h-5 w-5" aria-hidden />
                          </span>
                        </button>
                      </h3>
                      <div
                        id={`faq-panel-${item.id}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${item.id}`}
                        className="grid border-t border-white/10 transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                        style={{
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                          transitionDuration: reduceMotion ? "0ms" : undefined,
                        }}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div
                            className="px-4 pb-5 pt-3 sm:px-5 sm:pb-6"
                            aria-hidden={!isOpen}
                          >
                            <p className="max-w-prose text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

  return (
    <motion.footer
      role="contentinfo"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 border-t border-white/10 print:hidden"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-linear-to-r from-transparent via-indigo-400/35 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-8xl px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.45 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <p className="text-lg font-extrabold tracking-tight text-white">Ansoyal AI</p>
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
            {intervexaCopyrightLine()}
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
                  Why users love Ansoyal AI
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
      className="relative min-h-screen"
    >
      <HomePageParticles reduceMotion={reduceMotion} />
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
      <AnsoyalAIOfferings />
      <ResumeSection />
      <HomePlatformLanes />
      <FaqSection />
      <HomeFooter />
    </motion.div>
  );
}

export default Home;
