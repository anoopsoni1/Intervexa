import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { VideocallInterview } from "../models/VideocallInterview.model.js";
import { InterviewSession } from "../models/InterviewSession.model.js";

function clamp01(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

function startOfUtcMonth(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

function startOfNextUtcMonth(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}

function startOfPreviousUtcMonth(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1, 0, 0, 0, 0));
}

/** One mock interview session → 0–100 composite (communication, confidence, consistency, AI feedback, behavioral). */
function interviewSessionScorePercent(report) {
  if (!report || typeof report !== "object") return null;
  const c = clamp01((Number(report.communicationScore) || 0) / 10) * 10;
  const f = clamp01((Number(report.confidenceScore) || 0) / 10) * 10;
  const t = clamp01((Number(report.technicalScore) || 0) / 10) * 10;
  const mean = (c + f + t) / 3;
  const variance =
    ((c - mean) ** 2 + (f - mean) ** 2 + (t - mean) ** 2) / 3 + 1e-9;
  const consistency = Math.max(0, Math.min(10, 10 - Math.sqrt(variance) * 2.2));
  const strengths = Array.isArray(report.strengths) ? report.strengths.length : 0;
  const weaknesses = Array.isArray(report.weaknesses) ? report.weaknesses.length : 0;
  const plan = Array.isArray(report.improvementPlan) ? report.improvementPlan.length : 0;
  const aiFeedback = Math.min(10, (strengths + weaknesses + plan) * 0.55);
  const behavioral = t;
  const raw = (c + f + consistency + aiFeedback + behavioral) / 5;
  return Math.round(Math.min(100, Math.max(0, raw * 10)));
}

function average(nums) {
  const list = nums.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (!list.length) return null;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

/** One coding session → 0–100 (DSA / tests / score / AI review / follow-ups). */
function codingSessionScorePercent(doc) {
  const maxScore = Number(doc.maxScore) > 0 ? Number(doc.maxScore) : 10;
  const scoreRatio = clamp01(Number(doc.score) / maxScore);
  const totalTests = Number(doc.totalTests) || 0;
  const passed = Number(doc.passed) || 0;
  const testRatio = totalTests > 0 ? clamp01(passed / totalTests) : scoreRatio;
  const dsaTests = testRatio * 10;
  const scoreCap = scoreRatio * 10;
  const speedProxy = Array.isArray(doc.attempts) && doc.attempts.length > 0
    ? Math.min(10, 4 + (doc.attempts.filter((a) => (Number(a.score) || 0) > 0).length / doc.attempts.length) * 6)
    : Math.min(10, 5 + scoreRatio * 5);
  const suggestions = Array.isArray(doc.aiReview?.suggestions) ? doc.aiReview.suggestions.length : 0;
  const quality = String(doc.aiReview?.quality || "").toLowerCase();
  let qualityPts = 5;
  if (quality.includes("excellent") || quality.includes("strong")) qualityPts = 9;
  else if (quality.includes("good") || quality.includes("solid")) qualityPts = 7.5;
  else if (quality.includes("fair") || quality.includes("moderate")) qualityPts = 6;
  else if (quality.includes("weak") || quality.includes("poor")) qualityPts = 4;
  const codeQuality = Math.min(10, qualityPts + Math.min(2, suggestions * 0.35));
  const followUps = Array.isArray(doc.followUpQa) ? doc.followUpQa.length : 0;
  const interviewPerf = Math.min(10, 4 + followUps * 1.2 + scoreRatio * 4);
  const raw = (dsaTests + speedProxy + scoreCap + codeQuality + interviewPerf) / 5;
  return Math.round(Math.min(100, Math.max(0, raw * 10)));
}

function monthlyDeltaUtc(docs, scoreFn, dateField = "updatedAt") {
  const now = new Date();
  const curStart = startOfUtcMonth(now);
  const curEnd = startOfNextUtcMonth(now);
  const prevStart = startOfPreviousUtcMonth(now);
  const prevEnd = curStart;

  const thisMonth = [];
  const lastMonth = [];
  for (const doc of docs) {
    const dt = doc[dateField] ? new Date(doc[dateField]) : null;
    if (!dt || Number.isNaN(dt.getTime())) continue;
    const p = scoreFn(doc);
    if (p == null || Number.isNaN(p)) continue;
    if (dt >= curStart && dt < curEnd) thisMonth.push(p);
    if (dt >= prevStart && dt < prevEnd) lastMonth.push(p);
  }
  const a = average(thisMonth);
  const b = average(lastMonth);
  if (a == null && b == null) return 0;
  if (!lastMonth.length || b == null) return 0;
  if (a == null) return Math.round(0 - b);
  return Math.round(a - b);
}

const buildPayload = (overallScore, monthlyImprovement, completedRounds, updatedAt) => ({
  overallScore: Math.min(100, Math.max(0, Math.round(Number(overallScore) || 0))),
  monthlyImprovement: Number.isFinite(monthlyImprovement) ? Math.round(monthlyImprovement) : 0,
  completedRounds: Math.max(0, Math.floor(Number(completedRounds) || 0)),
  updatedAt: (updatedAt && new Date(updatedAt).toISOString()) || new Date().toISOString(),
});

export const getInterviewDashboardScore = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  const list = await VideocallInterview.find({
    $or: [{ candidateId: userId }, { recruiterId: userId }],
    "aiReport.communicationScore": { $exists: true, $ne: null },
  })
    .select("aiReport updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  const percents = [];
  let latest = null;
  for (const row of list) {
    const p = interviewSessionScorePercent(row.aiReport);
    if (p == null) continue;
    percents.push({ p, t: row.updatedAt });
    if (!latest || (row.updatedAt && new Date(row.updatedAt) > new Date(latest))) latest = row.updatedAt;
  }

  const overall = average(percents.map((x) => x.p));
  const improvement = monthlyDeltaUtc(list, (row) => interviewSessionScorePercent(row.aiReport), "updatedAt");

  const payload = buildPayload(
    overall ?? 0,
    improvement,
    percents.length,
    latest
  );

  return res.status(200).json(new ApiResponse(200, payload, "Interview score"));
});

export const getCodingDashboardScore = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  const list = await InterviewSession.find({
    userId,
    status: "submitted",
  })
    .select("score maxScore passed totalTests aiReview followUpQa attempts updatedAt createdAt")
    .sort({ updatedAt: -1 })
    .lean();

  const percents = [];
  let latest = null;
  for (const row of list) {
    const p = codingSessionScorePercent(row);
    percents.push({ p, t: row.updatedAt || row.createdAt });
    const ts = row.updatedAt || row.createdAt;
    if (ts && (!latest || new Date(ts) > new Date(latest))) latest = ts;
  }

  const overall = average(percents.map((x) => x.p));
  const improvement = monthlyDeltaUtc(list, (row) => codingSessionScorePercent(row), "updatedAt");

  const payload = buildPayload(
    overall ?? 0,
    improvement,
    list.length,
    latest
  );

  return res.status(200).json(new ApiResponse(200, payload, "Coding score"));
});

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function utcWeekStartSunday(d) {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = dt.getUTCDay();
  dt.setUTCDate(dt.getUTCDate() - day);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}

function buildUtcWeekStarts(nWeeks) {
  const anchor = utcWeekStartSunday(new Date());
  const starts = [];
  for (let i = nWeeks - 1; i >= 0; i -= 1) {
    starts.push(new Date(anchor.getTime() - i * WEEK_MS));
  }
  return starts;
}

function weekBucketIndex(at, weekStarts) {
  const t = at.getTime();
  for (let i = 0; i < weekStarts.length; i += 1) {
    const a = weekStarts[i].getTime();
    const b = a + WEEK_MS;
    if (t >= a && t < b) return i;
  }
  return -1;
}

/** GET /api/dashboard/attempts-timeline — weekly counts of mock interviews vs coding submissions (UTC weeks, Sunday start). */
export const getAttemptsTimeline = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  const weekCount = Math.min(16, Math.max(4, Number.parseInt(String(req.query.weeks || "12"), 10) || 12));
  const weekStarts = buildUtcWeekStarts(weekCount);
  const points = weekStarts.map((start) => ({
    label: `${start.getUTCMonth() + 1}/${start.getUTCDate()}`,
    interview: 0,
    coding: 0,
  }));

  const interviews = await VideocallInterview.find({
    $or: [{ candidateId: userId }, { recruiterId: userId }],
  })
    .select("updatedAt createdAt status aiReport")
    .lean();

  for (const row of interviews) {
    const st = String(row.status || "").toLowerCase();
    const hasEval =
      row.aiReport &&
      typeof row.aiReport.communicationScore === "number" &&
      !Number.isNaN(row.aiReport.communicationScore);
    if (!hasEval && st !== "completed" && st !== "ended") continue;
    const dt = new Date(row.updatedAt || row.createdAt);
    if (Number.isNaN(dt.getTime())) continue;
    const idx = weekBucketIndex(dt, weekStarts);
    if (idx >= 0) points[idx].interview += 1;
  }

  const codingSessions = await InterviewSession.find({ userId, status: "submitted" })
    .select("updatedAt createdAt")
    .sort({ createdAt: -1 })
    .limit(400)
    .lean();

  for (const row of codingSessions) {
    const dt = new Date(row.updatedAt || row.createdAt);
    if (Number.isNaN(dt.getTime())) continue;
    const idx = weekBucketIndex(dt, weekStarts);
    if (idx >= 0) points[idx].coding += 1;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { points, weekCount }, "Attempts timeline"));
});
