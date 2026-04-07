import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

import { setupGsap } from "./utils/gsapConfig.js";
import { useLenis } from "./hooks/useLenis.js";
import { useScrollAnimations } from "./hooks/useScrollAnimations.js";
import {
  parseExperienceList,
  parseEducationBlocks,
  normalizeSkills,
  normalizeStringList,
  languageLines,
  normalizeExperienceToStrings,
} from "./utils/parseResumeFields.js";
import { limitAchievements } from "../../../utils/resumeAchievements.js";
import { parseProjectForResume } from "../../../utils/projectForm.js";

import Loader from "./components/Loader.jsx";
import Cursor from "./components/Cursor.jsx";
import WebGLScene from "./components/WebGLScene.jsx";
import SiteNav from "./components/SiteNav.jsx";
import AmbientScrollBackdrop from "./components/AmbientScrollBackdrop.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import SkillsSection from "./components/SkillsSection.jsx";
import ExperienceSection from "./components/ExperienceSection.jsx";
import HorizontalScroll from "./components/HorizontalScroll.jsx";
import EducationSection from "./components/EducationSection.jsx";
import AchievementsSection from "./components/AchievementsSection.jsx";
import CertificationsSection from "./components/CertificationsSection.jsx";
import LanguagesSection from "./components/LanguagesSection.jsx";
import Footer from "./components/Footer.jsx";

setupGsap();

const NAV_ITEMS = [
  { id: "p7-hero", label: "Intro" },
  { id: "p7-about", label: "About" },
  { id: "p7-skills", label: "Skills" },
  { id: "p7-experience", label: "Work" },
  { id: "p7-projects", label: "Projects" },
  { id: "p7-education", label: "Education" },
  { id: "p7-achievements", label: "Wins" },
  { id: "p7-certifications", label: "Certs" },
  { id: "p7-languages", label: "Languages" },
  { id: "p7-contact", label: "Contact" },
];

function parseProjects(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const n = parseProjectForResume(item);
      if (!n.title && !n.description && !n.link) return null;
      return {
        title: n.title || `Project ${index + 1}`,
        description: n.description,
        link: n.link || "",
      };
    })
    .filter(Boolean);
}

function cleanUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  return value.startsWith("http") ? value : `https://${value}`;
}

export default function Portfolio7Layout({ data }) {
  const rootRef = useRef(null);
  const headerShellRef = useRef(null);
  const lenisRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(true);
  const [activeId, setActiveId] = useState("p7-hero");

  const name = String(data?.name || "Your Name").trim();
  const role = String(data?.role || "Creative Developer").trim();
  const summary = String(
    data?.summary || "Build immersive products that blend storytelling, motion and code."
  ).trim();
  const philosophy = String(data?.lifePhilosophy || data?.tagline || "").trim();
  const skills = useMemo(() => normalizeSkills(data?.skills), [data?.skills]);
  const experienceRaw = useMemo(() => (Array.isArray(data?.experience) ? data.experience : []), [data]);
  const experienceStrings = useMemo(() => normalizeExperienceToStrings(experienceRaw), [experienceRaw]);
  const parsedExperience = useMemo(() => parseExperienceList(experienceStrings), [experienceStrings]);
  const educationBlocks = useMemo(() => parseEducationBlocks(data?.education), [data?.education]);
  const projects = useMemo(() => parseProjects(data?.projects), [data?.projects]);
  const achievements = useMemo(() => limitAchievements(data?.achievements), [data?.achievements]);
  const certifications = useMemo(() => normalizeStringList(data?.certifications), [data?.certifications]);
  const languages = useMemo(() => languageLines(data?.languageProficiency), [data?.languageProficiency]);

  const email = String(data?.email || "").trim();
  const phone = String(data?.phone || "").trim();
  const location = String(data?.location || data?.address || "").trim();
  const linkedin = cleanUrl(data?.linkedin);
  const github = cleanUrl(data?.github);
  const links = [
    { label: "LinkedIn", href: linkedin },
    { label: "GitHub", href: github },
  ].filter((item) => item.href);

  useLenis(!reducedMotion, lenisRef);
  useScrollAnimations(rootRef, [
    projects.length,
    parsedExperience.length,
    skills.length,
    summary,
    educationBlocks.length,
    achievements.length,
    certifications.length,
    languages.length,
  ]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const header = headerShellRef.current;
    if (!root || !header) return undefined;

    const progressEl = header.querySelector(".p7-header-progress");
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const p = self.progress;
          header.classList.toggle("p7-header--dense", self.scroll() > 64);
          if (progressEl) gsap.set(progressEl, { scaleX: p, transformOrigin: "left center" });
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -118, duration: 1.15 });
    } else {
      el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  }, [reducedMotion]);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlScrollbarWidth = html.style.scrollbarWidth;
    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyScrollbarWidth = body.style.scrollbarWidth;
    const prevBodyMsOverflowStyle = body.style.msOverflowStyle;
    const prevBodyOverflowY = body.style.overflowY;
    const prevBodyOverflowX = body.style.overflowX;

    html.style.scrollbarWidth = "none";
    html.style.overflowX = "hidden";
    body.style.scrollbarWidth = "none";
    body.style.msOverflowStyle = "none";
    body.style.overflowY = "auto";
    body.style.overflowX = "hidden";

    const styleTag = document.createElement("style");
    styleTag.setAttribute("data-p7-hide-scrollbar", "true");
    styleTag.textContent = `
      html, body {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      .portfolio7-root::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        background: transparent !important;
        display: none !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      html.style.scrollbarWidth = prevHtmlScrollbarWidth;
      html.style.overflowX = prevHtmlOverflowX;
      body.style.scrollbarWidth = prevBodyScrollbarWidth;
      body.style.msOverflowStyle = prevBodyMsOverflowStyle;
      body.style.overflowY = prevBodyOverflowY;
      body.style.overflowX = prevBodyOverflowX;
      styleTag.remove();
    };
  }, []);

  useEffect(() => {
    const observers = [];
    for (const { id } of NAV_ITEMS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const o = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActiveId(id);
          });
        },
        { rootMargin: "-44% 0px -44% 0px", threshold: 0 }
      );
      o.observe(el);
      observers.push(o);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [
    projects.length,
    parsedExperience.length,
    skills.length,
    educationBlocks.length,
    certifications.length,
    languages.length,
  ]);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      "#p7-loader h2",
      { yPercent: 24, opacity: 0, letterSpacing: "0.05em" },
      { yPercent: 0, opacity: 1, letterSpacing: "0.02em", duration: 0.8, ease: "power3.out" }
    )
      .to("#p7-loader p", { opacity: 0.35, duration: 0.5 }, 0.2)
      .to("#p7-loader", { opacity: 0, duration: 0.9, delay: 0.2, ease: "power3.inOut" })
      .set("#p7-loader", { display: "none" });
    return () => tl.kill();
  }, []);

  useEffect(() => {
    const tween = gsap.to("#p7-orb", {
      duration: 14,
      repeat: -1,
      ease: "none",
      motionPath: {
        path: "#p7-motion-path",
        align: "#p7-motion-path",
        autoRotate: false,
        alignOrigin: [0.5, 0.5],
      },
    });
    return () => tween.kill();
  }, []);

  useEffect(() => {
    if (!finePointer) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    const elements = Array.from(root.querySelectorAll("[data-micro]"));
    const cleanups = elements.map((el) => {
      gsap.set(el, { transformOrigin: "center center" });
      const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
      const rTo = gsap.quickTo(el, "rotationZ", { duration: 0.45, ease: "power3.out" });

      const move = (event) => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        xTo(px * 10);
        yTo(py * 10);
        rTo(px * 2.2);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
        rTo(0);
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      return () => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [finePointer, projects.length, skills.length, parsedExperience.length, achievements.length, certifications.length]);

  const goContact = () => scrollToId("p7-contact");
  const projectList =
    projects.length > 0
      ? projects
      : [{ title: "Featured narrative", description: "Add projects in your profile to replace this card." }];

  return (
    <div
      ref={rootRef}
      className={`portfolio7-root relative min-h-screen overflow-x-hidden bg-black text-white ${finePointer ? "cursor-none" : ""}`}
      style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <Loader name={name} role={role} />
      <WebGLScene containerRef={rootRef} />
      <AmbientScrollBackdrop />
      <SiteNav
        ref={headerShellRef}
        items={NAV_ITEMS}
        onNavigate={scrollToId}
        activeId={activeId}
        displayName={name}
        displayRole={role}
        onContact={goContact}
      />
      <Cursor enabled={finePointer} rootRef={rootRef} />
      <svg
        className="pointer-events-none fixed inset-0 z-[3] h-full w-full opacity-35"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          id="p7-motion-path"
          d="M2,18 C30,6 64,26 98,14 C78,44 25,48 2,82 C34,70 64,92 98,80"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.15"
        />
        <circle id="p7-orb" cx="2" cy="18" r="1.2" fill="#e85b25" />
      </svg>

      <div className="pointer-events-none fixed inset-0 z-[2] opacity-[0.26] mix-blend-overlay [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:3px_3px]" />
      <style>{`
        .p7-header-shell.p7-header--dense {
          background-color: rgba(0, 0, 0, 0.86);
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 16px 56px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
      `}</style>
      <div className="relative z-10">
        <Hero name={name} role={role} summary={summary} onContact={goContact} />
        <About summary={summary} philosophy={philosophy} />
        <SkillsSection skills={skills} />
        <ExperienceSection entries={parsedExperience} />
        <HorizontalScroll projects={projectList} />
        <EducationSection blocks={educationBlocks} />
        <AchievementsSection items={achievements} />
        <CertificationsSection items={certifications} />
        <LanguagesSection lines={languages} />
        <Footer email={email} phone={phone} location={location} links={links} />
      </div>
    </div>
  );
}
