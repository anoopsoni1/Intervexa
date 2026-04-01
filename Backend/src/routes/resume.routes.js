import { Router } from "express";
import { verifyJWT, requireEmailVerified } from "../middleware/auth.middleware.js";

import { recordResumeDownload } from "../controller/resume.controller.js";
import { downloadResumeRateLimit } from "../middleware/resumeGenerateRateLimit.middleware.js";
import { checkResumeDownloadLimit } from "../middleware/checkResumeDownloadLimit.middleware.js";

const router = Router();

/**
 * POST /api/resume/record-download
 * Record that the user downloaded/printed resume (increments resumesDownloadedToday).
 * Limits: normal 30/day, premium 100/day (UTC). Use when user triggers Download PDF or Print.
 */
router
  .route("/record-download")
  .post(verifyJWT, requireEmailVerified, downloadResumeRateLimit, checkResumeDownloadLimit, recordResumeDownload);

export default router;
