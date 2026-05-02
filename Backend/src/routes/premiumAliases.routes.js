import { Router } from "express";
import { requireEmailVerified } from "../middleware/auth.middleware.js";
import { requirePremium } from "../middleware/requirePremium.middleware.js";
import { checkLiveInterviewLimit } from "../middleware/checkInterviewAndRoadmapLimit.middleware.js";
import { checkPortfolioDeployLimit } from "../middleware/checkPortfolioDeployLimit.middleware.js";
import { checkResumeGenerateLimit } from "../middleware/checkResumeGenerateLimit.middleware.js";
import { downloadResumeRateLimit } from "../middleware/resumeGenerateRateLimit.middleware.js";
import { createInterview } from "../controller/videocallInterview.controller.js";
import { deployPortfolio } from "../controller/deployment.controller.js";
import { generateResumePDF } from "../controller/downloadpdf.controller.js";
/**
 * Top-level premium entry points (in addition to /api/v1/user/*).
 * All chains end with the same handlers as the user router.
 */
const aiInterviewRouter = Router();
aiInterviewRouter.post(
  "/",
  requirePremium,
  requireEmailVerified,
  checkLiveInterviewLimit,
  createInterview
);

const portfolioRouter = Router();
portfolioRouter.post(
  "/deploy",
  requirePremium,
  requireEmailVerified,
  checkPortfolioDeployLimit,
  deployPortfolio
);

const resumeBuilderRouter = Router();
resumeBuilderRouter.post(
  "/pro",
  requirePremium,
  requireEmailVerified,
  downloadResumeRateLimit,
  checkResumeGenerateLimit,
  generateResumePDF
);

export { aiInterviewRouter, portfolioRouter, resumeBuilderRouter };
