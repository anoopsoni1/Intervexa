import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/** Strict key by IP (IPv6-safe via ipKeyGenerator). Use when behind trust proxy. */
function ipKey(req) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return ipKeyGenerator(ip);
}

function userOrIpKey(req) {
  return req.user?._id?.toString() || ipKey(req);
}

/**
 * Rate limiter for resume download recording: max 10 requests per minute per user (anti-abuse).
 * Per-minute cap on record-resume-download requests only (anti-abuse). No daily download quota.
 * Use after verifyJWT so req.user is set.
 */
export const downloadResumeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many download resume requests. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
});

/** Login and register: strict per-IP to prevent brute force. */
export const loginAndRegisterRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many login and register requests. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
});

/** Single coding question (Gemini): strict per-IP. */
export const codingQuestionRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many question requests. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
});

/** Bulk coding questions (Gemini): expensive, very strict per-IP. */
export const codingQuestionsBulkRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: "Too many bulk question requests. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
});

/** Run code (Judge0): strict per-IP. */
export const runCodeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many code run requests. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
});

/** Code review (Gemini): strict per-IP. */
export const codeReviewRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many code review requests. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
});

/** Follow-up question (Gemini): strict per-IP. */
export const followUpQuestionRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many follow-up requests. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
});