import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Github, Layers, Linkedin, Mail, Globe, Phone, Sparkles } from "lucide-react";

import { useLenis } from "./useLenis.js";
import AnimatedBackground from "./AnimatedBackground.jsx";
import CustomCursor from "./CustomCursor.jsx";
import GrainOverlay from "./GrainOverlay.jsx";
import { TextRevealWords } from "./TextReveal.jsx";
import { parseProjectForResume } from "../../../utils/projectForm";
import ResumeProjectLink from "../../../components/resume/ResumeProjectLink";

gsap.registerPlugin(ScrollTrigger);

const stripBullet = (line) =>
  String(line || "")
    .replace(/^\s*[•\-*·▪▸]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

function normalizeProject(p, index) {
  if (typeof p === "string" && String(p).includes("|")) {
    const raw = String(p || "").trim();
    const [titlePart, ...rest] = raw.split("|").map((x) => x.trim());
    return {
      title: titlePart || `Project ${index + 1}`,
      description: rest.join(" | ").trim(),
      link: "",
    };
  }
  const n = parseProjectForResume(p);
  if (!n.title && !n.description && !n.link) {
    return { title: `Project ${index + 1}`, description: "", link: "" };
  }
  return {
    title: n.title || `Project ${index + 1}`,
    description: n.description,
    link: n.link || "",
  };
}

function parseExperienceBlock(block) {
  const raw = String(block || "").trim();
  if (!raw) return { title: "", bullets: [] };
  const lines = raw.split(/\r?\n/).map(stripBullet).filter(Boolean);
  const title = lines[0] || "";
  const bullets = lines.slice(1, 8).filter(Boolean);
  return { title, bullets };
}

const NAV = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
];

/** Deterministic hue for per-skill accent (inline styles). */
function skillHue(label) {
  const s = String(label);
  let h = 220;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 13)) % 360;
  return h;
}

const skillsSectionStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.06 },
  },
};

const skillChipVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const projectsListStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.04 },
  },
};

const projectCardVariant = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/**
 * Portfolio 4 — minimal dark layout inspired by kentokawazoe.com.
 * Uses only Detail / parseResume fields: name, role, summary, skills, experience,
 * projects, education, languageProficiency, email, phone, website, linkedin, github, certifications.
 */
export default function Portfolio4Layout({ data }) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef(null);
  const rootRef = useRef(null);
  const aboutLineRef = useRef(null);
  const [finePointer, setFinePointer] = useState(true);
  const [activeNav, setActiveNav] = useState("home");

  const name = data?.name ? String(data.name).trim() : "Your Name";
  const role = data?.role ? String(data.role).trim() : "Your Role";
  const summary =
    data?.summary?.trim() ||
    "Add a short summary in Add details or upload your resume to see your story here.";
  const rawSkills = Array.isArray(data?.skills) ? data.skills.filter(Boolean).map(String) : [];
  const rawProjects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const rawExperience = Array.isArray(data?.experience) ? data.experience.filter(Boolean) : [];
  const educationText = data?.education ? String(data.education).trim() : "";
  const languageText = data?.languageProficiency ? String(data.languageProficiency).trim() : "";
  const email = data?.email ? String(data.email).trim() : "";
  const phone = data?.phone ? String(data.phone).trim() : "";
  const website = data?.website ? String(data.website).trim() : "";
  const linkedinRaw = data?.linkedin ? String(data.linkedin).trim() : "";
  const githubRaw = data?.github ? String(data.github).trim() : "";
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications.map((c) => String(c).trim()).filter(Boolean)
    : [];

  const linkedinHref = linkedinRaw
    ? linkedinRaw.startsWith("http")
      ? linkedinRaw
      : `https://${linkedinRaw.replace(/^\/+/, "")}`
    : "";
  const githubHref = githubRaw
    ? githubRaw.startsWith("http")
      ? githubRaw
      : `https://${githubRaw.replace(/^\/+/, "")}`
    : "";
  const websiteHref = website ? (website.startsWith("http") ? website : `https://${website}`) : "";

  const projects = useMemo(() => rawProjects.map(normalizeProject), [rawProjects]);
  const experiences = useMemo(() => rawExperience.map(parseExperienceBlock), [rawExperience]);

  const nameParts = useMemo(() => {
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (p.length <= 1) return { line1: name.toUpperCase(), line2: "" };
    return { line1: p[0].toUpperCase(), line2: p.slice(1).join(" ").toUpperCase() };
  }, [name]);

  useLenis(!reducedMotion, lenisRef);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !aboutLineRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        aboutLineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: aboutLineRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [summary]);

  /**
   * Scroll-based active nav (reliable at load + all viewports). IntersectionObserver batches
   * only changed entries and aggressive rootMargin can pick the wrong section (e.g. Skills on Home).
   */
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const navIds = ["home", "projects", "skills"];
    let raf = 0;

    const headerPx = () => {
      const el = document.querySelector(".portfolio4-root > header");
      return el ? Math.round(el.getBoundingClientRect().height) : 56;
    };

    const syncActiveNav = () => {
      const line = window.scrollY + headerPx();
      let active = "home";
      for (let i = navIds.length - 1; i >= 0; i--) {
        const id = navIds[i];
        const el = document.getElementById(`p4-${id}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (line + 1 >= top) {
          active = id;
          break;
        }
      }
      setActiveNav(active);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncActiveNav);
    };

    syncActiveNav();
    const t0 = window.setTimeout(syncActiveNav, 0);
    const t1 = window.setTimeout(syncActiveNav, 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const ro = new ResizeObserver(onScroll);
    const hdr = document.querySelector(".portfolio4-root > header");
    if (hdr) ro.observe(hdr);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(`p4-${id}`);
    if (!el) return;
    const topOffset = -56;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: topOffset, duration: 1.1 });
    } else {
      el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  };

  /** Real hrefs work in static deploy (innerHTML has no React onClick). Lenis overrides when active. */
  const onNavLinkClick = (e, sectionId) => {
    if (lenisRef.current) {
      e.preventDefault();
      scrollToSection(sectionId);
    }
  };

  const socials = [
    { href: linkedinHref, Icon: Linkedin, label: "LinkedIn" },
    { href: websiteHref, Icon: Globe, label: "Website" },
    { href: githubHref, Icon: Github, label: "GitHub" },
    { href: email ? `mailto:${email}` : "", Icon: Mail, label: "Email" },
  ].filter((s) => s.href);

  const contactLine = email
    ? `For business inquiries, email me at ${email}`
    : phone
      ? `Reach me at ${phone}`
      : "Add your email or phone in Add details.";

  return (
    <div
      ref={rootRef}
      className={`portfolio4-root relative isolate min-h-screen font-inter text-white antialiased selection:bg-white/20 ${finePointer ? "cursor-none" : ""}`}
    >
      {/* Fixed layers must NOT sit under overflow-x-hidden (clips fixed descendants in some engines). */}
      <AnimatedBackground />
      <GrainOverlay opacity={0.055} />
      <CustomCursor disabled={!finePointer} />

      {/* Top nav — all breakpoints (no mobile sidebar) */}
      <header className="fixed left-0 right-0 top-0 z-40 flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-md sm:gap-6 sm:px-8 sm:py-3 lg:px-12">
        <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-6 md:gap-8" aria-label="Primary">
          {NAV.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={`desktop-${item.id}`}
                href={`#p4-${item.id}`}
                data-p4-nav={item.id}
                data-cursor="pointer"
                onClick={(e) => onNavLinkClick(e, item.id)}
                className={`whitespace-nowrap text-[9px] font-medium tracking-[0.18em] no-underline decoration-none underline-offset-0 visited:text-inherit visited:no-underline focus:outline-none focus-visible:ring-1 focus-visible:ring-white/25 transition-colors sm:text-[10px] sm:tracking-[0.2em] ${
                  isActive ? "text-white" : "text-white/50 hover:text-white/88"
                }`}
              >
                {item.label.toUpperCase()}
              </a>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          {socials.map(({ href, Icon, label }) => (
            <a
              key={`desktop-${label}`}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              data-cursor="pointer"
              className="text-white/70 transition-colors hover:text-white"
              aria-label={label}
            >
              <Icon className="h-4 w-4" strokeWidth={1.25} />
            </a>
          ))}
        </div>
      </header>

      <main className="relative z-10 overflow-x-hidden pt-14">
        {/* Hero + about (reference layout) */}
        <section
          id="p4-home"
          className="relative isolate min-h-[100dvh] scroll-mt-0 px-5 pb-16 pt-6 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_85%_60%_at_50%_0%,rgba(255,255,255,0.07),transparent_58%)] sm:px-8 sm:pt-12 lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] lg:gap-x-12 lg:px-12 lg:pb-24 lg:pt-16"
        >
          <div className="flex flex-col justify-center">
            <motion.h1
              className="text-[clamp(2.75rem,11vw,6.25rem)] font-extralight leading-[0.92] tracking-[-0.02em]"
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="block">{nameParts.line1}</span>
              {nameParts.line2 ? <span className="block">{nameParts.line2}</span> : null}
            </motion.h1>
            <motion.p
              className="mt-5 max-w-xl text-sm font-normal tracking-wide text-white/75 sm:text-base"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.75 }}
            >
              {role}
            </motion.p>
            <motion.p
              className="mt-auto pt-16 text-xs leading-relaxed text-white/45 sm:max-w-md sm:text-sm lg:pt-24"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.8 }}
            >
              {contactLine}
            </motion.p>
          </div>

          <div className="mt-14 flex flex-col justify-center lg:mt-0 lg:pt-16">
            <p className="text-[10px] font-medium tracking-[0.28em] text-white/90">ABOUT ME</p>
            <div
              ref={aboutLineRef}
              className="p4-about-line mt-3 h-px w-full origin-left bg-white/35"
            />
            <div className="mt-6 text-sm leading-[1.75] text-white/65 sm:text-[0.9375rem]">
              <TextRevealWords text={summary} />
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="p4-projects" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-[0.28em] text-white/90">PROJECTS</p>
              <div className="mt-3 h-px max-w-xs bg-gradient-to-r from-white/45 via-white/25 to-transparent" />
            </div>
            {projects.length > 0 ? (
              <p className="text-[10px] tabular-nums tracking-[0.2em] text-white/35">
                {String(projects.length).padStart(2, "0")} · WORK
              </p>
            ) : null}
          </div>

          {projects.length > 0 ? (
            <motion.div
              className="mt-12 flex flex-col gap-8 lg:gap-10"
              variants={projectsListStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
            >
              {projects.map((p, i) => {
                const hue = skillHue(p.title);
                const initials = p.title
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 3) || "PR";
                return (
                  <motion.article
                    key={`${p.title}-${i}`}
                    variants={projectCardVariant}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-[border-color,box-shadow] duration-300 hover:border-white/18 hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]"
                    whileHover={reducedMotion ? undefined : { y: -3 }}
                    transition={{ duration: 0.28 }}
                  >
                    <div
                      className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                      style={{
                        background: `radial-gradient(circle, hsla(${hue}, 65%, 52%, 0.45) 0%, transparent 68%)`,
                      }}
                      aria-hidden
                    />
                    <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                      <div className="flex flex-col justify-between p-6 sm:p-8 lg:pr-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[10px] font-medium tabular-nums tracking-[0.2em] text-white/55">
                            <Layers className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} aria-hidden />
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="mt-6 sm:mt-8">
                          <h2 className="text-xl font-light leading-snug tracking-tight text-white sm:text-2xl">{p.title}</h2>
                          {p.description ? (
                            <p className="mt-4 max-w-xl text-sm leading-[1.75] text-white/58 sm:text-[0.9375rem]">{p.description}</p>
                          ) : null}
                          {p.link ? (
                            <p className="mt-3 text-sm">
                              <ResumeProjectLink url={p.link} className="text-white/85 underline decoration-white/40 hover:decoration-white" />
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <motion.div
                        className="relative min-h-[200px] overflow-hidden border-t border-white/[0.06] sm:min-h-[220px] lg:min-h-full lg:border-l lg:border-t-0"
                        whileHover={reducedMotion ? undefined : { scale: 1.01 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `
                              radial-gradient(ellipse 80% 80% at 70% 30%, hsla(${hue}, 55%, 45%, 0.35) 0%, transparent 55%),
                              radial-gradient(ellipse 60% 60% at 20% 80%, hsla(${(hue + 40) % 360}, 50%, 40%, 0.2) 0%, transparent 50%),
                              linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 45%, rgba(0,0,0,0.2) 100%)
                            `,
                          }}
                        />
                        <div
                          className="absolute inset-0 opacity-[0.18]"
                          style={{
                            backgroundImage:
                              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                          }}
                        />
                        <div className="relative flex h-full min-h-[200px] flex-col items-center justify-center gap-4 px-6 py-10 sm:min-h-[220px]">
                          <span className="text-4xl font-extralight tracking-[0.12em] text-white/90 sm:text-5xl">{initials}</span>
                          <span className="max-w-[14rem] text-center text-[10px] leading-relaxed tracking-wide text-white/32">
                            {p.title.slice(0, 52)}
                            {p.title.length > 52 ? "…" : ""}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center sm:px-10">
              <p className="text-sm text-white/45">No projects yet — add them under Projects in Add details.</p>
            </div>
          )}
        </section>

        {/* Skills + certifications + languages */}
        <section id="p4-skills" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-[0.28em] text-white/90">SKILLS</p>
              <div className="mt-3 h-px max-w-xs bg-gradient-to-r from-white/45 via-white/25 to-transparent" />
            </div>
            {rawSkills.length > 0 ? (
              <p className="text-[10px] tabular-nums tracking-[0.2em] text-white/35">
                {String(rawSkills.length).padStart(2, "0")} · STACK
              </p>
            ) : null}
          </div>

          {/* Skill chips — responsive grid + panel */}
          {rawSkills.length > 0 ? (
            <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-7 lg:p-10">
              <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
                <div className="flex items-start gap-3 sm:items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] sm:h-11 sm:w-11">
                    <Sparkles className="h-[18px] w-[18px] text-white/55 sm:h-5 sm:w-5" strokeWidth={1.25} aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/88">Technical stack</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                      Languages, tooling, and platforms I use regularly.
                    </p>
                  </div>
                </div>
              </div>
              <motion.div
                className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-3"
                variants={skillsSectionStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-8%" }}
              >
                {rawSkills.map((skill) => {
                  const hue = skillHue(skill);
                  return (
                    <motion.div
                      key={skill}
                      variants={skillChipVariant}
                      className="group relative min-h-[48px] sm:min-h-0"
                      whileHover={reducedMotion ? undefined : { y: -2 }}
                      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <div
                        className="relative flex h-full min-h-[48px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-center backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300 group-hover:border-white/26 group-hover:bg-white/[0.08] sm:min-h-[52px] sm:rounded-full sm:px-5 sm:py-2.5"
                        style={{
                          boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 12px 40px -18px hsla(${hue}, 60%, 50%, 0.35)`,
                        }}
                      >
                        <span
                          className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-white/0 via-white/[0.08] to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          aria-hidden
                        />
                        <span className="relative text-sm font-medium leading-snug tracking-wide text-white/90">{skill}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center sm:px-10">
              <p className="text-sm text-white/45">No skills listed yet — add them under Skills in Add details.</p>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 ? (
            <div className="mt-14 lg:mt-20">
              <p className="text-[10px] font-medium tracking-[0.28em] text-white/55">CERTIFICATIONS</p>
              <div className="mt-4 h-px max-w-[10rem] bg-gradient-to-r from-white/30 to-transparent" />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {certifications.map((c, i) => (
                  <motion.div
                    key={`cert-${i}-${c.slice(0, 12)}`}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-white/[0.07] to-white/[0.02] p-5 pl-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-shadow duration-300 hover:border-white/18 hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)]"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-6%" }}
                    transition={{ delay: Math.min(i * 0.05, 0.25), duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={reducedMotion ? undefined : { y: -2 }}
                  >
                    <span
                      className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-white/50 via-white/15 to-transparent"
                      aria-hidden
                    />
                    <Award className="mb-3 h-4 w-4 text-white/40" strokeWidth={1.25} aria-hidden />
                    <p className="text-sm leading-relaxed text-white/78">{c}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Languages */}
          {languageText ? (
            <motion.div
              className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:mt-14 sm:p-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-[10px] font-medium tracking-[0.28em] text-white/45">LANGUAGES</p>
              <p className="mt-4 text-sm leading-[1.75] text-white/65 sm:text-[0.9375rem]">{languageText}</p>
            </motion.div>
          ) : null}
        </section>

        {/* Experience */}
        <section id="p4-experience" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <p className="text-[10px] font-medium tracking-[0.28em] text-white/90">EXPERIENCE</p>
          <div className="mt-3 h-px w-24 bg-white/30" />
          <div className="mt-12 space-y-12">
            {experiences.some((e) => e.title) ? (
              experiences.map((ex, i) => (
                <div key={`ex-${i}`} className="max-w-3xl border-b border-white/[0.06] pb-12 last:border-0">
                  <h3 className="text-base font-normal tracking-tight text-white sm:text-lg">{ex.title}</h3>
                  {ex.bullets.length ? (
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/55">
                      {ex.bullets.map((b, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="mt-2 h-px w-6 shrink-0 bg-white/20" aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-white/40">No experience entries yet.</p>
            )}
          </div>
        </section>

        {/* Education */}
        <section id="p4-education" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:pb-28 lg:pt-8">
          <p className="text-[10px] font-medium tracking-[0.28em] text-white/90">EDUCATION</p>
          <div className="mt-3 h-px w-24 bg-white/30" />
          {educationText ? (
            <p className="mt-8 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-white/60">{educationText}</p>
          ) : (
            <p className="mt-8 text-sm text-white/40">No education details yet.</p>
          )}
        </section>

        {/* Contact */}
        <footer id="p4-contact" className="border-t border-white/[0.06] px-5 py-16 sm:px-8 lg:px-12">
          <p className="text-[10px] font-medium tracking-[0.28em] text-white/90">CONTACT</p>
          <div className="mt-8 flex flex-col gap-4 text-sm text-white/60">
            {email ? (
              <a data-cursor="pointer" href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.25} />
                {email}
              </a>
            ) : null}
            {phone ? (
              <a data-cursor="pointer" href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.25} />
                {phone}
              </a>
            ) : null}
            {websiteHref ? (
              <a data-cursor="pointer" href={websiteHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <Globe className="h-4 w-4 shrink-0" strokeWidth={1.25} />
                {website}
              </a>
            ) : null}
          </div>
          <p className="mt-12 text-[10px] tracking-[0.15em] text-white/30">
            © {new Date().getFullYear()} {name}. Portfolio 4.
          </p>
        </footer>
      </main>
    </div>
  );
}
