import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiMic, FiTerminal } from "react-icons/fi";
import { Skeleton } from "../ui/Skeleton.jsx";
import { AnimatedPercentText } from "./AnimatedPercentText.jsx";
import { useDashboardAnalyticScore } from "../../hooks/useDashboardAnalyticScore.js";
import { DashboardAttemptsTrendCard } from "./DashboardAttemptsTrendCard.jsx";


function StatCardSkeleton() {
  return (
    <div className="relative min-h-[188px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-8 w-14 rounded" />
      </div>
      <Skeleton className="mt-4 h-3 w-36 rounded" />
      <Skeleton className="mt-2 h-9 w-16 rounded-lg" />
      <Skeleton className="mt-2 h-3 w-full max-w-48 rounded" />
      <Skeleton className="mt-3 h-2 w-full rounded-full" />
    </div>
  );
}

/**
 * @param {{
 *   variant: "interview" | "coding";
 *   title: string;
 *   subtitle: string;
 *   footerLine: string;
 *   link: string;
 *   icon: React.ReactNode;
 *   loading: boolean;
 *   hasData: boolean;
 *   overallScore: number;
 *   monthlyImprovement: number;
 * }} props
 */
function FuturisticAnalyticCard({
  variant,
  title,
  subtitle,
  footerLine,
  link,
  icon,
  loading,
  hasData,
  overallScore,
  monthlyImprovement,
}) {
  const reduceMotion = useReducedMotion();
  const isInterview = variant === "interview";

  const accentIconBox = isInterview
    ? "border-cyan-500/35 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_-8px_rgba(34,211,238,0.35)] group-hover/card:border-cyan-400/50 group-hover/card:text-cyan-300"
    : "border-amber-500/45 bg-amber-500/10 text-amber-400 shadow-[0_0_22px_-6px_rgba(251,191,36,0.35)] group-hover/card:border-amber-400/60 group-hover/card:text-amber-300";

  const glowFrom = isInterview
    ? "from-cyan-500/30 via-teal-500/10 to-transparent"
    : "from-amber-500/25 via-orange-500/10 to-transparent";

  const barGradient = "from-cyan-400 via-teal-400 to-cyan-300";

  const borderRing = isInterview
    ? "border border-cyan-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-cyan-400/40 hover:shadow-[0_0_28px_-10px_rgba(34,211,238,0.25)]"
    : "border border-amber-500/35 shadow-[0_0_24px_-12px_rgba(251,191,36,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-amber-400/55 hover:shadow-[0_0_32px_-8px_rgba(251,191,36,0.35)]";

  const improvementColor =
    monthlyImprovement > 0
      ? "text-emerald-400"
      : monthlyImprovement < 0
        ? "text-rose-400"
        : "text-slate-400";

  const improvementText = !hasData
    ? null
    : `${monthlyImprovement > 0 ? "+" : ""}${monthlyImprovement}% this month`;

  const pct = hasData ? Math.min(100, Math.max(0, overallScore)) : 0;

  const CardTag = link ? Link : "div";
  const cardProps = link ? { to: link } : {};

  return (
    <CardTag
      {...cardProps}
      className={`group/card relative block min-h-[188px] overflow-hidden rounded-2xl bg-white/5 p-5 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.07] motion-safe:hover:-translate-y-0.5 ${borderRing}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${glowFrom} opacity-50 transition-opacity duration-300 group-hover/card:opacity-80`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-linear-to-br from-white/[0.07] to-transparent blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${accentIconBox}`}
        >
          {icon}
        </div>
        <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Score</span>
          {link ? (
            <span className="text-xs font-medium text-indigo-400 group-hover/card:text-indigo-300">
              View →
            </span>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="relative mt-4 space-y-2">
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-3 w-full max-w-56 rounded" />
        </div>
      ) : (
        <>
          <p className="relative mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="relative mt-1 flex items-baseline gap-1">
            {!isInterview && hasData ? (
              <motion.span
                className="inline-flex rounded-lg px-0.5"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        boxShadow: [
                          "0 0 16px rgba(251,191,36,0.2), 0 0 0 1px rgba(251,191,36,0.25)",
                          "0 0 28px rgba(251,146,60,0.35), 0 0 0 1px rgba(251,191,36,0.45)",
                          "0 0 16px rgba(251,191,36,0.2), 0 0 0 1px rgba(251,191,36,0.25)",
                        ],
                      }
                }
                transition={
                  reduceMotion ? undefined : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    overallScore >= 70
                      ? "text-emerald-400"
                      : overallScore >= 50
                        ? "text-amber-400"
                        : "text-rose-400"
                  }`}
                >
                  <AnimatedPercentText value={overallScore} />
                </span>
              </motion.span>
            ) : (
              <span
                className={`text-2xl font-bold tabular-nums ${
                  hasData
                    ? overallScore >= 70
                      ? "text-emerald-400"
                      : overallScore >= 50
                        ? "text-amber-400"
                        : "text-rose-400"
                    : "text-slate-500"
                }`}
              >
                {hasData ? <AnimatedPercentText value={overallScore} /> : "-"}
              </span>
            )}
          </div>
          <p className="relative mt-1 text-xs text-slate-500">{subtitle}</p>
          {improvementText ? (
            <p className={`relative mt-2 text-xs font-semibold tabular-nums ${improvementColor}`}>
              {improvementText}
            </p>
          ) : null}
          <p className="relative mt-1 text-[11px] text-slate-600">{footerLine}</p>

          {isInterview && (
            <div className="relative mt-3 px-0.5">
              <div className="relative h-1.5 w-full overflow-visible rounded-full bg-white/10 shadow-inner shadow-black/50">
                <motion.div
                  className={`relative h-full rounded-full bg-linear-to-r ${barGradient}`}
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  style={{
                    boxShadow: "0 0 10px rgba(45,212,191,0.55)",
                  }}
                />
                <motion.span
                  className="absolute top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
                  initial={false}
                  animate={{
                    left:
                      pct <= 0
                        ? "5px"
                        : pct >= 100
                          ? "calc(100% - 5px)"
                          : `${pct}%`,
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </CardTag>
  );
}

export function DashboardAnalyticScoreCards() {
  const interview = useDashboardAnalyticScore("interview-score");
  const coding = useDashboardAnalyticScore("coding-score");

  const iData = interview.data;
  const cData = coding.data;
  const iHas = Boolean(iData && iData.completedRounds > 0);
  const cHas = Boolean(cData && cData.completedRounds > 0);

  const interviewFooter = iData?.completedRounds
    ? `${iData.completedRounds} evaluated session${iData.completedRounds === 1 ? "" : "s"} on record`
    : "Finish an AI mock interview to build your score";

  const codingFooter = cData?.completedRounds
    ? `${cData.completedRounds} mock round${cData.completedRounds === 1 ? "" : "s"} completed`
    : "Submit a coding interview to build your score";

  if (interview.loading && coding.loading && !iData && !cData) {
    return (
      <>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </>
    );
  }

  return (
    <>
      <FuturisticAnalyticCard
        variant="interview"
        title="Interview score"
        subtitle="AI interview performance"
        footerLine={interviewFooter}
        link="/dashboard/interviews"
        icon={<FiMic className="h-5 w-5" aria-hidden />}
        loading={interview.loading}
        hasData={iHas}
        overallScore={iData?.overallScore ?? 0}
        monthlyImprovement={iData?.monthlyImprovement ?? 0}
      />
      <FuturisticAnalyticCard
        variant="coding"
        title="Coding interview score"
        subtitle="DSA + coding rounds"
        footerLine={codingFooter}
        link="/coding-interview/start"
        icon={<FiTerminal className="h-5 w-5" aria-hidden />}
        loading={coding.loading}
        hasData={cHas}
        overallScore={cData?.overallScore ?? 0}
        monthlyImprovement={cData?.monthlyImprovement ?? 0}
      />
      <DashboardAttemptsTrendCard />
    </>
  );
}
