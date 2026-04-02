import { Optimize } from "../models/Optimize.model.js";
import {
  getAiOptimizeLimit,
  AI_OPTIMIZE_LIMIT_PREMIUM,
} from "../config/featureLimits.js";

/**
 * Blocks POST /aiedit when the user has reached their lifetime AI optimize cap
 * (free 10, premium 30). Uses Optimize.number; must run after verifyJWT.
 */
export async function checkAiOptimizeLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const limit = getAiOptimizeLimit(req.user);
    const doc = await Optimize.findOne({ userId }).select("number").lean();
    const used = doc?.number ?? 0;

    if (used >= limit) {
      const isPremium = req.user?.plan === "premium" || req.user?.Premium === true;
      return res.status(429).json({
        error: "AI optimize limit reached.",
        limit,
        used,
        message: isPremium
          ? `You've used all ${limit} AI resume optimizations on your plan. Contact support if you need more.`
          : `You've used all ${limit} free AI resume optimizations. Upgrade to Premium for ${AI_OPTIMIZE_LIMIT_PREMIUM} total, or edit your resume manually.`,
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
