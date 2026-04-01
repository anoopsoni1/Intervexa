import { User } from "../models/User.model.js";
import { PORTFOLIO_DEPLOY_DAILY_LIMIT_PREMIUM } from "../config/featureLimits.js";
import { getDailyCount, nextUtcMidnightISOString } from "../utils/limitWindow.js";

/**
 * Premium only. Max portfolio deploys per UTC day.
 */
export async function checkPortfolioDeployLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId).select(
      "plan Premium portfolioDeploysToday lastPortfolioDeployDate"
    );
    if (!user) return res.status(401).json({ error: "User not found" });

    const isPremium = user.plan === "premium" || user.Premium === true;
    if (!isPremium) {
      return res.status(403).json({
        error: "Premium required",
        message: "Portfolio deploy is a premium feature. Upgrade to publish your portfolio.",
      });
    }

    const limit = PORTFOLIO_DEPLOY_DAILY_LIMIT_PREMIUM;
    const used = getDailyCount(user, "portfolioDeploysToday", "lastPortfolioDeployDate");
    const resetsAt = nextUtcMidnightISOString();

    if (used >= limit) {
      return res.status(429).json({
        error: "Daily portfolio deploy limit reached.",
        limit,
        used,
        resetsAt,
        message: `Premium users can deploy up to ${limit} portfolios per day (UTC). Try again after the next UTC midnight.`,
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Failed to check deploy limit", message: err.message });
  }
}
