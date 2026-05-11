import { Router } from "express";
import { verifyJWT, requireEmailVerified } from "../middleware/auth.middleware.js";
import {
  getAttemptsTimeline,
  getCodingDashboardScore,
  getInterviewDashboardScore,
} from "../controller/dashboard.controller.js";

const router = Router();

router
  .route("/interview-score")
  .get(verifyJWT, requireEmailVerified, getInterviewDashboardScore);
router.route("/coding-score").get(verifyJWT, requireEmailVerified, getCodingDashboardScore);
router
  .route("/attempts-timeline")
  .get(verifyJWT, requireEmailVerified, getAttemptsTimeline);

export default router;
