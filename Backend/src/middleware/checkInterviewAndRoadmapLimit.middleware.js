import { User } from "../models/User.model.js";
import {
  LIVE_INTERVIEW_DAILY_LIMIT,
  CODING_INTERVIEW_DAILY_LIMIT,
  ROADMAP_DAILY_LIMIT,
} from "../config/featureLimits.js";
import { getDailyCount, nextUtcMidnightISOString } from "../utils/limitWindow.js";

function ensurePremium(user, res, featureName) {
  const isPremium = user?.plan === "premium" || user?.Premium === true;
  if (!isPremium) {
    res.status(403).json({
      error: "Premium required",
      message: `${featureName} is a premium feature. Upgrade to access it.`,
    });
    return false;
  }
  return true;
}

/**
 * Premium only. Daily cap per UTC day. resetsAt = next UTC midnight.
 */
export async function checkLiveInterviewLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId).select(
      "plan Premium liveInterviewsToday lastLiveInterviewDate"
    );
    if (!user) return res.status(401).json({ error: "User not found" });

    if (!ensurePremium(user, res, "Live interview")) return;

    const limit = LIVE_INTERVIEW_DAILY_LIMIT;
    const count = getDailyCount(user, "liveInterviewsToday", "lastLiveInterviewDate");
    const resetsAt = nextUtcMidnightISOString();

    if (count >= limit) {
      return res.status(429).json({
        error: "Daily live interview limit reached.",
        limit,
        used: count,
        resetsAt,
        message: `You’ve reached ${limit} live interviews for today (UTC). Try again after the next UTC midnight.`,
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Failed to check limit", message: err.message });
  }
}

export async function checkCodingInterviewLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId).select(
      "plan Premium codingInterviewsToday lastCodingInterviewDate"
    );
    if (!user) return res.status(401).json({ error: "User not found" });

    if (!ensurePremium(user, res, "Coding interview")) return;

    const limit = CODING_INTERVIEW_DAILY_LIMIT;
    const count = getDailyCount(user, "codingInterviewsToday", "lastCodingInterviewDate");
    const resetsAt = nextUtcMidnightISOString();

    if (count >= limit) {
      return res.status(429).json({
        error: "Daily coding interview limit reached.",
        limit,
        used: count,
        resetsAt,
        message: `You’ve reached ${limit} coding interviews for today (UTC). Try again after the next UTC midnight.`,
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Failed to check limit", message: err.message });
  }
}

export async function checkRoadmapLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId).select(
      "plan Premium roadmapSuggestionsToday lastRoadmapSuggestionDate"
    );
    if (!user) return res.status(401).json({ error: "User not found" });

    if (!ensurePremium(user, res, "Career roadmap")) return;

    const limit = ROADMAP_DAILY_LIMIT;
    const count = getDailyCount(user, "roadmapSuggestionsToday", "lastRoadmapSuggestionDate");
    const resetsAt = nextUtcMidnightISOString();

    if (count >= limit) {
      return res.status(429).json({
        error: "Daily roadmap suggestion limit reached.",
        limit,
        used: count,
        resetsAt,
        message: `You’ve reached ${limit} roadmap generations for today (UTC). Try again after the next UTC midnight.`,
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Failed to check limit", message: err.message });
  }
}
