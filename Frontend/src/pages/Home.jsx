import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import TextType from "../components/ui/TextType";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
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
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={reduceMotion ? {} : { opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
      >
        <AppFooter />
      </motion.div>
    </motion.div>
  );
}

export default Home;
