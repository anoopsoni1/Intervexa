import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FiTrendingUp } from "react-icons/fi";
import { Skeleton } from "../ui/Skeleton.jsx";
import { useDashboardAttemptsTimeline } from "../../hooks/useDashboardAttemptsTimeline.js";
import {useUserData} from "../../hooks/useUserData.js"

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/15 bg-black/95 px-2.5 py-2 text-[11px] shadow-xl backdrop-blur-sm">
      <p className="mb-1 font-medium text-zinc-400">Week of {label} (UTC)</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="tabular-nums" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  const heights = ["h-10", "h-14", "h-12", "h-16", "h-9", "h-14", "h-11", "h-14", "h-10", "h-12", "h-12", "h-14"];
  return (
    <div className="relative mt-2 flex h-[168px] w-full items-end justify-between gap-1 px-1 pt-6">
      {heights.map((h, i) => (
        <Skeleton key={i} className={`w-full max-w-[10%] flex-1 rounded-t-sm ${h}`} />
      ))}
    </div>
  );
}

export function DashboardAttemptsTrendCard() {
  const { user } = useUserData();
  const chartUid = useMemo(() => `d${Math.random().toString(36).slice(2, 11)}`, []);
  const reduceMotion = useReducedMotion();
  const { data, loading, error } = useDashboardAttemptsTimeline();

  const chartData = useMemo(() => data?.points ?? [], [data?.points]);

  const hasAny = useMemo(
    () => chartData.some((d) => (d.interview || 0) > 0 || (d.coding || 0) > 0),
    [chartData]
  );

  const fillInterview = `dashIv_${chartUid}`;
  const fillCoding = `dashCd_${chartUid}`;
  const glowIv = `glowIv_${chartUid}`;
  const glowCd = `glowCd_${chartUid}`;

  return (
    <Link
      to={user?.Premium ? "/dashboard/interviews" : "/price"}
      title="Open mock interviews — chart includes coding sessions too"
      className="group/card relative flex min-h-[248px] flex-col overflow-hidden rounded-2xl border border-emerald-500/25 bg-black/40 p-5 shadow-[0_0_20px_-8px_rgba(16,185,129,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-200 hover:border-emerald-400/45 hover:bg-black/50 hover:shadow-[0_0_28px_-6px_rgba(52,211,153,0.28)] motion-safe:hover:-translate-y-0.5"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-500/25 via-teal-500/10 to-transparent opacity-70 transition-opacity group-hover/card:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-linear-to-br from-emerald-400/15 to-transparent blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_16px_-4px_rgba(52,211,153,0.45)] transition-colors group-hover/card:border-emerald-400/55 group-hover/card:text-emerald-200">
          <FiTrendingUp className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Activity</span>
          <span className="text-xs font-medium text-indigo-400 group-hover/card:text-indigo-300">View →</span>
        </div>
      </div>

      <p className="relative mt-4 text-xs font-semibold uppercase tracking-wider text-white">
        Interview activity
      </p>
      <p className="relative mt-0.5 text-[11px] text-zinc-400">
        Mock interviews vs coding submissions by UTC week
      </p>

      {loading ? (
        <ChartSkeleton />
      ) : error ? (
        <p className="relative mt-6 text-xs text-rose-400/90">{error}</p>
      ) : (
        <motion.div
          className="relative mt-2 h-[172px] w-full min-w-0 flex-1"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {!hasAny ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 px-3 py-6 text-center text-[11px] text-zinc-500">
              Complete a mock interview or coding round to see your activity here.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 2, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={fillInterview} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={fillCoding} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.36} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                  <filter id={glowIv} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id={glowCd} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid stroke="rgba(161,161,170,0.08)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#71717a", fontSize: 9 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(161,161,170,0.15)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  width={18}
                  tick={{ fill: "#71717a", fontSize: 9 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(161,161,170,0.15)" }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(161,161,170,0.2)" }} />
                <Legend
                  wrapperStyle={{ fontSize: "10px", paddingTop: "2px" }}
                  formatter={(value) => <span className="text-zinc-500">{value}</span>}
                />
                <Area
                  type="monotone"
                  name="Interviews"
                  dataKey="interview"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill={`url(#${fillInterview})`}
                  dot={false}
                  isAnimationActive={!reduceMotion}
                  animationDuration={900}
                  animationEasing="ease-out"
                  style={{ filter: `url(#${glowIv})` }}
                  activeDot={{ r: 3.5, strokeWidth: 0, fill: "#67e8f9" }}
                />
                <Area
                  type="monotone"
                  name="Coding"
                  dataKey="coding"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fill={`url(#${fillCoding})`}
                  dot={false}
                  isAnimationActive={!reduceMotion}
                  animationDuration={900}
                  animationBegin={reduceMotion ? 0 : 120}
                  animationEasing="ease-out"
                  style={{ filter: `url(#${glowCd})` }}
                  activeDot={{ r: 3.5, strokeWidth: 0, fill: "#fcd34d" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      )}
    </Link>
  );
}
