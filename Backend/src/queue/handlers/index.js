/**
 * Maps job types to controller handlers. Worker runs these with mock req/res
 * and captures the response to store in Redis.
 */
import { generateQuestion, generateQuestions, runCode, codeReview, followUpQuestion } from "../../controller/codingInterview.controller.js";
import { generateRoadmap } from "../../controller/roadmap.controller.js";
import { CheckATSScore } from "../../controller/atschecker.controller.js";
import { aiEditResume } from "../../controller/Uploadresume.controller.js";
import { Payment } from "../../controller/payment.controller.js";
import { createInterview } from "../../controller/videocallInterview.controller.js";
import { transcribeAudio } from "../../controller/transcription.controller.js";
import { evaluateInterview } from "../../controller/Audiocheck.controller.js";
import { getNextAiQuestion } from "../../controller/aiInterview.controller.js";
import { createCodingInterview } from "../../controller/codingInterview.controller.js";
import { createAtsscore } from "../../controller/atsscore.controller.js";
import { createOptimize } from "../../controller/atsscore.controller.js";
const HANDLERS = {
  generateQuestion,
  generateQuestions,
  runCode,
  codeReview,
  followUpQuestion,
  generateRoadmap,
  atscheck: CheckATSScore,
  aiEditResume,
  Payment,  
  createInterview,
  transcribeAudio,
  evaluateInterview,
  getNextAiQuestion,
  createCodingInterview,
  aiEditResume,
  createAtsscore,
  createOptimize,
};

/**
 * Run a controller with mock req/res and return the body that would be sent.
 * @param {string} type - Job type
 * @param {object} payload - req.body + req.user (and req.params if needed)
 */
export async function runJobHandler(type, payload) {
  const handler = HANDLERS[type];
  if (!handler) throw new Error(`Unknown job type: ${type}`);

  return new Promise((resolve, reject) => {
    let resolved = false;
    const req = {
      body: payload.body ?? payload,
      user: payload.user ?? null,
      params: payload.params ?? {},
    };
    const res = {
      status() { return res; },
      json(x) { if (!resolved) { resolved = true; resolve(x); } },
      setHeader() {},
    };
    handler(req, res).then(() => {
      if (!resolved) { resolved = true; resolve(undefined); }
    }).catch(reject);
  });
}

export function getHandlerTypes() {
  return Object.keys(HANDLERS);
}
