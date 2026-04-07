import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, Mail, Phone, Download, ChevronRight, Linkedin, Lock, ArrowUpRight, Upload, FolderOpen, Github } from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import PortfolioHTMLDownload from "./Download";
import Portfolio4Layout from "../features/portfolio/portfolio4/Portfolio4Layout.jsx";
import Portfolio5Layout from "../features/portfolio/portfolio5/Portfolio5Layout.jsx";
import Portfolio6Layout from "../features/portfolio/portfolio6/Portfolio6Layout.jsx";
import Portfolio7Layout from "../features/portfolio/portfolio7/Portfolio7Layout.jsx";
import { getResumeContentForView } from "../utils/detailApi.js";
import { useToast } from "../context/ToastContext";
import { API_BASE } from "../config";
import { useUsageStatus, formatResetsLabel, isUsageBlocked } from "../hooks/useUsageStatus.js";
import OptimizedImage from "../components/ui/OptimizedImage.jsx";

gsap.registerPlugin(ScrollTrigger);

/** Placeholder data so logged-out users can still view portfolio template */
const PLACEHOLDER_PORTFOLIO_DATA = {
  name: "Your Name",
  role: "Your Role / Title",
  summary: "Add a short summary of your experience and goals. Sign in and add your details to see your own content here.",
  skills: [],
  experience: [],
  education: "",
  projects: [],
  languageProficiency: "",
  email: "email@example.com",
  phone: "+1 234 567 8900",
  location: "",
  linkedin: "",
  github: "",
  certifications: [],
};

const NAV_LINKS = [
  { to: "#home", label: "Home" },
  { to: "#about", label: "About" },
  { to: "#skills", label: "Skills" },
  { to: "#experience", label: "Experience" },
  { to: "#projects", label: "Projects" },
  { to: "#contact", label: "Contact" },
];

const NAV_LINKS_P2 = [
  { to: "#home", label: "Home" },
  { to: "#about", label: "About" },
  { to: "#skills", label: "Skills" },
  { to: "#portfolio", label: "Project" },
  { to: "#contact", label: "Contact" },
];

const NAV_LINKS_P3 = [
  { to: "#home", label: "Home" },
  { to: "#about", label: "About" },
  { to: "#skills", label: "Skills" },
  { to: "#portfolio", label: "Projects" },
  { to: "#contact", label: "Contact" },
];

function getLayoutType(template) {
  const n = (template?.name || "").toLowerCase();
  if (n.includes("portfolio 7") || n.includes("portfolio7")) return "portfolio7";
  if (n.includes("portfolio 6") || n.includes("portfolio6")) return "portfolio6";
  if (n.includes("portfolio 5") || n.includes("portfolio5")) return "portfolio5";
  if (n.includes("portfolio 4") || n.includes("portfolio4")) return "portfolio4";
  if (n.includes("portfolio 3") || n.includes("portfolio3")) return "portfolio3";
  if (n.includes("portfolio 2") || n.includes("portfolio2")) return "portfolio2";
  return "portfolio1";
}

/** Framer Motion variants for scroll & stagger */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }),
};
const fadeInView = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const cardHover = { scale: 1.02, y: -4 };
const buttonTap = { scale: 0.98 };

/** Portfolio 2: Dark teal/cyan theme — hero with glowing avatar, full sections, GSAP + motion. */
function Portfolio2Layout({ data }) {
  const rootRef = useRef(null);
  const heroLeftRef = useRef(null);
  const heroAvatarRef = useRef(null);
  const name = data?.name || "Your Name";
  const role = data?.role || "Frontend Developer";
  const summary = data?.summary || "Passionate about creating beautiful, responsive websites and exceptional user experiences. Specialized in modern web technologies including React, Vue.js, and advanced CSS frameworks.";
  const skills = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const projects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const email = data?.email || "";
  const phone = data?.phone || "";
  const linkedin = data?.linkedin || "";
  const github = data?.github || "";
  const firstName = name.split(/\s+/)[0] || name;
  const displayName = name.trim() || "Your Name";
  const initials = name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "Y";

  const socials = [
    linkedin
      ? {
          href: linkedin.startsWith("http") ? linkedin : `https://${linkedin}`,
          icon: Linkedin,
          label: "LinkedIn",
        }
      : null,
    github
      ? {
          href: github.startsWith("http") ? github : `https://${github}`,
          icon: Github,
          label: "GitHub",
        }
      : null,
    email ? { href: `mailto:${email}`, icon: Mail, label: "Email" } : null,
    phone ? { href: `tel:${phone}`, icon: Phone, label: "Phone" } : null,
  ].filter(Boolean);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroLeftRef.current) {
        const els = heroLeftRef.current.querySelectorAll(".p2-hero-item");
        gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", delay: 0.2 });
      }
      if (heroAvatarRef.current) {
        gsap.fromTo(heroAvatarRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.2)", delay: 0.3 });
        gsap.to(heroAvatarRef.current, { scale: 1.03, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }
      gsap.utils.toArray(".p2-section").forEach((section) => {
        gsap.fromTo(section, { opacity: 0, y: 70 }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" },
        });
        const cards = section.querySelectorAll(".p2-skill-card, .p2-project-card");
        if (cards.length) {
          gsap.fromTo(cards, { opacity: 0, y: 30 }, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" },
          });
        }
      });
    }, rootRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Portfolio 2 background: grid + cyan orbs + noise */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(34,211,238,0.12)_0%,transparent_50%)]" />
        <motion.div className="deploy-bg-orb absolute top-1/4 right-0 h-[55vw] w-[55vw] max-h-[500px] max-w-[500px] rounded-full bg-cyan-500/15 blur-[100px] sm:blur-[130px]" animate={{ x: [0, 30, 0], opacity: [0.12, 0.2, 0.12] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="deploy-bg-orb absolute bottom-1/3 left-0 h-[45vw] w-[45vw] max-h-[400px] max-w-[400px] rounded-full bg-teal-500/10 blur-[80px] sm:blur-[100px]" animate={{ y: [0, -20, 0], opacity: [0.1, 0.18, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <header className="relative z-10 border-b border-white/5">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.a href="#home" className="text-lg font-semibold text-white" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            {displayName}
          </motion.a>
          <ul className="hidden sm:flex items-center gap-8">
            {NAV_LINKS_P2.map((item, i) => (
              <li key={item.label}>
                <motion.a
                  href={item.to}
                  className={`relative py-2 text-sm font-medium transition-colors hover:text-cyan-400 ${
                    item.to === "#home" ? "text-cyan-400" : "text-white/90"
                  }`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
                >
                  {item.label}
                  {item.to === "#home" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" style={{ boxShadow: "0 0 12px rgba(34,211,238,0.6)" }} />
                  )}
                </motion.a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div ref={heroLeftRef} className="flex-1 order-2 lg:order-1">
          <p className="p2-hero-item text-cyan-400 text-sm font-medium tracking-wide mb-2">HI, Myself</p>
          <h1 className="p2-hero-item text-4xl sm:text-5xl md:text-6xl font-bold text-cyan-400 mb-2">{firstName}</h1>
          <p className="p2-hero-item text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">And I&apos;m a {role}</p>
          <p className="p2-hero-item text-white/70 text-base sm:text-lg leading-relaxed max-w-xl mb-8">{summary}</p>
          <div className="p2-hero-item flex gap-4 mb-8">
            {socials.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-cyan-400/80 text-white/90 transition-colors duration-300 hover:border-cyan-400 hover:text-cyan-400"
                style={{ boxShadow: "0 0 20px rgba(34,211,238,0.2)" }}
                aria-label={s.label}
                whileHover={{ scale: 1.15, boxShadow: "0 0 30px rgba(34,211,238,0.5)" }}
                whileTap={buttonTap}
              >
                <s.icon size={20} />
              </motion.a>
            ))}
          </div>
          <motion.a
            href="#about"
            className="p2-hero-item inline-flex items-center justify-center rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={buttonTap}
          >
            Read more
          </motion.a>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end order-1 lg:order-2">
          <div
            ref={heroAvatarRef}
            className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-cyan-400/90"
            style={{ boxShadow: "0 0 40px rgba(34,211,238,0.4), 0 0 80px rgba(34,211,238,0.2)" }}
          >
            {data?.avatar || data?.profileImage ? (
              <OptimizedImage
                src={data.avatar || data.profileImage}
                alt=""
                width={288}
                height={288}
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-5xl sm:text-6xl font-bold text-white/40">
                {initials}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="p2-section relative py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            About <span className="text-cyan-400">me</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl">{summary}</p>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="p2-section relative py-20 sm:py-28 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
            Skil<span className="text-cyan-400">ls</span>
          </h2>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {(skills.length ? skills : ["Web Development", "UI/UX Design", "Responsive Design"]).map((skill, i) => (
              <motion.div
                key={i}
                className="p2-skill-card rounded-xl border border-white/10 bg-white/5 p-6 hover:border-cyan-400/50 transition-colors duration-300 overflow-hidden"
                variants={fadeInView}
                whileHover={cardHover}
                whileTap={buttonTap}
              >
                <p className="text-white font-medium">{typeof skill === "string" ? skill : String(skill)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Project (projects) */}
      <section id="portfolio" className="p2-section relative py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 flex items-center gap-3">
            <FolderOpen size={28} className="shrink-0 text-cyan-400" />
            Proj<span className="text-cyan-400">ect</span>
          </h2>
          <motion.div className="grid sm:grid-cols-2 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {(projects.length ? projects : ["Project One", "Project Two", "Project Three"]).slice(0, 4).map((project, i) => (
              <motion.div
                key={i}
                className="p2-project-card rounded-xl border border-white/10 bg-white/5 p-6 hover:border-cyan-400/50 transition-colors duration-300 overflow-hidden"
                variants={fadeInView}
                whileHover={cardHover}
                whileTap={buttonTap}
              >
                <p className="text-white/80 text-sm sm:text-base line-clamp-3">{typeof project === "string" ? project : String(project)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="p2-section relative py-20 sm:py-28 bg-white/2 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Cont<span className="text-cyan-400">act</span>
          </h2>
          <p className="text-white/70 mb-10 max-w-xl">
            Have a project in mind or want to connect? Reach out via email or phone.
          </p>
          <motion.div className="flex flex-wrap gap-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {email && (
              <motion.a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-medium text-white hover:bg-cyan-400 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Mail size={18} /> {email}
              </motion.a>
            )}
            {phone && (
              <motion.a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-lg border-2 border-cyan-400/60 px-5 py-3 text-sm font-medium text-cyan-400 hover:bg-cyan-400/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Phone size={18} /> {phone}
              </motion.a>
            )}
            {linkedin && (
              <motion.a href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border-2 border-cyan-400/60 px-5 py-3 text-sm font-medium text-cyan-400 hover:bg-cyan-400/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                <Linkedin size={18} /> LinkedIn
              </motion.a>
            )}
            {github && (
              <motion.a
                href={github.startsWith("http") ? github : `https://${github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-cyan-400/60 px-5 py-3 text-sm font-medium text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                whileTap={buttonTap}
              >
                <Github size={18} /> GitHub
              </motion.a>
            )}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} {displayName}. All rights reserved.</p>
          <div className="flex gap-6">
            {NAV_LINKS_P2.map(({ to, label }) => (
              <a key={label} href={to} className="hover:text-cyan-400 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
/** Portfolio 1: Static HTML + Tailwind — semantic sections, clean typography, emerald accent, GSAP. */
function Portfolio1StaticLayout({ data }) {
  const rootRef = useRef(null);
  const heroLeftRef = useRef(null);
  const heroRightRef = useRef(null);
  const name = data?.name || "Your Name";
  const role = data?.role || "Your Role";
  const summary = data?.summary || "";
  const skills = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const projects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const education = data?.education || "";
  const email = data?.email || "";
  const phone = data?.phone || "";
  const linkedin = data?.linkedin || "";
  const github = data?.github || "";
  const initials = name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "P";
  const firstName = name.split(/\s+/)[0] || "Portfolio";

  const expItems = experience.map((e) => {
    if (typeof e === "string") return { role: e, bullets: [] };
    return { role: e?.role || "", bullets: Array.isArray(e?.bullets) ? e.bullets : [] };
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroLeftRef.current) {
        const els = heroLeftRef.current.querySelectorAll(".p1-hero-item");
        gsap.fromTo(els, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.15 });
      }
      if (heroRightRef.current) {
        gsap.fromTo(heroRightRef.current, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.25 });
      }
      gsap.utils.toArray(".p1-section").forEach((section) => {
        gsap.fromTo(section, { opacity: 0, y: 60 }, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none none" },
        });
      });
    }, rootRef.current);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-white text-neutral-900 overflow-x-hidden" id="home">
      {/* Portfolio 1 background: soft grid + emerald gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]" />
        <motion.div className="deploy-bg-orb absolute top-0 right-0 h-[65vw] w-[65vw] max-h-[600px] max-w-[600px] rounded-full bg-emerald-400/20 blur-[95px] sm:blur-[120px]" animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="deploy-bg-orb absolute bottom-1/4 left-0 h-[45vw] w-[45vw] max-h-[400px] max-w-[400px] rounded-full bg-teal-400/15 blur-[80px] sm:blur-[100px]" animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.a href="#home" className="flex items-center gap-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <motion.span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold" whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
              {firstName[0]?.toUpperCase() || "P"}
            </motion.span>
            <span className="text-lg font-semibold text-black">{firstName}</span>
          </motion.a>
          <nav className="hidden sm:flex items-center gap-8">
            {NAV_LINKS.map((item, i) => (
              <motion.a key={item.label} href={item.to} className="text-sm font-medium text-neutral-600 hover:text-black transition-colors" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}>
                {item.label}
              </motion.a>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section id="home" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div ref={heroLeftRef}>
              <p className="p1-hero-item inline-block rounded-lg border-2 border-emerald-500 bg-black text-white px-4 py-2 mb-6 text-sm font-medium">
                Hi, I&apos;m {name}
              </p>
              <h1 className="p1-hero-item text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-black tracking-tight leading-tight">
                {role}
              </h1>
              {summary && (
                <p className="p1-hero-item mt-5 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  {summary}
                </p>
              )}
              <div className="p1-hero-item mt-8 flex flex-wrap items-center gap-4">
                <motion.a
                  href={email ? `mailto:${email}` : "#contact"}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-emerald-500 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={buttonTap}
                >
                  Get in touch
                  <ChevronRight size={18} className="text-emerald-400" />
                </motion.a>
                <motion.a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-black font-medium hover:underline"
                  whileHover={{ x: 4 }}
                  whileTap={buttonTap}
                >
                  Download CV
                  <Download size={18} />
                </motion.a>
              </div>
              <div className="p1-hero-item mt-10">
                <p className="text-sm text-neutral-500 mb-3">Find me on</p>
                <div className="flex flex-wrap items-center gap-3">
                  {email && (
                    <a href={`mailto:${email}`} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 text-neutral-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors" aria-label="Email">
                      <Mail size={18} />
                    </a>
                  )}
                  {phone && (
                    <a href={`tel:${phone}`} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 text-neutral-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors" aria-label="Phone">
                      <Phone size={18} />
                    </a>
                  )}
                  {linkedin && (
                    <a
                      href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white hover:opacity-90 transition-opacity"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                  {github && (
                    <a
                      href={github.startsWith("http") ? github : `https://${github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white hover:opacity-90 transition-opacity"
                      aria-label="GitHub"
                    >
                      <Github size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div ref={heroRightRef} className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-14 h-16 border-l-2 border-t-2 border-black rounded-tl-lg" aria-hidden />
                <div className="relative w-56 h-72 sm:w-72 sm:h-96 rounded-xl border-2 border-black bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {data?.avatar || data?.profileImage ? (
                    <OptimizedImage
                      src={data.avatar || data.profileImage}
                      alt=""
                      width={288}
                      height={384}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl sm:text-7xl font-bold text-neutral-400 select-none">{initials}</span>
                  )}
                </div>
                <div className="absolute -bottom-6 -right-6 w-40 h-40 sm:w-52 sm:h-52 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-emerald-500/90 -z-10" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="p1-section bg-neutral-50/80 border-y border-neutral-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <motion.h2 className="text-2xl sm:text-3xl font-bold text-black mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>About</motion.h2>
            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              {summary || "Professional with a focus on delivering results and continuous growth."}
            </p>
            {education && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2">Education</h3>
                <p className="text-neutral-700">{education}</p>
              </div>
            )}
          </div>
        </section>

        {skills.length > 0 && (
          <section id="skills" className="p1-section max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <motion.h2 className="text-2xl sm:text-3xl font-bold text-black mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }}>Skills</motion.h2>
            <motion.ul className="flex flex-wrap gap-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-30px" }}>
              {skills.map((skill, i) => (
                <motion.li key={i} variants={fadeUp}>
                  <motion.span className="inline-block rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-800 px-4 py-2 text-sm font-medium" whileHover={{ scale: 1.05, boxShadow: "0 4px 14px rgba(16,185,129,0.25)" }} whileTap={buttonTap}>
                    {typeof skill === "string" ? skill : String(skill)}
                  </motion.span>
                </motion.li>
              ))}
            </motion.ul>
          </section>
        )}

        {expItems.length > 0 && (
          <section id="experience" className="p1-section bg-neutral-50/80 border-y border-neutral-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
              <motion.h2 className="text-2xl sm:text-3xl font-bold text-black mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>Experience</motion.h2>
              <motion.ul className="space-y-10" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
                {expItems.map((item, i) => (
                  <motion.li key={i} className="border-l-2 border-emerald-500 pl-6" variants={fadeInView}>
                    <h3 className="text-lg font-semibold text-black">{item.role}</h3>
                    {item.bullets.length > 0 && (
                      <ul className="mt-3 space-y-2 text-neutral-600 text-sm sm:text-base">
                        {item.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-emerald-500 shrink-0">•</span>
                            <span>{typeof b === "string" ? b : String(b)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section id="projects" className="p1-section max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <motion.h2 className="text-2xl sm:text-3xl font-bold text-black mb-10 flex items-center gap-3" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <FolderOpen size={28} className="shrink-0 text-emerald-500" /> Projects
            </motion.h2>
            <motion.ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
              {projects.map((project, i) => (
                <motion.li key={i} variants={fadeInView}>
                  <motion.div className="rounded-xl border-2 border-neutral-200 bg-white p-6 hover:border-emerald-500 transition-colors h-full" whileHover={cardHover} whileTap={buttonTap}>
                    <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
                      {typeof project === "string" ? project : String(project)}
                    </p>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          </section>
        )}

        <section id="contact" className="p1-section bg-neutral-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <motion.h2 className="text-2xl sm:text-3xl font-bold mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>Let&apos;s work together</motion.h2>
            <motion.p className="text-neutral-300 max-w-xl mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }}>
              Have a project in mind or want to connect? Reach out via email or phone.
            </motion.p>
            <motion.div className="flex flex-wrap gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {email && (
                <motion.a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-600 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                  <Mail size={18} />
                  {email}
                </motion.a>
              )}
              {phone && (
                <motion.a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-5 py-3 text-sm font-medium hover:bg-white/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                  <Phone size={18} />
                  {phone}
                </motion.a>
              )}
              {linkedin && (
                <motion.a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-5 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
                  variants={fadeUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={buttonTap}
                >
                  <Linkedin size={18} />
                  LinkedIn
                </motion.a>
              )}
              {github && (
                <motion.a href={github.startsWith("http") ? github : `https://${github}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-5 py-3 text-sm font-medium hover:bg-white/10 transition-colors" variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={buttonTap}>
                  <Github size={18} />
                  GitHub
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <a key={label} href={to} className="hover:text-black transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Portfolio 3: Premium dark + glassmorphism + Framer Motion scroll animations */
function Portfolio3Layout({ data }) {
  const reducedMotion = useReducedMotion();

  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const aboutRef = useRef(null);
  const experienceRef = useRef(null);
  const skillsRef = useRef(null);

  const [activeSection, setActiveSection] = useState("home");
  const [profileHovered, setProfileHovered] = useState(false);

  const name = data?.name || "Your Name";
  const role = data?.role || "Product-focused Frontend Developer";
  const summary =
    data?.summary ||
    "I build high-performance, accessibility-minded web experiences with thoughtful motion, clean architecture, and premium UI polish.";

  const rawSkills = Array.isArray(data?.skills) ? data.skills.filter(Boolean) : [];
  const rawProjects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const rawExperience = Array.isArray(data?.experience) ? data.experience.filter(Boolean) : [];
  const educationText = data?.education ? String(data.education).trim() : "";
  const languageText = data?.languageProficiency ? String(data.languageProficiency).trim() : "";

  const initials = useMemo(() => {
    return String(name)
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [name]);

  const fallbackSkills = useMemo(
    () => [
      "React",
      "TypeScript",
      "UI/UX Design",
      "Framer Motion",
      "Accessibility",
      "Performance",
      "Design Systems",
      "API Integration",
    ],
    []
  );

  const fallbackProjects = useMemo(
    () => [
      "ResumeAI ATS Optimizer | React + UI automation to improve resume keyword alignment",
      "Interview Coach | Personalized mock interviews with real-time feedback loops",
      "Portfolio Builder | Modular templates with live preview + deploy-ready HTML",
      "Client Analytics Dashboard | Fast charts, filters, and role-based views",
      "Design System Starter | Consistent components, tokens, and motion guidelines",
      "Accessibility Audit Suite | WCAG-focused UI fixes and automated checks",
    ],
    []
  );

  const fallbackExperience = useMemo(
    () => [
      "Community Builder\n• OneCompiler\n• August 2025 — October 2025 (Remote)\n• Spearheaded the creation and growth of a vibrant coding community for OneCompiler’s Vibe feature, successfully driving over 200 active developer engagements.",
      "Video Editor\n• Arunoday Club, IIT Bhopal\n• July 2025 — Present\n• Produced compelling promotional and documentary videos that enhanced club engagement and boosted visibility across social media platforms.",
      "UI Automation Intern\n• Product Team\n• March 2025 — June 2025\n• Built automation scripts to speed up UI testing and reduced regressions by improving component reliability.",
    ],
    []
  );

  const skills = rawSkills.length ? rawSkills : fallbackSkills;
  const projects = rawProjects.length ? rawProjects : fallbackProjects;
  const experiences = rawExperience.length ? rawExperience : fallbackExperience;

  const socialEmail = data?.email ? String(data.email).trim() : "";
  const phone = data?.phone ? String(data.phone).trim() : "";
  const linkedinRaw = data?.linkedin ? String(data.linkedin).trim() : "";
  const linkedinHref = linkedinRaw
    ? linkedinRaw.startsWith("http")
      ? linkedinRaw
      : `https://${linkedinRaw.replace(/^\/+/, "")}`
    : "";
  const githubRaw = data?.github ? String(data.github).trim() : "";
  const githubHref = githubRaw
    ? githubRaw.startsWith("http")
      ? githubRaw
      : `https://${githubRaw.replace(/^\/+/, "")}`
    : "";
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications.map((c) => String(c).trim()).filter(Boolean)
    : [];

  const firstName = useMemo(() => {
    const n = String(name).trim().split(/\s+/)[0];
    return n || "there";
  }, [name]);

  const hasUserProjects = rawProjects.length > 0;
  const hasUserSkills = rawSkills.length > 0;

  const aboutHighlights = useMemo(() => {
    const rs = Array.isArray(data?.skills) ? data.skills.filter(Boolean).map(String) : [];
    const defaults = [
      { title: "Product thinking", desc: "Clarify goals, ship iteratively, and validate with users." },
      { title: "UI craft", desc: "Typography, spacing, and motion that feel intentional." },
      { title: "Accessibility", desc: "Semantic structure, contrast, and keyboard-friendly flows." },
      { title: "Performance", desc: "Lean renders, responsive layouts, and fast perceived load." },
    ];
    if (rs.length >= 4) {
      return rs.slice(0, 4).map((s, i) => ({
        title: s,
        desc: defaults[i % defaults.length].desc,
      }));
    }
    if (rs.length > 0) {
      const filled = rs.slice(0, 4).map((s, i) => ({
        title: s,
        desc: defaults[i % defaults.length].desc,
      }));
      while (filled.length < 4) filled.push(defaults[filled.length]);
      return filled.slice(0, 4);
    }
    return defaults;
  }, [data?.skills]);

  const scrollTargets = useMemo(
    () => ({
      home: heroRef,
      projects: projectsRef,
      about: aboutRef,
      experience: experienceRef,
      skills: skillsRef,
    }),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let obs;
    const run = () => {
      obs?.disconnect();
    const items = [
      { key: "home", el: heroRef.current },
      { key: "projects", el: projectsRef.current },
      { key: "about", el: aboutRef.current },
      { key: "experience", el: experienceRef.current },
      { key: "skills", el: skillsRef.current },
    ].filter((x) => x.el);
      if (!items.length) return;

      obs = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
          if (!visible) return;
          const key = visible.target.getAttribute("data-p3-section");
          if (key) setActiveSection(key);
        },
        { root: null, threshold: [0.12, 0.22, 0.4, 0.55], rootMargin: "-14% 0px -52% 0px" }
      );
      items.forEach(({ el }) => obs.observe(el));
    };

    const id = requestAnimationFrame(() => requestAnimationFrame(run));
    window.addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", run);
      obs?.disconnect();
    };
  }, []);

  const handleNav = (e, key) => {
    if (e?.preventDefault) e.preventDefault();
    const el = scrollTargets[key]?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    setActiveSection(key);
  };

  const navItems = useMemo(
    () => [
      { key: "home", label: "Home" },
      { key: "projects", label: "Projects" },
      { key: "about", label: "About" },
      { key: "experience", label: "Experience" },
      { key: "skills", label: "Skills" },
    ],
    []
  );

  const getSkillLevel = (skill) => {
    const s = String(skill);
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    return 55 + (hash % 40); // 55 - 94
  };

  const extractTags = (projectText) => {
    const s = String(projectText);
    const lowered = s.toLowerCase();

    const known = [
      "react",
      "typescript",
      "javascript",
      "node",
      "tailwind",
      "css",
      "html",
      "framer motion",
      "gsap",
      "api",
      "accessibility",
      "design system",
      "ui/ux",
      "ai",
      "llm",
      "ats",
    ];

    const tags = [];
    for (const t of known) {
      if (tags.length >= 3) break;
      if (lowered.includes(t)) tags.push(t);
    }

    if (tags.length) return tags.map((t) => t.replace(/(^ui\/ux$)/i, "UI/UX"));

    const fallback = s
      .split(/[|,-]/g)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 3);
    return fallback.length ? fallback : ["Web"];
  };

  const stripBulletPrefix = (line) => {
    return String(line)
      .replace(/^\s*[•\-*·▪▸]\s*/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizeProject = (p, index) => {
    if (p && typeof p === "object" && !Array.isArray(p)) {
      const title = p?.title || p?.name || p?.label || p?.role || `Project ${index + 1}`;

      const bullets = Array.isArray(p?.bullets)
        ? p.bullets
        : Array.isArray(p?.highlights)
          ? p.highlights
          : Array.isArray(p?.points)
            ? p.points
            : [];

      const description =
        p?.description || p?.summary
          ? String(p.description || p.summary)
          : bullets.length
            ? bullets.map((b) => stripBulletPrefix(b)).filter(Boolean).join(" • ")
            : "";

      const tagsRaw = Array.isArray(p?.tags)
        ? p.tags
        : Array.isArray(p?.tech)
          ? p.tech
          : Array.isArray(p?.stack)
            ? p.stack
            : extractTags(String(title));

      const tags = tagsRaw.map((t) => String(t)).filter(Boolean);
      return { title: String(title), description: String(description || ""), tags: tags.slice(0, 4) };
    }

    const raw = String(p || "").trim();
    if (!raw) return { title: `Project ${index + 1}`, description: "", tags: ["Web"] };

    // If your project uses the "Title | description..." format, respect it.
    if (raw.includes("|")) {
      const [titlePart, ...rest] = raw.split("|").map((x) => x.trim());
      const title = titlePart || `Project ${index + 1}`;
      const description = rest.join(" | ").trim();
      return { title, description, tags: extractTags(`${title} ${description}`) };
    }

    // Otherwise, treat multiline blocks as: first line = title, remaining lines = bullets/description.
    const lines = raw
      .split(/\r?\n/)
      .map(stripBulletPrefix)
      .filter(Boolean);

    const title = lines[0] || `Project ${index + 1}`;
    const descriptionLines = lines.slice(1, 5);
    const description = descriptionLines.length ? descriptionLines.join(" • ") : "";
    return { title, description, tags: extractTags(`${title} ${description}`) };
  };

  const parseExperiencePreview = (block) => {
    const raw = String(block || "").trim();
    if (!raw) return { title: "", bullets: [] };
    const lines = raw.split(/\r?\n/).map(stripBulletPrefix).filter(Boolean);
    const title = lines[0] || "";
    const bullets = lines.slice(1, 4);
    return { title, bullets: bullets.filter(Boolean) };
  };

  const revealVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0 : 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: reducedMotion ? 0 : 0.06, delayChildren: 0.08 } },
  };

  const buttonTap = { scale: 0.98 };

  return (
    <div className="relative min-h-screen bg-[#06060B] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[54px_54px] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,0.25),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.20),transparent_60%)]" />

        <motion.div
          className="deploy-bg-orb absolute top-[-6rem] right-[-8rem] w-[28rem] h-[28rem] rounded-full bg-violet-500/15 blur-[120px]"
          animate={reducedMotion ? undefined : { x: [0, 18, 0], opacity: [0.16, 0.24, 0.16] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="deploy-bg-orb absolute bottom-[-10rem] left-[-10rem] w-[26rem] h-[26rem] rounded-full bg-cyan-500/10 blur-[120px]"
          animate={reducedMotion ? undefined : { y: [0, -14, 0], opacity: [0.12, 0.20, 0.12] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/30">
        <div className="mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <button
            type="button"
            onClick={(e) => handleNav(e, "home")}
            className="flex items-center gap-3 text-left rounded-xl sm:rounded-none sm:hover:opacity-90 transition-opacity"
          >
            <div
              className="h-10 w-10 shrink-0 rounded-full border border-violet-400/45 bg-white/5 flex items-center justify-center shadow-[0_0_22px_rgba(167,139,250,0.25)]"
              aria-hidden
            >
              <span className="text-sm font-extrabold tracking-wide text-violet-200">{initials || "Y"}</span>
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-sm sm:text-base font-semibold truncate">{String(name).trim() || "Your Name"}</div>
              <div className="hidden sm:block text-[11px] text-white/60 -mt-0.5 truncate">{String(role).trim()}</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 shrink-0" aria-label="Section navigation">
            {navItems.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <a
                  key={item.key}
                  href={`#${item.key === "home" ? "p3-home" : item.key}`}
                  onClick={(e) => handleNav(e, item.key)}
                  className={`relative text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300"
                      style={{ boxShadow: "0 0 18px rgba(167,139,250,0.35)" }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <nav className="md:hidden flex w-full scrollbar-hide overflow-x-auto gap-1 pb-0.5 -mx-1 px-1" aria-label="Section navigation">
            {navItems.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <a
                  key={item.key}
                  href={`#${item.key === "home" ? "p3-home" : item.key}`}
                  onClick={(e) => handleNav(e, item.key)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-white/12 text-white border border-violet-400/35 shadow-[0_0_20px_rgba(167,139,250,0.15)]"
                      : "text-white/65 hover:text-white border border-transparent hover:bg-white/5"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        ref={heroRef}
        id="p3-home"
        data-p3-section="home"
        className="relative z-10 scroll-mt-28 px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-20"
      >
        <div className="mx-auto  grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <motion.p
              className="p3-hero-item inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-white/60"
              initial={{ opacity: 0, y: 12 }}
              animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90 shadow-[0_0_14px_rgba(52,211,153,0.5)]" />
              Portfolio · {hasUserProjects && hasUserSkills ? "Your work & skills" : "Built for clarity"}
            </motion.p>

            <motion.h1
              className="p3-hero-item mt-5 text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-extrabold leading-[1.08] tracking-tight"
              initial={reducedMotion ? undefined : { opacity: 0, y: 26 }}
              animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="block text-lg sm:text-xl font-medium text-white/55 mb-2 sm:mb-3">
                Hi, I&apos;m <span className="text-white/90">{firstName}</span>
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-200 via-fuchsia-200 to-cyan-200">
                {String(role).trim()}
              </span>
            </motion.h1>

            <motion.p
              className="p3-hero-item mt-5 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl"
              initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
              animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.65, ease: "easeOut", delay: reducedMotion ? 0 : 0.06 }}
            >
              {summary}
            </motion.p>

            <motion.div
              className="p3-hero-item mt-8 flex flex-col sm:flex-row gap-3 sm:items-center"
              initial={reducedMotion ? undefined : { opacity: 0, y: 14 }}
              animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut", delay: reducedMotion ? 0 : 0.1 }}
            >
              <motion.button
                type="button"
                onClick={(e) => handleNav(e, "projects")}
                className="btn-primary"
                whileHover={reducedMotion ? undefined : { y: -1, boxShadow: "0 16px 40px rgba(99,102,241,0.25)" }}
                whileTap={buttonTap}
              >
                View projects
                <ChevronRight size={18} className="text-white/90" />
              </motion.button>

              <a
                href={
                  socialEmail
                    ? `mailto:${socialEmail}`
                    : linkedinHref || githubHref || "#"
                }
                onClick={(e) => {
                  if (!socialEmail && !linkedinHref && !githubHref) e.preventDefault();
                }}
                className="btn-secondary"
                style={{ borderColor: "rgba(167,139,250,0.35)" }}
              >
                Let’s build something
                <ArrowUpRight size={18} />
              </a>
            </motion.div>

            {(socialEmail || phone || linkedinHref || githubHref) && (
              <motion.div
                className="p3-hero-item mt-6 flex flex-wrap gap-2"
                initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
                animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.14 }}
              >
                {socialEmail && (
                  <motion.a
                    href={`mailto:${socialEmail}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 hover:border-violet-400/40 hover:bg-white/10 transition-colors"
                    whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                    whileTap={buttonTap}
                  >
                    <Mail size={14} className="text-cyan-300" />
                    Email
                  </motion.a>
                )}
                {phone && (
                  <motion.a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 hover:border-violet-400/40 hover:bg-white/10 transition-colors"
                    whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                    whileTap={buttonTap}
                  >
                    <Phone size={14} className="text-fuchsia-300" />
                    Call
                  </motion.a>
                )}
                {linkedinHref && (
                  <motion.a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 hover:border-violet-400/40 hover:bg-white/10 transition-colors"
                    whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                    whileTap={buttonTap}
                  >
                    <Linkedin size={14} className="text-violet-300" />
                    LinkedIn
                  </motion.a>
                )}
                {githubHref && (
                  <motion.a
                    href={githubHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 hover:border-cyan-400/40 hover:bg-white/10 transition-colors"
                    whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                    whileTap={buttonTap}
                  >
                    <Github size={14} className="text-cyan-200" />
                    GitHub
                  </motion.a>
                )}
              </motion.div>
            )}

            <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: hasUserProjects ? "Projects listed" : "Sample projects",
                  value: String(Math.min(projects.length, 99)),
                },
                {
                  label: hasUserSkills ? "Skills" : "Skill areas",
                  value: String(Math.min(skills.length, 99)),
                },
                {
                  label: rawExperience.length ? "Experience blocks" : "Sections",
                  value: rawExperience.length ? String(rawExperience.length) : "4",
                },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  className="p3-card rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl px-4 py-3"
                  initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
                >
                  <div className="text-lg font-extrabold">{s.value}</div>
                  <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="relative flex justify-center"
            initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
            animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.75, ease: "easeOut" }}
          >
            <motion.div
              className="relative"
              onMouseEnter={() => setProfileHovered(true)}
              onMouseLeave={() => setProfileHovered(false)}
              onFocus={() => setProfileHovered(true)}
              onBlur={() => setProfileHovered(false)}
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      scale: 1.02,
                      rotate: -0.4,
                    }
              }
              transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
            >
              <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-violet-400/30 via-fuchsia-400/20 to-cyan-300/25 blur-xl" />

              <motion.div
                className="relative rounded-[32px] p-1.5 border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(167,139,250,0.18)] overflow-hidden"
                animate={
                  reducedMotion
                    ? undefined
                    : profileHovered
                      ? { boxShadow: "0 0 90px rgba(167,139,250,0.32), 0 0 50px rgba(34,211,238,0.14)" }
                      : { boxShadow: "0 0 60px rgba(167,139,250,0.18)" }
                }
                transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }}
              >
                {/* Shimmer sweep */}
                {!reducedMotion && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 0, x: "-40%" }}
                    animate={
                      profileHovered
                        ? { opacity: 1, x: "40%", transition: { duration: 0.55, ease: "easeOut" } }
                        : { opacity: 0, x: "-40%", transition: { duration: 0.25, ease: "easeOut" } }
                    }
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.28) 35%, rgba(34,211,238,0.18) 55%, transparent 100%)",
                      filter: "blur(8px)",
                      transform: "skewX(-12deg)",
                    }}
                  />
                )}

                <div className="rounded-[28px] overflow-hidden bg-[#0B0B12] border border-violet-400/25 p-2">
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="text-xs text-white/60">Profile</div>
                      <div className="text-base font-bold text-white/90 truncate">{firstName}&apos;s stack</div>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <FolderOpen size={18} className="text-violet-200" />
                    </div>
                  </div>

                  <div className="px-4 pb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-16 w-16 rounded-full border-2 border-violet-500/60 border-violet bg-white/5 flex items-center justify-center shadow-[0_0_28px_rgba(167,139,250,0.35)]"
                        aria-hidden
                      >
                        {data?.avatar || data?.profileImage ? (
                          <OptimizedImage
                            src={data.avatar || data.profileImage}
                            alt=""
                            width={64}
                            height={64}
                            loading="lazy"
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xl font-extrabold text-violet-200">{initials || "Y"}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{String(name).trim()}</div>
                        <div className="text-xs text-white/60 -mt-0.5">{String(role).trim()}</div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="text-xs text-white/60">Signature</div>
                      <div className="mt-2 text-sm font-bold text-white/85 leading-snug">
                        {hasUserSkills
                          ? (
                            <>
                              Top skills:{" "}
                              <span className="text-violet-200">{skills.slice(0, 3).join(" · ")}</span>
                            </>
                            )
                          : (
                            <>
                              <span className="text-violet-200">Polished UI</span> with motion that feels intentional.
                            </>
                            )}
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 animate-gradient-shift"
                          initial={{ width: "72%" }}
                          animate={{
                            width: profileHovered ? "88%" : "72%",
                            filter: profileHovered ? "drop-shadow(0 0 10px rgba(167,139,250,0.35))" : "none",
                          }}
                          transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.35)]" />
                        Responsive
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.35)]" />
                        Accessible
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(167,139,250,0.35)]" />
                        Fast
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      <section
        ref={projectsRef}
        id="projects"
        data-p3-section="projects"
        className="p3-section scroll-mt-24 relative z-10 py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto px-4 sm:px-6">
          <motion.div
            className="flex items-end justify-between gap-6 flex-wrap"
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div>
              <div className="text-xs tracking-widest uppercase text-white/55 font-semibold">Projects</div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">
                <span className="text-violet-300">Projects</span>
              </h2>
            </div>
            <p className="text-sm sm:text-base text-white/65 max-w-xl">
              {hasUserProjects
                ? "From your profile—titles and details update when you edit Add details."
                : "Sample layout. Add projects under Add details to show your real work here."}
            </p>
          </motion.div>

          <motion.div
            className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            {projects.slice(0, 6).map((p, idx) => {
              const proj = normalizeProject(p, idx);
              return (
                <motion.article
                  key={`${proj.title}-${idx}`}
                  className="group p3-card rounded-2xl bg-white/5 border border-white/10 group-hover:border-violet-400/25 backdrop-blur-xl p-5 relative overflow-hidden"
                  variants={revealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  layout
                  whileTap={buttonTap}
                  whileHover={{
                    y: -7,
                    scale: reducedMotion ? 1 : 1.02,
                    boxShadow: "0 22px 70px rgba(167,139,250,0.18)",
                  }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10" aria-label={proj.title}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/55">
                          <FolderOpen size={14} className="text-violet-200" />
                          Project {idx + 1}
                        </div>
                        <h3 className="mt-3 text-lg font-extrabold leading-snug">{proj.title}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <ArrowUpRight size={18} className="text-cyan-200" />
                      </div>
                    </div>

                    {proj.description ? (
                      <p className="mt-3 text-sm text-white/65 leading-relaxed">{proj.description}</p>
                    ) : (
                      <p className="mt-3 text-sm text-white/65 leading-relaxed">
                        A polished implementation focused on performance and conversion.
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {proj.tags.slice(0, 3).map((t, ti) => (
                        <span
                          key={`${proj.title}-${t}-${ti}`}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 capitalize"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <motion.div
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90"
                      whileHover={
                        reducedMotion
                          ? undefined
                          : {
                              opacity: 1,
                              x: 4,
                              transition: { duration: 0.2, ease: "easeOut" },
                            }
                      }
                    >
                      <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.35)]" />
                      Explore
                    </motion.div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section
        ref={aboutRef}
        id="about"
        data-p3-section="about"
        className="p3-section scroll-mt-24 relative z-10 py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto px-4 sm:px-6">
          <motion.div
            className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start"
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div className="lg:col-span-5">
              {/* <div className="text-xs tracking-widest uppercase text-white/55 font-semibold">About</div> */}
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">
                About <span className="text-violet-300">me</span>
              </h2>
              <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed">
                {summary}
              </p>

              <div className="mt-7 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5">
                <div className="text-xs text-white/55 font-semibold uppercase tracking-widest">At a glance</div>
                <ul className="mt-3 space-y-3 text-sm text-white/70">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.35)]" />
                    {hasUserSkills
                      ? `${skills.length} skills across your profile—from stack to soft tools.`
                      : "Add skills in Add details to reflect your real strengths."}
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-fuchsia-300 shadow-[0_0_16px_rgba(217,70,239,0.35)]" />
                    {hasUserProjects
                      ? `${rawProjects.length} project${rawProjects.length === 1 ? "" : "s"} showcased below.`
                      : "Projects section uses samples until you add your own."}
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.35)]" />
                    {certifications.length
                      ? `${certifications.length} certification${certifications.length === 1 ? "" : "s"} listed in your background.`
                      : "Education, languages, and certs appear here when you add them."}
                  </li>
                </ul>
              </div>

              {(educationText || languageText || certifications.length > 0) && (
                <motion.div
                  className="mt-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5"
                  variants={revealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: reducedMotion ? 0 : 0.6 }}
                >
                  <div className="text-xs text-white/55 font-semibold uppercase tracking-widest">Background</div>

                  {(educationText || languageText) && (
                    <div className="mt-5 space-y-4">
                      {educationText && (
                        <div>
                          <div className="text-sm font-extrabold">Education</div>
                          <p className="mt-2 whitespace-pre-line text-sm text-white/70 leading-relaxed">
                            {educationText}
                          </p>
                        </div>
                      )}

                      {languageText && (
                        <div>
                          <div className="text-sm font-extrabold">Languages</div>
                          <p className="mt-2 whitespace-pre-line text-sm text-white/70 leading-relaxed">
                            {languageText}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {certifications.length > 0 && (
                    <div className="mt-5">
                      <div className="text-sm font-extrabold">Certifications</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {certifications.map((c, ci) => (
                          <span
                            key={`cert-${ci}-${c.slice(0, 24)}`}
                            className="text-xs px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-100"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-7">
              <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                {aboutHighlights.map((h, idx) => (
                  <motion.div
                    key={`${h.title}-${idx}`}
                    className="p3-card rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5  md:mt-0 lg:mt-[15vh]"
                    variants={revealVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : idx * 0.03 }}
                  >
                    <div className="text-xs text-white/55 font-semibold uppercase tracking-widest">Focus area</div>
                    <div className="mt-3 text-lg font-extrabold">{h.title}</div>
                    <div className="mt-2 text-sm text-white/65 leading-relaxed">{h.desc}</div>
                    <div className="mt-4 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 ${
                          idx % 2 === 0 ? "w-[70%]" : "w-[58%]"
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Experience */}
      <section
        ref={experienceRef}
        id="experience"
        data-p3-section="experience"
        className="p3-section scroll-mt-24 relative z-10 py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto  px-4 sm:px-6">
          <motion.div
            className="flex items-end justify-between gap-6 flex-wrap"
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div>
              <div className="text-xs tracking-widest uppercase text-white/55 font-semibold">Experience</div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">
                Real work, <span className="text-violet-300">measurable impact</span>.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-white/65 max-w-xl">
              {rawExperience.length
                ? "Your roles and bullets update from Add details."
                : "Sample experience layout. Add experience under Add details to show your real background."}
            </p>
          </motion.div>

          <motion.div
            className="mt-10 grid sm:grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {experiences.slice(0, 6).map((block, idx) => {
              const preview = parseExperiencePreview(block);
              if (!preview.title) return null;

              return (
                <motion.article
                  key={`${preview.title}-${idx}`}
                  className="p3-card rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5"
                  variants={revealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : idx * 0.02 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-white/55 font-semibold uppercase tracking-widest">Role</div>
                      <div className="mt-2 text-lg font-extrabold leading-snug truncate">{preview.title}</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(167,139,250,0.12)]">
                      <FolderOpen size={18} className="text-violet-200" />
                    </div>
                  </div>

                  {preview.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm text-white/70">
                      {preview.bullets.map((b, i) => (
                        <li key={`${b}-${i}`} className="flex gap-2 leading-relaxed">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-300/80 shadow-[0_0_16px_rgba(167,139,250,0.35)] shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Skills */}
      <section
        ref={skillsRef}
        id="skills"
        data-p3-section="skills"
        className="p3-section scroll-mt-24 relative z-10 py-14 sm:py-16 lg:py-20 bg-white/[0.02] border-t border-white/10"
      >
        <div className="mx-auto px-4 sm:px-6">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div className="text-xs tracking-widest uppercase text-white/55 font-semibold">Skills</div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">
              Skills <span className="text-violet-300">& tools</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed max-w-2xl">
              {hasUserSkills
                ? "Your skills from Add details. Bars show relative emphasis (visual only—not a score)."
                : "Sample skills. Save your profile to replace these with your real stack."}
            </p>
          </motion.div>

          <motion.div
            className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            {skills.slice(0, 12).map((s, idx) => {
              const level = getSkillLevel(s);
              return (
                <motion.div
                  key={`${String(s)}-${idx}`}
                  className="p3-card rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5"
                  variants={revealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : idx * 0.02 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-extrabold leading-snug">{String(s)}</div>
                      <div className="mt-1 text-xs text-white/50">Relative emphasis</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-white/10 flex items-center justify-center shadow-[0_0_24px_rgba(167,139,250,0.12)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(167,139,250,0.35)]" aria-hidden />
                    </div>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300"
                      initial={{ width: 0 }}
                      whileInView={reducedMotion ? { width: `${level}%` } : { width: `${level}%` }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: reducedMotion ? 0 : 0.9, ease: "easeOut" }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                    <span>Foundation</span>
                    <span>Craft</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

      {(socialEmail || phone || linkedinHref || githubHref) && (
            <motion.div
              className="mt-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div>
                <div className="text-sm font-extrabold">Want to collaborate?</div>
                <div className="text-sm text-white/65">Reach out and I’ll respond quickly.</div>
              </div>
              <div className="flex flex-wrap gap-3">
                {socialEmail && (
                  <a
                    href={`mailto:${socialEmail}`}
                    className="btn-secondary"
                    style={{ borderColor: "rgba(34,211,238,0.35)" }}
                  >
                    <Mail size={18} />
                    Email
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="btn-secondary" style={{ borderColor: "rgba(167,139,250,0.35)" }}>
                    <Phone size={18} />
                    Call
                  </a>
                )}
                {githubHref && (
                  <a
                    href={githubHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ borderColor: "rgba(34,211,238,0.35)" }}
                  >
                    <Github size={18} />
                    GitHub
                  </a>
                )}
                {linkedinHref && (
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ borderColor: "rgba(167,139,250,0.45)" }}
                  >
                    <Linkedin size={18} />
                    LinkedIn
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 bg-black/20">
        <div className="mx-auto px-4 sm:px-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-white/90">{String(name).trim()}</div>
            <p className="mt-1 text-sm text-white/55 max-w-md">
              © {new Date().getFullYear()} {String(name).trim()}. Built with Portfolio 3.
            </p>
            {(socialEmail || phone) && (
              <p className="mt-2 text-xs text-white/45">
                {socialEmail && <span className="mr-3">{socialEmail}</span>}
                {phone && <span>{phone}</span>}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {navItems.map((item) => (
                <a
                  key={`f-${item.key}`}
                  href={`#${item.key === "home" ? "p3-home" : item.key}`}
                  onClick={(e) => handleNav(e, item.key)}
                  className="text-sm text-white/65 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {socialEmail && (
                <a
                  href={`mailto:${socialEmail}`}
                  className="text-xs font-medium text-violet-300/90 hover:text-violet-200"
                >
                  Email
                </a>
              )}
              {linkedinHref && (
                <a href={linkedinHref} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-violet-300/90 hover:text-violet-200">
                  LinkedIn
                </a>
              )}
              {githubHref && (
                <a href={githubHref} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-cyan-300/90 hover:text-cyan-200">
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Portfolio 1 — light theme (matches Portfolio1StaticLayout). */
const FULL_HTML_HEAD_LIGHT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <style>
    body{font-family:"Plus Jakarta Sans",system-ui,sans-serif;}
    html{scroll-behavior:smooth;}
    .p2-skill-card,.p2-project-card,.p3-card,.p1-section .rounded-xl{transition:transform 0.25s ease,box-shadow 0.25s ease;}
    .p2-skill-card:hover,.p2-project-card:hover,.p3-card:hover,.p1-section .rounded-xl:hover{transform:translateY(-4px);box-shadow:0 12px 24px -8px rgba(0,0,0,0.12);}
    a[href^="mailto:"],a[href^="https"],button{transition:transform 0.2s ease,opacity 0.2s ease;}
    a[href^="mailto:"]:hover,a[href^="https"]:hover,button:hover{transform:scale(1.02);opacity:0.95;}
    /* If any Framer node still has opacity:0 in captured HTML, avoid a blank deploy */
    .portfolio-content [style*="opacity:0"],.portfolio-content [style*="opacity: 0"]{opacity:1 !important;}
  </style>
</head>
<body class="min-h-screen bg-white text-neutral-900 antialiased">
  <div class="min-h-screen">`;

/** Portfolio 2 & 3 — dark theme (preview uses dark roots; white body was breaking deploy). */
const FULL_HTML_HEAD_DARK = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <style>
    body{font-family:"Plus Jakarta Sans",system-ui,sans-serif;background-color:#050508;color:#fafafa;}
    html{scroll-behavior:smooth;}
    .p2-skill-card,.p2-project-card,.p3-card,.p1-section .rounded-xl{transition:transform 0.25s ease,box-shadow 0.25s ease;}
    .p2-skill-card:hover,.p2-project-card:hover,.p3-card:hover{transform:translateY(-4px);box-shadow:0 12px 24px -8px rgba(0,0,0,0.35);}
    a[href^="mailto:"],a[href^="https"],button{transition:transform 0.2s ease,opacity 0.2s ease;}
    a[href^="mailto:"]:hover,a[href^="https"]:hover,button:hover{transform:scale(1.02);opacity:0.95;}
    .portfolio-content [style*="opacity:0"],.portfolio-content [style*="opacity: 0"]{opacity:1 !important;}
  </style>
</head>
<body class="min-h-screen bg-[#050508] text-white antialiased">
  <div class="min-h-screen">`;

const FULL_HTML_TAIL = `</div>
  <script>
    (function() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
      gsap.registerPlugin(ScrollTrigger);

      /*
       * Static deploy: do NOT re-hide sections/cards with ScrollTrigger (opacity stays 0 until scroll).
       * Portfolio 4 does not use .p1/.p2/.p3-section classes so it never hit this bug; P1–P3 did.
       * Show captured Framer markup immediately; keep ambient orb motion only.
       */
      var heroItems = document.querySelectorAll(".p1-hero-item, .p2-hero-item, .p3-hero-item");
      gsap.set(heroItems, { opacity: 1, y: 0 });

      var sections = document.querySelectorAll(".p1-section, .p2-section, .p3-section");
      gsap.set(sections, { opacity: 1, y: 0 });

      var cards = document.querySelectorAll(".p2-skill-card, .p2-project-card, .p3-card");
      gsap.set(cards, { opacity: 1, y: 0 });

      var avatar = document.querySelector("[class*='rounded-full'][class*='border-']");
      if (avatar && (avatar.classList.contains("border-cyan") || avatar.classList.contains("border-violet"))) {
        gsap.set(avatar, { opacity: 1, scale: 1 });
      }

      var orbs = document.querySelectorAll(".deploy-bg-orb");
      orbs.forEach(function(orb, i) {
        var d = 8 + (i % 5);
        gsap.fromTo(orb, { opacity: 0.1, scale: 1, x: 0, y: 0 }, {
          opacity: 0.22,
          scale: 1.08,
          x: i % 2 === 0 ? 25 : -20,
          y: i % 3 === 0 ? -15 : 12,
          duration: d,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "50% 50%"
        });
      });

      // Ensure ScrollTrigger correctly calculates positions after DOM + fonts/styles load.
      ScrollTrigger.refresh();
    })();
  </script>
</body></html>`;

/** Deploy shell for Portfolio 4 — must not force light body (breaks dark layout + Tailwind). */
const FULL_HTML_HEAD_PORTFOLIO4 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <style>
    body{font-family:"Plus Jakarta Sans",system-ui,sans-serif;background-color:#08080c;color:#fafafa;}
    html{scroll-behavior:smooth;}
    /* Before cursor JS runs, keep default cursor; after .p4-deploy-cursor-init, match app (cursor none). */
    html:not(.p4-deploy-cursor-init) .portfolio4-root.cursor-none{cursor:auto!important;}
    html.p4-deploy-cursor-init .portfolio4-root.cursor-none{cursor:none!important;}
    .font-inter{font-family:"Plus Jakarta Sans",system-ui,sans-serif;}
    .p2-skill-card,.p2-project-card,.p3-card,.p1-section .rounded-xl{transition:transform 0.25s ease,box-shadow 0.25s ease;}
  </style>
</head>
<body class="min-h-screen bg-[#08080c] text-white antialiased font-inter">
  <div class="min-h-screen">`;

/** Deploy shell for Portfolio 5 — dark layout + cursor + GSAP + P5 nav sync */
const FULL_HTML_HEAD_PORTFOLIO5 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <style>
    body{font-family:"Plus Jakarta Sans",system-ui,sans-serif;background-color:#060608;color:#fafafa;}
    html{scroll-behavior:smooth;}
    html:not(.p5-deploy-cursor-init) .portfolio5-root.cursor-none{cursor:auto!important;}
    html.p5-deploy-cursor-init .portfolio5-root.cursor-none{cursor:none!important;}
    .font-inter{font-family:"Plus Jakarta Sans",system-ui,sans-serif;}
  </style>
</head>
<body class="min-h-screen bg-[#060608] text-white antialiased font-inter">
  <div class="min-h-screen">`;

const FULL_HTML_TAIL_PORTFOLIO5 = `</div>
  <script>
    (function() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
      gsap.registerPlugin(ScrollTrigger);
      var blocks = document.querySelectorAll(".p5-reveal-block");
      blocks.forEach(function(el) {
        gsap.fromTo(el, { opacity: 0, y: 48 }, {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" }
        });
      });
      var heroPx = document.querySelector(".p5-hero-parallax");
      if (heroPx) {
        gsap.to(heroPx, {
          y: 48, ease: "none",
          scrollTrigger: { trigger: "#p5-home", start: "top top", end: "bottom top", scrub: 1.1 }
        });
      }
      ScrollTrigger.refresh();
    })();
  </script>
  <script>
    (function initP5NavActive() {
      var navIds = ["home", "work", "about", "contact"];
      function headerPx() {
        var h = document.querySelector(".portfolio5-root > header");
        return h ? Math.round(h.getBoundingClientRect().height) : 72;
      }
      function sync() {
        var line = window.scrollY + headerPx();
        var active = "home";
        for (var i = navIds.length - 1; i >= 0; i--) {
          var id = navIds[i];
          var el = document.getElementById("p5-" + id);
          if (!el) continue;
          var top = el.getBoundingClientRect().top + window.scrollY;
          if (line + 2 >= top) { active = id; break; }
        }
        document.querySelectorAll("[data-p5-nav]").forEach(function (a) {
          var id = a.getAttribute("data-p5-nav");
          var underline = a.querySelector("span:last-child");
          if (id === active) {
            a.classList.remove("text-white/45");
            a.classList.add("text-white");
            if (underline) { underline.style.transform = "scaleX(1)"; }
          } else {
            a.classList.remove("text-white");
            a.classList.add("text-white/45");
            if (underline) { underline.style.transform = "scaleX(0)"; }
          }
        });
      }
      var raf = 0;
      function onScroll() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sync);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      window.addEventListener("load", function () { setTimeout(sync, 50); });
      var hdr = document.querySelector(".portfolio5-root > header");
      if (hdr && typeof ResizeObserver !== "undefined") {
        new ResizeObserver(onScroll).observe(hdr);
      }
      sync();
      setTimeout(sync, 0);
      setTimeout(sync, 120);
    })();
  </script>
  <script>
    (function initP5DeployCursor() {
      try {
        if (!window.matchMedia("(pointer: fine)").matches) return;
        var ring = document.getElementById("p5-cursor-ring");
        var dot = document.getElementById("p5-cursor-dot");
        if (!ring || !dot) return;
        document.documentElement.classList.add("p5-deploy-cursor-init");
        var pos = { x: 0, y: 0 };
        var ringP = { x: 0, y: 0 };
        var dotP = { x: 0, y: 0 };
        var hover = false;
        function lerp(a, b, t) { return a + (b - a) * t; }
        window.addEventListener("pointermove", function(e) {
          pos.x = e.clientX;
          pos.y = e.clientY;
          var el = document.elementFromPoint(e.clientX, e.clientY);
          hover = !!(el && el.closest && el.closest("a[href], button, [data-cursor='pointer'], input, textarea, select"));
        }, { passive: true });
        function loop() {
          ringP.x = lerp(ringP.x, pos.x, 0.11);
          ringP.y = lerp(ringP.y, pos.y, 0.11);
          dotP.x = lerp(dotP.x, pos.x, 0.42);
          dotP.y = lerp(dotP.y, pos.y, 0.42);
          var s = hover ? 1.22 : 1;
          var rw = hover ? 40 : 34;
          var dw = hover ? 4 : 3;
          ring.style.width = rw + "px";
          ring.style.height = rw + "px";
          ring.style.transform = "translate3d(" + ringP.x + "px," + ringP.y + "px,0) translate(-50%,-50%) scale(" + s + ")";
          dot.style.width = dw + "px";
          dot.style.height = dw + "px";
          dot.style.transform = "translate3d(" + dotP.x + "px," + dotP.y + "px,0) translate(-50%,-50%)";
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      } catch (e) {}
    })();
  </script>
</body></html>`;

/** Deploy shell for Portfolio 6 — black / accent + p6 cursor + GSAP reveals */
const FULL_HTML_HEAD_PORTFOLIO6 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <style>
    body{font-family:"Plus Jakarta Sans",system-ui,sans-serif;background-color:#000000;color:#fafafa;}
    html{scroll-behavior:smooth;}
    html,body{
      overflow-x:hidden;
      scrollbar-width:none;
      -ms-overflow-style:none;
    }
    /* Hide scrollbars for any scrollable container in deployed page */
    *, *::before, *::after{
      scrollbar-width:none !important;
      -ms-overflow-style:none !important;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar,
    *::-webkit-scrollbar{
      width:0 !important;
      height:0 !important;
      display:none !important;
      background:transparent !important;
    }
    html:not(.p6-deploy-cursor-init) .portfolio6-root.cursor-none{cursor:auto!important;}
    html.p6-deploy-cursor-init .portfolio6-root.cursor-none{cursor:none!important;}
    html:not(.p7-deploy-cursor-init) .portfolio7-root.cursor-none{cursor:auto!important;}
    html.p7-deploy-cursor-init .portfolio7-root.cursor-none{cursor:none!important;}
    .font-inter{font-family:"Plus Jakarta Sans",system-ui,sans-serif;}
    .p7-deploy-render-bg{
      position:fixed;
      inset:0;
      pointer-events:none;
      z-index:0;
      overflow:hidden;
      background:
        radial-gradient(ellipse 120% 85% at 50% 30%, rgba(232,91,37,0.20), transparent 55%),
        radial-gradient(ellipse 75% 55% at 85% 20%, rgba(120,140,255,0.10), transparent 50%),
        radial-gradient(ellipse 75% 60% at 15% 80%, rgba(255,255,255,0.05), transparent 50%),
        linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 42%, rgba(0,0,0,0.78) 100%);
      animation:p7DeployBgDrift 16s ease-in-out infinite;
    }
    .p7-deploy-render-bg::before,
    .p7-deploy-render-bg::after{
      content:"";
      position:absolute;
      border-radius:9999px;
      filter:blur(50px);
      will-change:transform,opacity;
    }
    .p7-deploy-render-bg::before{
      width:44vw;height:44vw;min-width:300px;min-height:300px;
      left:-8vw;top:6vh;
      background:radial-gradient(circle at 40% 40%, rgba(232,91,37,0.34), rgba(232,91,37,0));
      animation:p7DeployOrbA 12s ease-in-out infinite;
    }
    .p7-deploy-render-bg::after{
      width:40vw;height:40vw;min-width:260px;min-height:260px;
      right:-5vw;bottom:2vh;
      background:radial-gradient(circle at 55% 45%, rgba(120,140,255,0.22), rgba(120,140,255,0));
      animation:p7DeployOrbB 15s ease-in-out infinite;
    }
    @keyframes p7DeployBgDrift{
      0%{transform:translate3d(0,0,0) scale(1.02)}
      50%{transform:translate3d(0,-10px,0) scale(1.04)}
      100%{transform:translate3d(0,0,0) scale(1.02)}
    }
    @keyframes p7DeployOrbA{
      0%,100%{transform:translate3d(0,0,0) scale(1);opacity:.18}
      50%{transform:translate3d(22px,-16px,0) scale(1.12);opacity:.30}
    }
    @keyframes p7DeployOrbB{
      0%,100%{transform:translate3d(0,0,0) scale(1.06);opacity:.12}
      50%{transform:translate3d(-24px,18px,0) scale(1.22);opacity:.22}
    }
    .p7-deploy-webgl{
      position:fixed;
      inset:0;
      width:100vw;
      height:100vh;
      pointer-events:none;
      z-index:0;
      display:block;
      opacity:.72;
    }
    .p7-deploy-loader{
      position:fixed;
      inset:0;
      z-index:9999;
      display:flex;
      align-items:center;
      justify-content:center;
      background:
        radial-gradient(circle at 50% 38%, rgba(232,91,37,0.16), transparent 50%),
        linear-gradient(180deg, #020204 0%, #000 100%);
      transition:opacity .7s ease, visibility .7s ease;
    }
    .p7-deploy-loader__inner{
      text-align:center;
      color:#f8fafc;
      letter-spacing:.18em;
      text-transform:uppercase;
      font-size:.68rem;
      opacity:.9;
    }
    .p7-deploy-loader__bar{
      margin-top:14px;
      width:180px;
      height:2px;
      background:rgba(255,255,255,.12);
      border-radius:9999px;
      overflow:hidden;
      position:relative;
    }
    .p7-deploy-loader__bar::before{
      content:"";
      position:absolute;
      inset:0;
      width:42%;
      background:linear-gradient(90deg, rgba(232,91,37,.2), rgba(232,91,37,.9), rgba(255,255,255,.75));
      transform:translateX(-120%);
      animation:p7DeployLoaderSweep 1.15s ease-in-out infinite;
    }
    .p7-deploy-loader--done{
      opacity:0;
      visibility:hidden;
      pointer-events:none;
    }
    @keyframes p7DeployLoaderSweep{
      0%{transform:translateX(-120%)}
      100%{transform:translateX(290%)}
    }
  </style>
</head>
<body class="min-h-screen bg-black text-white antialiased font-inter">
  <div class="min-h-screen">`;

const FULL_HTML_TAIL_PORTFOLIO6 = `</div>
  <script>
    (function() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
      gsap.registerPlugin(ScrollTrigger);
      var blocks = document.querySelectorAll(".p6-reveal-block");
      blocks.forEach(function(el) {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" }
        });
      });
      ScrollTrigger.refresh();
    })();
  </script>
  <script>
    (function ensureP7VisibilityInDeploy() {
      var root = document.querySelector(".portfolio7-root");
      if (!root) return;

      // Deploy loader overlay
      if (!document.querySelector(".p7-deploy-loader")) {
        var loader = document.createElement("div");
        loader.className = "p7-deploy-loader";
        loader.innerHTML = '<div class="p7-deploy-loader__inner">Loading Portfolio<div class="p7-deploy-loader__bar"></div></div>';
        document.body.appendChild(loader);
        function hideLoader() {
          loader.classList.add("p7-deploy-loader--done");
          setTimeout(function(){ loader.remove(); }, 900);
        }
        window.addEventListener("load", function(){ setTimeout(hideLoader, 240); }, { once: true });
        setTimeout(hideLoader, 1800);
      }

      // Ensure a visible cinematic background layer exists on deploy.
      if (!document.querySelector(".p7-deploy-render-bg")) {
        var bg = document.createElement("div");
        bg.className = "p7-deploy-render-bg";
        root.insertBefore(bg, root.firstChild);
      }

      // Remove runtime-only overlays that can obscure content in static deploy.
      var loader = document.getElementById("p7-loader");
      if (loader) loader.remove();
      root.querySelectorAll("canvas:not(#p7-deploy-webgl)").forEach(function(n) { n.remove(); });

      // If custom cursor script does not initialize, do not hide the native cursor.
      root.classList.remove("cursor-none");
      root.querySelectorAll(".cursor-none").forEach(function(n) { n.classList.remove("cursor-none"); });

      // Force visible/readable state for all major sections.
      root.querySelectorAll("[data-section], [data-section-inner], section, article, footer, [data-reveal], [data-stagger]").forEach(function(el) {
        el.style.opacity = "1";
        el.style.visibility = "visible";
        if (el.style.filter) el.style.filter = "none";
        if (el.style.clipPath) el.style.clipPath = "none";
      });

      // Remove old/stale nodes if present in captured HTML.
      var ach = document.getElementById("p7-achievements");
      if (ach) ach.remove();
      root.querySelectorAll("button, a, span").forEach(function(node) {
        var t = (node.textContent || "").trim().toLowerCase();
        if (t === "wins" || t === "achievements") {
          var li = node.closest("li");
          if (li) li.remove();
        }
      });
    })();
  </script>
  <script>
    (function initP7DeployWebGL() {
      var root = document.querySelector(".portfolio7-root");
      if (!root) return;
      if (document.getElementById("p7-deploy-webgl")) return;

      var canvas = document.createElement("canvas");
      canvas.id = "p7-deploy-webgl";
      canvas.className = "p7-deploy-webgl";
      root.insertBefore(canvas, root.firstChild);

      var gl = canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "high-performance" });
      if (!gl) return;

      var vsrc = "attribute vec2 aPos; varying vec2 vUv; void main(){ vUv=(aPos+1.0)*0.5; gl_Position=vec4(aPos,0.0,1.0);}"; 
      var fsrc =
        "precision mediump float;" +
        "uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; varying vec2 vUv;" +
        "float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y);} " +
        "float noise(vec2 p){ vec2 i=floor(p), f=fract(p); float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }" +
        "void main(){ vec2 uv=vUv; vec2 m=uMouse; vec2 p=uv + (m-0.5)*0.25; float t=uTime*0.18;" +
        "float n1=noise(p*5.0+t); float n2=noise((p+n1*0.12)*11.0-t*1.3);" +
        "float dist=distance(uv,m); float ripple=smoothstep(0.52,0.0,dist)*0.12;" +
        "uv += vec2(sin((uv.y+n2*0.08)*16.0+uTime)*0.02, cos((uv.x+n1*0.08)*14.0+uTime*0.8)*0.015) + ripple*vec2(sin(20.0*dist-uTime*3.6), cos(22.0*dist-uTime*3.0));" +
        "float g=noise(uv*vec2(uRes.x/uRes.y,1.0)*2.0+uTime*0.25);" +
        "vec3 base=vec3(0.02,0.02,0.03); vec3 warm=vec3(0.84,0.33,0.12); vec3 cool=vec3(0.08,0.11,0.2);" +
        "vec3 col=mix(base,cool,smoothstep(0.2,0.9,n1+n2*0.35)); col=mix(col,warm,smoothstep(0.58,1.05,n2+ripple)); col += (g-0.5)*0.06;" +
        "gl_FragColor=vec4(col,1.0); }";

      function compile(type, src) {
        var sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
        return sh;
      }
      var vs = compile(gl.VERTEX_SHADER, vsrc);
      var fs = compile(gl.FRAGMENT_SHADER, fsrc);
      if (!vs || !fs) return;
      var prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      var aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      var uRes = gl.getUniformLocation(prog, "uRes");
      var uTime = gl.getUniformLocation(prog, "uTime");
      var uMouse = gl.getUniformLocation(prog, "uMouse");
      var mouse = { x: 0.5, y: 0.5 };

      function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var w = Math.max(1, Math.floor(window.innerWidth * dpr));
        var h = Math.max(1, Math.floor(window.innerHeight * dpr));
        canvas.width = w; canvas.height = h;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", function(e){
        mouse.x = e.clientX / Math.max(window.innerWidth,1);
        mouse.y = 1.0 - (e.clientY / Math.max(window.innerHeight,1));
      }, { passive: true });

      var start = performance.now();
      function frame(now) {
        gl.uniform1f(uTime, (now - start) * 0.001);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })();
  </script>
  <script>
    (function initP6NavActive() {
      var navIds = ["home", "work", "services", "about", "contact"];
      function headerPx() {
        var h = document.querySelector(".p6-site-header");
        return h ? Math.round(h.getBoundingClientRect().height) : 72;
      }
      function sync() {
        var line = window.scrollY + headerPx();
        var active = "home";
        for (var i = navIds.length - 1; i >= 0; i--) {
          var id = navIds[i];
          var el = document.getElementById("p6-" + id);
          if (!el) continue;
          var top = el.getBoundingClientRect().top + window.scrollY;
          if (line + 2 >= top) { active = id; break; }
        }
        document.querySelectorAll("[data-p6-nav]").forEach(function (a) {
          var id = a.getAttribute("data-p6-nav");
          if (id === active) { a.classList.add("text-white"); a.classList.remove("text-white/50"); }
          else { a.classList.remove("text-white"); a.classList.add("text-white/50"); }
        });
      }
      var raf = 0;
      function onScroll() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sync);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      window.addEventListener("load", function () { setTimeout(sync, 50); });
      var hdr = document.querySelector(".p6-site-header");
      if (hdr && typeof ResizeObserver !== "undefined") {
        new ResizeObserver(onScroll).observe(hdr);
      }
      sync();
      setTimeout(sync, 0);
      setTimeout(sync, 120);
    })();
  </script>
  <script>
    (function initP7HeaderAndNav() {
      var root = document.querySelector(".portfolio7-root");
      if (!root) return;
      var header = document.querySelector(".p7-header-shell");
      if (!header) return;
      var progress = header.querySelector(".p7-header-progress");
      var navButtons = Array.prototype.slice.call(header.querySelectorAll("nav button"));
      var ids = ["p7-hero","p7-about","p7-skills","p7-experience","p7-projects","p7-education","p7-certifications","p7-languages","p7-contact"];
      var labelToId = {
        intro: "p7-hero",
        about: "p7-about",
        skills: "p7-skills",
        work: "p7-experience",
        projects: "p7-projects",
        education: "p7-education",
        certs: "p7-certifications",
        languages: "p7-languages",
        contact: "p7-contact"
      };

      function setActive(id) {
        navButtons.forEach(function(btn) {
          var label = (btn.textContent || "").trim().toLowerCase();
          var btnId = labelToId[label];
          if (btnId === id) {
            btn.classList.add("bg-[#e85b25]", "text-black");
            btn.classList.remove("text-white/50");
          } else {
            btn.classList.remove("bg-[#e85b25]", "text-black");
            if (!btn.classList.contains("text-white/50")) btn.classList.add("text-white/50");
          }
        });
      }

      var raf = 0;
      function sync() {
        var y = window.scrollY || document.documentElement.scrollTop || 0;
        var max = Math.max((document.documentElement.scrollHeight || 0) - window.innerHeight, 1);
        var p = Math.max(0, Math.min(1, y / max));
        if (progress) progress.style.transform = "scaleX(" + p + ")";
        header.classList.toggle("p7-header--dense", y > 64);

        var line = y + 120;
        var active = "p7-hero";
        for (var i = ids.length - 1; i >= 0; i--) {
          var el = document.getElementById(ids[i]);
          if (!el) continue;
          var top = el.getBoundingClientRect().top + y;
          if (line >= top) { active = ids[i]; break; }
        }
        setActive(active);
      }
      function onScroll() { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      window.addEventListener("load", function() { setTimeout(sync, 40); });
      sync();
      setTimeout(sync, 0);
      setTimeout(sync, 120);
    })();
  </script>
  <script>
    (function initP6DeployCursor() {
      try {
        if (!window.matchMedia("(pointer: fine)").matches) return;
        var ring = document.getElementById("p6-cursor-ring") || document.getElementById("p7-cursor-ring");
        var dot = document.getElementById("p6-cursor-dot") || document.getElementById("p7-cursor-dot");
        if (!ring || !dot) return;
        if (document.querySelector(".portfolio7-root")) document.documentElement.classList.add("p7-deploy-cursor-init");
        else document.documentElement.classList.add("p6-deploy-cursor-init");
        var pos = { x: 0, y: 0 };
        var ringP = { x: 0, y: 0 };
        var dotP = { x: 0, y: 0 };
        var hover = false;
        function lerp(a, b, t) { return a + (b - a) * t; }
        window.addEventListener("pointermove", function(e) {
          pos.x = e.clientX;
          pos.y = e.clientY;
          var el = document.elementFromPoint(e.clientX, e.clientY);
          hover = !!(el && el.closest && el.closest("a[href], button, [data-cursor='pointer'], input, textarea, select"));
        }, { passive: true });
        function loop() {
          ringP.x = lerp(ringP.x, pos.x, 0.12);
          ringP.y = lerp(ringP.y, pos.y, 0.12);
          dotP.x = lerp(dotP.x, pos.x, 0.45);
          dotP.y = lerp(dotP.y, pos.y, 0.45);
          var s = hover ? 1.28 : 1;
          var rw = hover ? 44 : 36;
          var dw = hover ? 5 : 3;
          ring.style.width = rw + "px";
          ring.style.height = rw + "px";
          ring.style.transform = "translate3d(" + ringP.x + "px," + ringP.y + "px,0) translate(-50%,-50%) scale(" + s + ")";
          dot.style.width = dw + "px";
          dot.style.height = dw + "px";
          dot.style.transform = "translate3d(" + dotP.x + "px," + dotP.y + "px,0) translate(-50%,-50%)";
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      } catch (e) {}
    })();
  </script>
</body></html>`;

/** Deploy shell for Portfolio 7 — keep captured markup stable, no p6 runtime scripts. */
const FULL_HTML_HEAD_PORTFOLIO7 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body{font-family:"Plus Jakarta Sans",system-ui,sans-serif;background-color:#000;color:#fafafa;}
    html{scroll-behavior:smooth;}
    .font-inter{font-family:"Plus Jakarta Sans",system-ui,sans-serif;}
    .portfolio-content [style*="opacity:0"],.portfolio-content [style*="opacity: 0"]{opacity:1 !important;}
    .portfolio-content [style*="visibility:hidden"],.portfolio-content [style*="visibility: hidden"]{visibility:visible !important;}

    /* Lightweight deploy-only motion fallback for Portfolio 7 */
    @keyframes p7DeployFadeUp {
      0% { opacity: 0; transform: translate3d(0, 18px, 0) scale(0.995); filter: blur(5px); }
      100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
    }
    @keyframes p7DeployFloat {
      0%,100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0, -7px, 0); }
    }
    @keyframes p7DeployPulse {
      0%,100% { opacity: 0.45; transform: scale(1); }
      50% { opacity: 0.9; transform: scale(1.35); }
    }
    @keyframes p7DeployBackdropDrift {
      0% { transform: translate3d(0, 0, 0) scale(1.02); }
      50% { transform: translate3d(0, -10px, 0) scale(1.035); }
      100% { transform: translate3d(0, 0, 0) scale(1.02); }
    }
    @keyframes p7DeployOrbA {
      0%,100% { transform: translate3d(0,0,0) scale(1); opacity: 0.16; }
      50% { transform: translate3d(20px,-14px,0) scale(1.1); opacity: 0.26; }
    }
    @keyframes p7DeployOrbB {
      0%,100% { transform: translate3d(0,0,0) scale(1.06); opacity: 0.1; }
      50% { transform: translate3d(-22px,18px,0) scale(1.2); opacity: 0.2; }
    }
    .p7-deploy-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .p7-deploy-bg__orb {
      position: absolute;
      border-radius: 9999px;
      filter: blur(48px);
      will-change: transform, opacity;
    }
    .p7-deploy-bg__orb--a {
      width: 48vw; height: 48vw; min-width: 320px; min-height: 320px;
      background: radial-gradient(circle at 40% 40%, rgba(232,91,37,0.35), rgba(232,91,37,0));
      left: -10vw; top: 8vh;
      animation: p7DeployOrbA 13s ease-in-out infinite;
    }
    .p7-deploy-bg__orb--b {
      width: 42vw; height: 42vw; min-width: 280px; min-height: 280px;
      background: radial-gradient(circle at 55% 45%, rgba(120,140,255,0.22), rgba(120,140,255,0));
      right: -6vw; bottom: 2vh;
      animation: p7DeployOrbB 16s ease-in-out infinite;
    }

    .portfolio7-root .p7-header-shell {
      animation: p7DeployFadeUp 0.7s cubic-bezier(.22,.61,.36,1) both;
    }
    .portfolio7-root [data-section],
    .portfolio7-root [data-horizontal-track],
    .portfolio7-root #p7-hero,
    .portfolio7-root #p7-contact {
      animation: p7DeployFadeUp 0.85s cubic-bezier(.22,.61,.36,1) both;
    }
    .portfolio7-root [data-section]:nth-of-type(2) { animation-delay: 0.06s; }
    .portfolio7-root [data-section]:nth-of-type(3) { animation-delay: 0.11s; }
    .portfolio7-root [data-section]:nth-of-type(4) { animation-delay: 0.16s; }
    .portfolio7-root [data-section]:nth-of-type(5) { animation-delay: 0.21s; }
    .portfolio7-root [data-section]:nth-of-type(6) { animation-delay: 0.26s; }

    .portfolio7-root [data-horizontal-inner] > * {
      animation: p7DeployFloat 7.5s ease-in-out infinite;
      will-change: transform;
    }
    .portfolio7-root [data-horizontal-inner] > *:nth-child(2n) { animation-delay: 0.6s; }
    .portfolio7-root [data-horizontal-inner] > *:nth-child(3n) { animation-delay: 1.1s; }

    .portfolio7-root #p7-orb {
      transform-origin: center;
      animation: p7DeployPulse 3.2s ease-in-out infinite;
    }
    .portfolio7-root .mix-blend-screen {
      animation: p7DeployBackdropDrift 14s ease-in-out infinite;
      will-change: transform;
    }
  </style>
</head>
<body class="min-h-screen bg-black text-white antialiased font-inter">
  <div class="min-h-screen">`;

const FULL_HTML_TAIL_PORTFOLIO7 = `</div>
  <script>
    (function() {
      // Defensive fallback: if stale deployed cache still includes wins/achievements, remove it.
      document.querySelector("#p7-achievements")?.remove();
      document.querySelectorAll("button, a, span").forEach(function(node) {
        var t = (node.textContent || "").trim().toLowerCase();
        if (t === "wins" || t === "achievements") {
          var li = node.closest("li");
          if (li) li.remove();
        }
      });
    })();
  </script>
</body></html>`;

const FULL_HTML_TAIL_PORTFOLIO4 = `</div>
  <script>
    (function() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
      gsap.registerPlugin(ScrollTrigger);

      var line = document.querySelector(".p4-about-line");
      if (line) {
        gsap.fromTo(line, { scaleX: 0, transformOrigin: "left center" }, {
          scaleX: 1,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: line, start: "top 90%", toggleActions: "play none none none" }
        });
      }

      var heroItems = document.querySelectorAll(".p1-hero-item, .p2-hero-item, .p3-hero-item");
      if (heroItems.length) {
        gsap.fromTo(heroItems, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.2 });
      }

      var sections = document.querySelectorAll(".p1-section, .p2-section, .p3-section");
      sections.forEach(function(section) {
        gsap.fromTo(section, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 0.75, ease: "power3.out", immediateRender: false,
          scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none reverse" }
        });
      });

      var orbs = document.querySelectorAll(".deploy-bg-orb");
      orbs.forEach(function(orb, i) {
        var d = 8 + (i % 5);
        gsap.fromTo(orb, { opacity: 0.1, scale: 1, x: 0, y: 0 }, {
          opacity: 0.22, scale: 1.08, x: i % 2 === 0 ? 25 : -20, y: i % 3 === 0 ? -15 : 12,
          duration: d, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%"
        });
      });

      ScrollTrigger.refresh();
    })();
  </script>
  <script>
    (function initP4NavActive() {
      var navIds = ["home", "projects", "skills"];
      function headerPx() {
        var h = document.querySelector(".portfolio4-root > header");
        return h ? Math.round(h.getBoundingClientRect().height) : 56;
      }
      function sync() {
        var line = window.scrollY + headerPx();
        var active = "home";
        for (var i = navIds.length - 1; i >= 0; i--) {
          var id = navIds[i];
          var el = document.getElementById("p4-" + id);
          if (!el) continue;
          var top = el.getBoundingClientRect().top + window.scrollY;
          if (line + 1 >= top) {
            active = id;
            break;
          }
        }
        document.querySelectorAll("[data-p4-nav]").forEach(function (a) {
          var id = a.getAttribute("data-p4-nav");
          if (id === active) {
            a.classList.remove("text-white/50", "hover:text-white/88");
            a.classList.add("text-white");
          } else {
            a.classList.remove("text-white");
            a.classList.add("text-white/50", "hover:text-white/88");
          }
        });
      }
      var raf = 0;
      function onScroll() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sync);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      window.addEventListener("hashchange", onScroll);
      window.addEventListener("load", function () {
        setTimeout(sync, 50);
      });
      var hdr = document.querySelector(".portfolio4-root > header");
      if (hdr && typeof ResizeObserver !== "undefined") {
        new ResizeObserver(onScroll).observe(hdr);
      }
      sync();
      setTimeout(sync, 0);
      setTimeout(sync, 120);
    })();
  </script>
  <script>
    (function initP4DeployCursor() {
      try {
        if (!window.matchMedia("(pointer: fine)").matches) return;
        var ring = document.getElementById("p4-cursor-ring");
        var dot = document.getElementById("p4-cursor-dot");
        if (!ring || !dot) return;
        document.documentElement.classList.add("p4-deploy-cursor-init");
        var pos = { x: 0, y: 0 };
        var ringP = { x: 0, y: 0 };
        var dotP = { x: 0, y: 0 };
        var hover = false;
        function lerp(a, b, t) { return a + (b - a) * t; }
        window.addEventListener("pointermove", function(e) {
          pos.x = e.clientX;
          pos.y = e.clientY;
          var el = document.elementFromPoint(e.clientX, e.clientY);
          hover = !!(el && el.closest && el.closest("a[href], button, [data-cursor='pointer'], input, textarea, select"));
        }, { passive: true });
        function loop() {
          ringP.x = lerp(ringP.x, pos.x, 0.12);
          ringP.y = lerp(ringP.y, pos.y, 0.12);
          dotP.x = lerp(dotP.x, pos.x, 0.45);
          dotP.y = lerp(dotP.y, pos.y, 0.45);
          var s = hover ? 1.65 : 1;
          var rw = hover ? 44 : 36;
          var dw = hover ? 5 : 4;
          ring.style.width = rw + "px";
          ring.style.height = rw + "px";
          ring.style.transform = "translate3d(" + ringP.x + "px," + ringP.y + "px,0) translate(-50%,-50%) scale(" + s + ")";
          dot.style.width = dw + "px";
          dot.style.height = dw + "px";
          dot.style.transform = "translate3d(" + dotP.x + "px," + dotP.y + "px,0) translate(-50%,-50%)";
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      } catch (e) {}
    })();
  </script>
</body></html>`;

/**
 * Scroll through the portfolio root so Framer whileInView finishes before innerHTML capture.
 * Uses instant scroll (scrollTop) so scroll-behavior:smooth cannot leave the sweep incomplete.
 */
async function flushAnimationsBeforeDeployCapture(portfolioRootEl) {
  if (typeof window === "undefined") return;

  const htmlEl = document.documentElement;
  const prevHtml = htmlEl.style.scrollBehavior;
  const prevBody = document.body.style.scrollBehavior;
  htmlEl.style.scrollBehavior = "auto";
  document.body.style.scrollBehavior = "auto";

  try {
    await document.fonts.ready.catch(() => {});
    await new Promise((r) => setTimeout(r, 280));
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();

    if (portfolioRootEl) {
      const blocks = portfolioRootEl.querySelectorAll("section, footer");
      for (const node of blocks) {
        node.scrollIntoView({ block: "center", behavior: "auto" });
        await new Promise((r) => setTimeout(r, 95));
      }
    }

    const rootH = portfolioRootEl?.scrollHeight ?? 0;
    const docH = Math.max(htmlEl.scrollHeight, document.body.scrollHeight, rootH);
    const maxScroll = Math.max(docH - window.innerHeight, 0);
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const top = Math.round((maxScroll * i) / steps);
      htmlEl.scrollTop = top;
      document.body.scrollTop = top;
      await new Promise((r) => setTimeout(r, 65));
    }
    await new Promise((r) => setTimeout(r, 380));
    htmlEl.scrollTop = 0;
    document.body.scrollTop = 0;
    await new Promise((r) => setTimeout(r, 180));
  } finally {
    htmlEl.style.scrollBehavior = prevHtml;
    document.body.style.scrollBehavior = prevBody;
  }
}

/**
 * Portfolio 7 uses runtime-only layers (loader/cursor/webgl/horizontal pin).
 * For static HTML deploy, convert to a stable snapshot so deployed output matches preview visually.
 */
function _preparePortfolio7DeployHtml(portfolioRootEl) {
  if (!portfolioRootEl) return "";
  const clone = portfolioRootEl.cloneNode(true);

  // Remove runtime overlays that depend on React hooks/RAF.
  clone.querySelector("#p7-loader")?.remove();
  clone.querySelectorAll("canvas").forEach((n) => n.remove());
  clone.querySelectorAll("#p7-cursor-ring, #p7-cursor-dot").forEach((n) => n.remove());

  // Remove sticky/fixed adorners that can look broken in static output.
  clone.querySelectorAll(".p7-header-progress").forEach((n) => n.style.transform = "scaleX(1)");

  // Ensure no animated/scroll-state inline styles remain frozen in "hidden/blurred" states.
  clone.querySelectorAll("[data-section], [data-section-inner], section, article, footer, [data-reveal], [data-stagger]").forEach((el) => {
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.filter = "none";
    el.style.clipPath = "none";
    el.style.transformOrigin = "";
  });
  // Only force-reset transform for containers that commonly freeze from ScrollTrigger pinning.
  clone.querySelectorAll("[data-section-inner], [data-horizontal-inner]").forEach((el) => {
    el.style.transform = "none";
  });

  // Remove stale "Wins/Achievements" artifacts if an old nav/section slipped into capture.
  clone.querySelector("#p7-achievements")?.remove();
  clone.querySelectorAll("button, a, span").forEach((node) => {
    const txt = (node.textContent || "").trim().toLowerCase();
    if (txt === "wins" || txt === "achievements") {
      const li = node.closest("li");
      if (li) li.remove();
    }
  });

  // Keep deploy readable: disable custom cursor mode and force normal cursor.
  clone.classList.remove("cursor-none");
  clone.querySelectorAll(".cursor-none").forEach((n) => n.classList.remove("cursor-none"));

  // Convert pinned horizontal projects into normal stacked cards for static deploy.
  const track = clone.querySelector("[data-horizontal-track]");
  const inner = clone.querySelector("[data-horizontal-inner]");
  if (track && inner) {
    track.style.height = "auto";
    track.style.overflow = "visible";
    inner.style.display = "grid";
    inner.style.gridTemplateColumns = "1fr";
    inner.style.width = "100%";
    inner.style.transform = "none";
    inner.style.gap = "1rem";
    inner.style.paddingTop = "5rem";
    inner.style.paddingBottom = "2rem";
    inner.querySelectorAll("[data-parallax], [data-micro]").forEach((card) => {
      card.style.width = "100%";
      card.style.maxWidth = "100%";
      card.style.height = "auto";
      card.style.transform = "none";
      card.style.opacity = "1";
      card.style.filter = "none";
    });
  }

  // Inject deploy-only animated background layer so deployed version keeps motion feel.
  if (clone.classList.contains("portfolio7-root")) {
    const bg = document.createElement("div");
    bg.className = "p7-deploy-bg";
    bg.innerHTML = `
      <span class="p7-deploy-bg__orb p7-deploy-bg__orb--a"></span>
      <span class="p7-deploy-bg__orb p7-deploy-bg__orb--b"></span>
    `;
    clone.prepend(bg);
    clone.style.position = "relative";
  }

  return clone.innerHTML;
}

export default function PortfolioDesignView() {
  const { id } = useParams();
  const user = useSelector((state) => state.user.userData);
  const isPremium = !!user?.Premium;
  const isLoggedIn = !!user || (typeof window !== "undefined" && !!localStorage.getItem("accessToken"));
  const [template, setTemplate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const portfolioContentRef = useRef(null);
  const toast = useToast();
  const { status: usageStatus, refresh: refreshUsage } = useUsageStatus(
    isPremium && !!(user?.emailVerified || user?.googleId)
  );
  const deployBlocked = isUsageBlocked(usageStatus?.portfolioDeploy);

  const handleDeploy = async () => {
    if (!portfolioContentRef.current || !template) return;
    if (deployBlocked) return;
    setDeploying(true);
    try {
      const layout = getLayoutType(template);

      /** All templates use Framer Motion + in-view; flush so captured innerHTML is visible on static deploy. */
      await flushAnimationsBeforeDeployCapture(portfolioContentRef.current);
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );

      const content = portfolioContentRef.current.innerHTML;
      const htmlContent =
        layout === "portfolio7" || layout === "portfolio6"
          ? FULL_HTML_HEAD_PORTFOLIO6 + content + FULL_HTML_TAIL_PORTFOLIO6
          : layout === "portfolio5"
          ? FULL_HTML_HEAD_PORTFOLIO5 + content + FULL_HTML_TAIL_PORTFOLIO5
          : layout === "portfolio4"
          ? FULL_HTML_HEAD_PORTFOLIO4 + content + FULL_HTML_TAIL_PORTFOLIO4
          : layout === "portfolio1"
            ? FULL_HTML_HEAD_LIGHT + content + FULL_HTML_TAIL
            : FULL_HTML_HEAD_DARK + content + FULL_HTML_TAIL;
      const accessToken = localStorage.getItem("accessToken");
      const { data: res } = await axios.post(
        `${API_BASE}/deploy-portfolio`,
        { htmlContent },
        {
          withCredentials: true,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      const message = res?.message || "Portfolio deployed successfully.";
      const deployedUrl = res?.data?.url;
      if (deployedUrl && typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            "intervexa:dashboardDeployNotice",
            JSON.stringify({ url: deployedUrl, at: Date.now() })
          );
        } catch {
          /* ignore quota / private mode */
        }
      }
      toast.success(
        deployedUrl
          ? "Portfolio deployed! Your live link is saved — open Dashboard to view and copy it."
          : message
      );
      refreshUsage();
    } catch (err) {
      const d = err?.response?.data;
      let msg = d?.message ?? err?.message ?? "Deployment failed";
      if (err?.response?.status === 429 && d?.resetsAt) {
        msg = `${msg} ${formatResetsLabel(d.resetsAt)}`;
      }
      toast.error(msg);
      if (err?.response?.status === 429) refreshUsage();
    } finally {
      setDeploying(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No template ID");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: res } = await axios.get(`${API_BASE}/templates/${id}`);
        if (!cancelled && res?.success && res?.data) setTemplate(res.data);
        else if (!cancelled) setError("Template not found");
      } catch (err) {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || "Failed to load template");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      const content = await getResumeContentForView();
      if (!cancelled) {
        setData(content);
        setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const displayData = data || PLACEHOLDER_PORTFOLIO_DATA;
  const isPlaceholder = !data;

  if (loading || detailLoading) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-neutral-500">Loading…</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 sm:p-10 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">Project is premium</h1>
            <p className="text-neutral-600 text-sm sm:text-base mb-6">
              Upgrade to view and use project templates.
            </p>
            <Link
              to="/price"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-3 text-sm font-medium text-white hover:bg-amber-500 transition-all"
            >
              <Lock className="h-4 w-4" /> Upgrade to unlock
            </Link>
          </div>
          <Link to="/templates" className="mt-6 text-neutral-500 hover:text-neutral-700 text-sm">
            <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to template type
          </Link>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-white text-neutral-800 flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <p className="text-amber-600">{error || "Template not found"}</p>
          <Link
            to="/templates/portfoliodesign"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft size={18} /> Back to project designs
          </Link>
        </main>
        <AppFooter />
      </div>
    );
  }

  const layout = getLayoutType(template);
  const isPortfolio2 = layout === "portfolio2";
  const isPortfolio3 = layout === "portfolio3";
  const isPortfolio4 = layout === "portfolio4";
  const isPortfolio5 = layout === "portfolio5";
  const isPortfolio6 = layout === "portfolio6";
  const isPortfolio7 = layout === "portfolio7";

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isPortfolio7 || isPortfolio6 || isPortfolio5
          ? "bg-transparent text-white"
          : isPortfolio4
          ? "bg-transparent text-white"
          : isPortfolio3
            ? "bg-black text-white"
            : isPortfolio2
              ? "bg-[#050508] text-white"
              : "bg-white text-neutral-900"
      }`}
      id="home"
    >
      {isPlaceholder && (
        <div className="print:hidden bg-amber-500/20 border-b border-amber-400/30 px-3 sm:px-4 py-2.5">
          <div className=" mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2 text-sm">
            <p className="text-amber-800">
              {isLoggedIn
                ? "Add or upload your resume to see your own details here. You can edit from Edit resume or Add details."
                : "Viewing with sample data. Sign in to use your own details and save your project."}
            </p>
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/upload"
                    className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400"
                  >
                    Upload resume
                  </Link>
                  <Link
                    to="/add-details"
                    className="inline-flex items-center rounded-lg border border-amber-600/50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:text-amber-900"
                  >
                    Add details
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center rounded-lg border border-amber-600/50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:text-amber-900"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="print:hidden fixed top-4 right-4 z-[100] flex max-w-[min(100vw-1.5rem,18rem)] flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <Link
            to="/templates/portfoliodesign"
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              isPortfolio7 || isPortfolio6 || isPortfolio5 || isPortfolio4 || isPortfolio3
                ? "text-white/80 hover:text-white"
                : isPortfolio2
                  ? "text-white/80 hover:text-cyan-400"
                  : "text-neutral-600 hover:text-black"
            }`}
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <button
            type="button"
            onClick={handleDeploy}
            disabled={deploying || deployBlocked}
            title={
              deployBlocked
                ? formatResetsLabel(usageStatus?.portfolioDeploy?.resetsAt)
                : undefined
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed ${
              isPortfolio7 || isPortfolio6 || isPortfolio5 || isPortfolio4 || isPortfolio3
                ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                : isPortfolio2
                  ? "border-cyan-400 bg-cyan-600 text-white hover:bg-cyan-500"
                  : "border-violet-500 bg-violet-600 text-white hover:bg-violet-500"
            }`}
          >
            <Upload size={14} /> {deploying ? "Deploying…" : "Deploy to Vercel"}
          </button>
        </div>
        {deployBlocked ? (
          <p
            className={`text-right text-[10px] leading-snug sm:text-xs ${
              isPortfolio7 || isPortfolio6 || isPortfolio5 || isPortfolio4 || isPortfolio3 || isPortfolio2 ? "text-amber-200/95" : "text-amber-700"
            }`}
          >
            10 deploys/day reached. {formatResetsLabel(usageStatus?.portfolioDeploy?.resetsAt)}
          </p>
        ) : null}
      </div>

      <PortfolioHTMLDownload showDownloadHeader={false} portfolioRef={portfolioContentRef}>
        {isPortfolio7 ? (
          <Portfolio7Layout data={displayData} />
        ) : isPortfolio6 ? (
          <Portfolio6Layout data={displayData} />
        ) : isPortfolio5 ? (
          <Portfolio5Layout data={displayData} />
        ) : isPortfolio4 ? (
          <Portfolio4Layout data={displayData} />
        ) : isPortfolio3 ? (
          <Portfolio3Layout data={displayData} />
        ) : isPortfolio2 ? (
          <Portfolio2Layout data={displayData} />
        ) : (
          <Portfolio1StaticLayout data={displayData} />
        )}
      </PortfolioHTMLDownload>
    </div>
  );
}
