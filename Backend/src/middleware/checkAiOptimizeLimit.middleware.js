import { User } from "../models/User.model.js";
import {
  getAiOptimizeLimit,
  AI_OPTIMIZE_LIMIT_PREMIUM,
} from "../config/featureLimits.js";
import { getDailyCount, nextUtcMidnightISOString } from "../utils/limitWindow.js";

/**
 * Blocks POST /aiedit when the user has reached today's AI optimize cap (UTC day).
 * Free: 10/day, Premium: 30/day. Must run after verifyJWT.
 */
export async function checkAiOptimizeLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const limit = getAiOptimizeLimit(req.user);
    const user = await User.findById(userId)
      .select("isPremium aiOptimizesToday lastAiOptimizeDate")
      .lean();
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const used = getDailyCount(user, "aiOptimizesToday", "lastAiOptimizeDate");
    const resetsAt = nextUtcMidnightISOString();

    if (used >= limit) {
      const isPremium = user.isPremium === true;
      return res.status(429).json({
        error: "AI optimize limit reached.",
        limit,
        used,
        resetsAt,
        message: isPremium
          ? `You've used all ${limit} AI resume optimizations for today (UTC). Your limit resets at the next UTC midnight.`
          : `You've used all ${limit} free AI resume optimizations for today (UTC). Upgrade to Premium for ${AI_OPTIMIZE_LIMIT_PREMIUM} per day, or try again after UTC midnight.`,
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      error: "Failed to check AI optimize limit",
      message: err.message,
    });
  }
}
