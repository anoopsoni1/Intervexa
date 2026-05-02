/** Visual resume PDF exports per UTC calendar day. */
export const RESUME_GENERATE_DAILY_LIMIT_NORMAL = 5;
export const RESUME_GENERATE_DAILY_LIMIT_PREMIUM = 20;

export function getResumeGenerateDailyLimit(user) {
  const isPremium = user?.isPremium === true;
  return isPremium ? RESUME_GENERATE_DAILY_LIMIT_PREMIUM : RESUME_GENERATE_DAILY_LIMIT_NORMAL;
}

export const LIVE_INTERVIEW_DAILY_LIMIT = 5;
export const CODING_INTERVIEW_DAILY_LIMIT = 5;
export const ROADMAP_DAILY_LIMIT = 15;
/** Premium: portfolio deploys to Vercel per UTC day */
export const PORTFOLIO_DEPLOY_DAILY_LIMIT_PREMIUM = 10;

/** AI resume optimizations per UTC calendar day (counted on User: aiOptimizesToday / lastAiOptimizeDate). */
export const AI_OPTIMIZE_LIMIT_NORMAL = 10;
export const AI_OPTIMIZE_LIMIT_PREMIUM = 30;

export function getAiOptimizeLimit(user) {
  const isPremium = user?.isPremium === true;
  return isPremium ? AI_OPTIMIZE_LIMIT_PREMIUM : AI_OPTIMIZE_LIMIT_NORMAL;
}
