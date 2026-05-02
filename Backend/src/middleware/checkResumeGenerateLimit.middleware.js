import { User } from "../models/User.model.js";
import { getResumeGenerateDailyLimit } from "../config/featureLimits.js";
import { getDailyCount, nextUtcMidnightISOString } from "../utils/limitWindow.js";

/**
 * Daily cap on visual resume PDF exports: normal 5/day, premium 20/day (UTC).
 */
export async function checkResumeGenerateLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).select(
      "isPremium resumesGeneratedToday lastResumeDate"
    );
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const countForToday = getDailyCount(user, "resumesGeneratedToday", "lastResumeDate");
    const limit = getResumeGenerateDailyLimit(user);
    const resetsAt = nextUtcMidnightISOString();

    if (countForToday >= limit) {
      return res.status(429).json({
        error: "Daily resume export limit reached.",
        limit,
        used: countForToday,
        resetsAt,
        message: `You’ve used all ${limit} resume PDF exports for today (UTC). Try again after the next UTC midnight.`,
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      error: "Failed to check resume export limit",
      message: err.message,
    });
  }
}
