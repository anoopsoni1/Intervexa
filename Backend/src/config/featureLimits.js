/** Daily caps (UTC calendar day). Resume downloads: normal 30/day, premium 100/day — use getResumeDownloadDailyLimit(user). */
export const RESUME_DOWNLOAD_DAILY_LIMIT_NORMAL = 30;
export const RESUME_DOWNLOAD_DAILY_LIMIT_PREMIUM = 100;

export function getResumeDownloadDailyLimit(user) {
  const isPremium = user?.plan === "premium" || user?.Premium === true;
  return isPremium ? RESUME_DOWNLOAD_DAILY_LIMIT_PREMIUM : RESUME_DOWNLOAD_DAILY_LIMIT_NORMAL;
}
export const LIVE_INTERVIEW_DAILY_LIMIT = 5;
export const CODING_INTERVIEW_DAILY_LIMIT = 5;
export const ROADMAP_DAILY_LIMIT = 15;
/** Premium: portfolio deploys to Vercel per UTC day */
export const PORTFOLIO_DEPLOY_DAILY_LIMIT_PREMIUM = 10;
