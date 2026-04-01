import { User } from "../models/User.model.js";
import { getResumeDownloadDailyLimit } from "../config/featureLimits.js";
import { getDailyCount, nextUtcMidnightISOString } from "../utils/limitWindow.js";

/**
 * Daily resume download cap: normal 30/day, premium 100/day (UTC day).
 * Response includes resetsAt (next UTC midnight) for UI countdown.
 */
export async function checkResumeDownloadLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).select(
      "plan Premium resumesDownloadedToday lastResumeDownloadDate"
    );
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const countForToday = getDailyCount(user, "resumesDownloadedToday", "lastResumeDownloadDate");
    const limit = getResumeDownloadDailyLimit(user);
    const resetsAt = nextUtcMidnightISOString();

    if (countForToday >= limit) {
      return res.status(429).json({
        error: "Daily resume download limit reached.",
        limit,
        used: countForToday,
        resetsAt,
        message: `You’ve used all ${limit} resume downloads for today (UTC). Try again after the next UTC midnight, or check the timer on the resume page.`,
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      error: "Failed to check download limit",
      message: err.message,
    });
  }
}
