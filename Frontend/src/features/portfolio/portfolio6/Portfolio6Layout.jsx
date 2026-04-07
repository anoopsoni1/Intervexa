import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLenis } from "./hooks/useLenis.js";
import { useScrollRefresh } from "./hooks/useScrollAnimation.js";
import GrainOverlay from "../portfolio4/GrainOverlay.jsx";

import AmbientBackground from "./components/AmbientBackground.jsx";
import Cursor from "./components/Cursor.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import Services from "./components/Services.jsx";
import Projects from "./components/Projects.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import { parseProjectForResume } from "../../../utils/projectForm";

gsap.registerPlugin(ScrollTrigger);

const stripBullet = (line) =>
  String(line || "")
    .replace(/^\s*[•\-*·▪▸]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

function extractVideoUrl(text) {
  const m = String(text || "").match(/https?:\/\/[^\s<>"']+\.(mp4|webm|ogg)/i);
  return m ? m[0] : null;
}

function normalizeProject(p, index) {
  if (typeof p === "string" && p.includes("|")) {
    const raw = String(p || "").trim();
    const videoUrl = extractVideoUrl(raw);
    const [titlePart, ...rest] = raw.split("|").map((x) => x.trim());
    let description = rest.join(" | ").trim();
    if (videoUrl) {
      description = description
        .replace(videoUrl, "")
        .replace(/^\s*\|\s*|\s*\|\s*$/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }
    return {
      title: titlePart || `Project ${index + 1}`,
      description,
      videoUrl,
      link: "",
    };
  }

  const n = parseProjectForResume(p);
  const videoSource = [n.description, n.link].filter(Boolean).join("\n");
  const videoUrl = extractVideoUrl(videoSource);
  let description = n.description;
  if (videoUrl) {
    description = description.replace(videoUrl, "").replace(/\s+/g, " ").trim();
  }
  if (!n.title && !description && !n.link) {
    return { title: `Project ${index + 1}`, description: "", videoUrl: null, link: "" };
  }
  return {
    title: n.title || `Project ${index + 1}`,
    description,
    videoUrl,
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

function splitRole(role) {
  const r = String(role || "").trim();
  if (!r) return { line1: "Your role", line2: "" };
  const seps = /\s*\/\s*|\s*\|\s*|\s+&\s+|\s+and\s+/i;
  const parts = r.split(seps).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { line1: parts[0], line2: parts.slice(1).join(" · ") };
  }
  const words = r.split(/\s+/);
  if (words.length >= 6) {
    const mid = Math.ceil(words.length / 2);
    return {
      line1: words.slice(0, mid).join(" "),
      line2: words.slice(mid).join(" "),
    };
  }
  return { line1: r, line2: "" };
}

function monogramFromName(name) {
  const p = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (p.length === 0) return "Y";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/** Hero eyebrow: full name from profile, uppercase (klmnko-style label). */
function heroLabelFromFullName(name) {
  const n = String(name || "").trim();
  if (!n) return "YOUR NAME";
  return n.toUpperCase();
}

const NAV_IDS = ["home", "work", "services", "about", "contact"];

/**
 * Portfolio 6 — klmnko-inspired: Lenis, GSAP, fullscreen menu, horizontal work, marquee, scramble, grain.
 * Data contract matches Portfolio 4/5 (resume detail fields only).
 */
export default function Portfolio6Layout({ data }) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef(null);
  const rootRef = useRef(null);
  const [finePointer, setFinePointer] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const name = data?.name ? String(data.name).trim() : "Your Name";
  const role = data?.role ? String(data.role).trim() : "Your Role";
  const summary =
    data?.summary?.trim() ||
    "Add a short summary in Add details or upload your resume to see your story here.";
  const rawSkills = Array.isArray(data?.skills) ? data.skills.filter(Boolean).map(String) : [];
  const rawProjects = Array.isArray(data?.projects) ? data.projects.filter(Boolean) : [];
  const rawExperience = Array.isArray(data?.experience) ? data.experience.filter(Boolean) : [];
  const educationText = data?.education ? String(data.education).trim() : "";
  const email = data?.email ? String(data.email).trim() : "";
  const phone = data?.phone ? String(data.phone).trim() : "";
  const linkedinRaw = data?.linkedin ? String(data.linkedin).trim() : "";
  const githubRaw = data?.github ? String(data.github).trim() : "";

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
  const projects = useMemo(() => rawProjects.map(normalizeProject), [rawProjects]);
  const experiences = useMemo(() => rawExperience.map(parseExperienceBlock), [rawExperience]);
  const { line1: roleLine1, line2: roleLine2 } = splitRole(role);
  const monogram = monogramFromName(name);
  const heroLabelName = heroLabelFromFullName(name);
  const marqueeItems = useMemo(() => {
    if (rawSkills.length) return rawSkills.slice(0, 12);
    const w = role.split(/\s+/).filter(Boolean);
    return w.length ? w : ["Create", "Ship", "Refine"];
  }, [rawSkills, role]);

  useLenis(!reducedMotion, lenisRef);
  useScrollRefresh([summary, projects.length, experiences.length, rawSkills.length]);

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
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      gsap.utils.toArray(root.querySelectorAll(".p6-reveal-block")).forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 42%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, root);

    const t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [summary, projects.length, experiences.length]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let raf = 0;
    const headerPx = () => {
      const el = document.querySelector(".p6-site-header");
      return el ? Math.round(el.getBoundingClientRect().height) : 64;
    };

    const sync = () => {
      const line = window.scrollY + headerPx();
      let active = "home";
      for (let i = NAV_IDS.length - 1; i >= 0; i--) {
        const id = NAV_IDS[i];
        const section = document.getElementById(`p6-${id}`);
        if (!section) continue;
        const top = section.getBoundingClientRect().top + window.scrollY;
        if (line + 2 >= top) {
          active = id;
          break;
        }
      }
      setActiveNav(active);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };

    sync();
    const t0 = window.setTimeout(sync, 0);
    const t1 = window.setTimeout(sync, 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const ro = new ResizeObserver(onScroll);
    const hdr = document.querySelector(".p6-site-header");
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
    const el = document.getElementById(`p6-${id}`);
    if (!el) return;
    const offset = -80;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  };

  const onNavClick = (e, sectionId) => {
    if (lenisRef.current) {
      e.preventDefault();
      scrollToSection(sectionId);
    }
  };

  const onContactClick = (e) => {
    if (lenisRef.current) {
      e.preventDefault();
      scrollToSection("contact");
      return;
    }
    if (!email) {
      e.preventDefault();
      document.getElementById("p6-contact")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  const contactMailto = email ? `mailto:${email}` : "";

  return (
    <div
      ref={rootRef}
      className={`portfolio6-root relative isolate min-h-screen overflow-x-hidden bg-[#020203] font-sans text-white antialiased selection:bg-[#A65C34]/30 ${finePointer ? "cursor-none" : ""}`}
      style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <AmbientBackground />
      <GrainOverlay opacity={reducedMotion ? 0.06 : 0.1} />
      <ScrollProgress />
      <Cursor disabled={!finePointer} />

      <Navbar
        monogram={monogram}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        activeNav={activeNav}
        onNavClick={onNavClick}
        onContactClick={onContactClick}
        contactMailto={contactMailto}
      />

      <main className="relative z-10">
        <Hero
          labelName={heroLabelName}
          roleLine1={roleLine1}
          roleLine2={roleLine2}
          summary={summary}
          onCtaClick={() => scrollToSection("contact")}
        />
        <Marquee items={marqueeItems} />
        <Services skills={rawSkills} />
        <Projects projects={projects} />
        <About summary={summary} experiences={experiences} educationText={educationText} />
        <Contact
          name={name}
          email={email}
          phone={phone}
          linkedinHref={linkedinHref}
          githubHref={githubHref}
        />
      </main>
    </div>
  );
}
