import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Mic, FileText, LineChart } from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import SEO from "../components/SEO";

const ITEMS = [
  {
    icon: FileText,
    title: "ATS-ready resumes",
    desc: "Templates and AI suggestions aimed at passing applicant tracking systems.",
  },
  {
    icon: LineChart,
    title: "Scoring & feedback",
    desc: "See how your resume performs and what to improve before you apply.",
  },
  {
    icon: Mic,
    title: "Interview practice",
    desc: "Mock and coding-style practice with structured feedback.",
  },
  {
    icon: Layers,
    title: "Portfolio designs",
    desc: "Pair a polished web presence with your resume.",
  },
];

export default function Features() {
  return (
    <>
      <SEO
        title="Features | Ansoyal AI"
        description="Explore Ansoyal AI features: ATS-friendly resumes, scoring, AI mock interviews, and portfolio tools."
        image="/one.png"
        url="https://intervexa.co-vid.in/features"
        keywords="Ansoyal AI features, ATS resume, mock interview, portfolio builder"
      />
      <div className="relative min-h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.15),transparent_40%)]" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1 px-4 py-14 sm:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <motion.h1
                className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
                initial={import.meta.env.SSR ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                Everything you need for a stronger application
              </motion.h1>
              <motion.p
                className="mx-auto mt-4 max-w-2xl text-slate-400"
                initial={import.meta.env.SSR ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
              >
                Build, tune, and practice in one place—without changing how you already use Ansoyal AI.
              </motion.p>
              <div className="mt-12 grid gap-5 text-left sm:grid-cols-2">
                {ITEMS.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={import.meta.env.SSR ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                  >
                    <item.icon className="mb-3 h-8 w-8 text-indigo-300" />
                    <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="mt-12"
                initial={import.meta.env.SSR ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/30"
                >
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </>
  );
}
