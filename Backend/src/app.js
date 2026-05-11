import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import passport from "./config/passport.google.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://intervexa.co-vid.in",
  "https://www.intervexa.co-vid.in",
  "https://resume-ai-frontend-mj2p.vercel.app",
];
const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsAllowedOrigins = [...new Set([...DEFAULT_CORS_ORIGINS, ...extraOrigins])];

const app = express();

// Required for rate limiting by real client IP when behind proxy (Nginx, Vercel, etc.)
app.set("trust proxy", 1);

// Health check for keep-alive pingers (e.g. Render)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global API rate limit: 60 requests per minute per IP
const globalApiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many requests. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || req.socket?.remoteAddress || "unknown"),
});
app.use("/api/v1", globalApiRateLimit);
app.use("/api/resume", globalApiRateLimit);

app.use(
  cors({
    origin: corsAllowedOrigins,
    credentials: true,
  })
);
app.use(passport.initialize());

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use("/public", express.static("public"));
app.use(cookieParser());

import { Router } from "express";
import { router } from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import { getJobStatus } from "./controller/queue.controller.js";
import {
  aiInterviewRouter,
  portfolioRouter,
  resumeBuilderRouter,
} from "./routes/premiumAliases.routes.js";
// import { roadmapRouter } from "./routes/roadmap.routes.js";

app.use("/api/ai-interview", globalApiRateLimit, aiInterviewRouter);
app.use("/api/portfolio", globalApiRateLimit, portfolioRouter);
app.use("/api/resume-builder", globalApiRateLimit, resumeBuilderRouter);

app.use("/api/v1/user", router);
app.use("/api/dashboard", globalApiRateLimit, dashboardRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/resume", resumeRouter);
const jobRouter = Router();
jobRouter.get("/:jobId", getJobStatus);
app.use("/api/v1/job", jobRouter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "running",
    time: new Date()
  });
});

export {app}