import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { getAiResponse } from "../utils/aiClient.js";

export const evaluateInterview = Asynchandler(async (req, res) => {
  const transcript = req.body.transcript;
  if (!transcript) {
    return res.status(400).json(new ApiResponse(400, null, "Transcript is required"));
  }

  const prompt = `You are a senior technical interviewer with 15+ years of experience. Evaluate the transcript STRICTLY. Do NOT inflate scores. Base every score and list item ONLY on evidence in the transcript.

SCORING (integers 0-10 only; no decimals):
- technicalScore: 0 = no/wrong technical content, 10 = strong accurate depth. Score low if answers are missing or shallow.
- communicationScore: 0 = unclear or no real answers, 10 = clear and professional. Vague answers = max 6.
- confidenceScore: 0 = silent/very hesitant, 10 = confident. Score low for "I don't know" or filler-heavy answers.

REQUIREMENTS: strengths, weaknesses, improvementPlan must each be 2-5 short strings, evidence-based. Do not be generous; weak or missing answers must lower scores.

Transcript:
${transcript}

Return ONLY valid JSON. No markdown, no explanation, no code fence.
{"technicalScore":7,"communicationScore":8,"confidenceScore":6,"strengths":["..."],"weaknesses":["..."],"improvementPlan":["..."]}`;

  const text = await getAiResponse(prompt);
  if (!text) {
    return res.status(500).json(new ApiResponse(500, null, "Failed to get AI evaluation"));
  }

  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return res.status(500).json(new ApiResponse(500, null, "Failed to parse AI evaluation"));
  }
  return res.json(new ApiResponse(200, parsed, "Interview evaluated successfully"));
});