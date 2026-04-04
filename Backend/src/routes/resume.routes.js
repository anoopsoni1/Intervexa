import { Router } from "express";
import { verifyJWT, requireEmailVerified } from "../middleware/auth.middleware.js";

import { recordResumeDownload } from "../controller/resume.controller.js";
import { downloadResumeRateLimit } from "../middleware/resumeGenerateRateLimit.middleware.js";

const router = Router();

/**
 * POST /api/resume/record-download
 * Returns today's resumesDownloadedToday (counting happens on successful POST /resume-visual-pdf).
 */
router
  .route("/record-download")
  .post(verifyJWT, requireEmailVerified, downloadResumeRateLimit, recordResumeDownload);

export default router;
