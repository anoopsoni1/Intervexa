import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLenis } from "../portfolio4/useLenis.js";
import GrainOverlay from "../portfolio4/GrainOverlay.jsx";
import Cursor from "./Cursor.jsx";
import Navbar from "./Navbar.jsx";
import Hero from "./Hero.jsx";
import Work from "./Work.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import SidebarSocial from "./SidebarSocial.jsx";
import { parseProjectForResume } from "../../../utils/projectForm";

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

function splitRole(role) {
  const r = String(role || "").trim();
  if (!r) return { line1: "Full-stack Developer", line2: "UI & UX Designer" };
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

const NAV_IDS = ["home", "work", "about", "contact"];

/**
 * Portfolio 5 — Aziz-inspired dark layout: hero blob, custom cursor, Lenis, GSAP.
 * Uses only resume detail fields (same contract as Portfolio 4).
 */
export default function Portfolio5Layout({ data }) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef(null);
  const rootRef = useRef(null);
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
  const firstName = name.split(/\s+/)[0] || name;
  const monogram = monogramFromName(name);
  const digits = phone ? phone.replace(/\D/g, "") : "";
  const waHref = digits.length >= 10 ? `https://wa.me/${digits}` : "";

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
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      gsap.utils.toArray(root.querySelectorAll(".p5-reveal-block")).forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 40%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      const heroText = root.querySelector(".p5-hero-parallax");
      if (heroText) {
        gsap.to(heroText, {
          y: 48,
          ease: "none",
          scrollTrigger: {
            trigger: "#p5-home",
            start: "top top",
            end: "bottom top",
            scrub: 1.1,
          },
        });
      }
    }, root);

    const t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [summary, projects.length, experiences.length]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let raf = 0;
    const headerPx = () => {
      const el = document.querySelector(".portfolio5-root > header");
      return el ? Math.round(el.getBoundingClientRect().height) : 64;
    };

    const sync = () => {
      const line = window.scrollY + headerPx();
      let active = "home";
      for (let i = NAV_IDS.length - 1; i >= 0; i--) {
        const id = NAV_IDS[i];
        const section = document.getElementById(`p5-${id}`);
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
    const t1 = window.setTimeout(sync, 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const ro = new ResizeObserver(onScroll);
    const hdr = document.querySelector(".portfolio5-root > header");
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
    const el = document.getElementById(`p5-${id}`);
    if (!el) return;
    const offset = -72;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset, duration: 1.15 });
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
      document.getElementById("p5-contact")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  const contactMailto = email ? `mailto:${email}` : "";

  return (
    <div
      ref={rootRef}
      className={`portfolio5-root relative isolate min-h-screen overflow-x-hidden bg-[#060608] font-sans text-white antialiased selection:bg-white/20 ${finePointer ? "cursor-none" : ""}`}
      style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(120,140,255,0.07),transparent_50%)]" />
      <GrainOverlay opacity={0.065} />
      <Cursor disabled={!finePointer} />

      <Navbar
        monogram={monogram}
        activeNav={activeNav}
        onNavClick={onNavClick}
        onContactClick={onContactClick}
        contactMailto={contactMailto}
      />

      <SidebarSocial linkedinHref={linkedinHref} githubHref={githubHref} waHref={waHref} />

      <main className="relative z-10">
        <div className="p5-hero-parallax">
          <Hero
            firstName={firstName}
            roleLine1={roleLine1}
            roleLine2={roleLine2}
            onScrollClick={() => scrollToSection("work")}
          />
        </div>
        <Work projects={projects} />
        <About
          summary={summary}
          skills={rawSkills}
          experiences={experiences}
          educationText={educationText}
        />
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
