import { DASHBOARD_API_BASE } from "../config";

/** @typedef {import("../types/dashboardScores").DashboardAnalyticScorePayload} DashboardAnalyticScorePayload */

/**
 * @param {unknown} data
 * @returns {DashboardAnalyticScorePayload | null}
 */
function normalizePayload(data) {
  if (!data || typeof data !== "object") return null;
  const overallScore = Number(/** @type {{ overallScore?: unknown }} */ (data).overallScore);
  const monthlyImprovement = Number(/** @type {{ monthlyImprovement?: unknown }} */ (data).monthlyImprovement);
  const completedRounds = Number(/** @type {{ completedRounds?: unknown }} */ (data).completedRounds);
  const updatedAt = String(/** @type {{ updatedAt?: unknown }} */ (data).updatedAt || "");
  if (Number.isNaN(overallScore) || Number.isNaN(monthlyImprovement) || Number.isNaN(completedRounds)) return null;
  return {
    overallScore: Math.min(100, Math.max(0, Math.round(overallScore))),
    monthlyImprovement: Math.round(monthlyImprovement),
    completedRounds: Math.max(0, Math.floor(completedRounds)),
    updatedAt: updatedAt || new Date().toISOString(),
  };
}

/**
 * @param {string} path "interview-score" | "coding-score"
 * @param {AbortSignal} [signal]
 * @returns {Promise<DashboardAnalyticScorePayload | null>}
 */
export async function fetchDashboardAnalyticScore(path, signal) {
  const base = DASHBOARD_API_BASE.replace(/\/+$/, "");
  const res = await fetch(`${base}/${path}`, {
    credentials: "include",
    signal,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  return normalizePayload(json?.data);
}

/**
 * @returns {Promise<{ points: { label: string; interview: number; coding: number }[]; weekCount: number } | null>}
 */
export async function fetchDashboardAttemptsTimeline(signal) {
  const base = DASHBOARD_API_BASE.replace(/\/+$/, "");
  const res = await fetch(`${base}/attempts-timeline?weeks=12`, {
    credentials: "include",
    signal,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  const data = json?.data;
  if (!data || !Array.isArray(data.points)) return null;
  return {
    points: data.points.map((p) => ({
      label: String(p.label ?? ""),
      interview: Math.max(0, Math.floor(Number(p.interview) || 0)),
      coding: Math.max(0, Math.floor(Number(p.coding) || 0)),
    })),
    weekCount: Math.max(0, Math.floor(Number(data.weekCount) || 12)),
  };
}
