import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { getAiResponse } from "../utils/aiClient.js";

function parseJsonFromAi(text) {
  const normalized = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(normalized);
  } catch {
    const first = normalized.indexOf("{");
    const last = normalized.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      try {
        return JSON.parse(normalized.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const evaluateInterview = Asynchandler(async (req, res) => {
  const transcript = req.body.transcript;
  if (!transcript) {
    return res.status(400).json(new ApiResponse(400, null, "Transcript is required"));
  }

  const prompt = `You are a strict senior technical interviewer. Evaluate this transcript conservatively and ONLY by evidence in the text.

SCORING (integers 0-10 only; no decimals):
- technicalScore: 0 = no/wrong technical content, 10 = strong accurate depth. Score low if answers are missing or shallow.
- communicationScore: 0 = unclear or no real answers, 10 = clear and professional. Vague answers = max 6.
- confidenceScore: 0 = silent/very hesitant, 10 = confident. Score low for "I don't know" or filler-heavy answers.

REQUIREMENTS:
- strengths, weaknesses, improvementPlan must each be 2-5 short strings and evidence-based.
- Be strict: weak or missing answers must lower scores.
- If transcript is short/fragmented, no score should exceed 4.
- Repeated "I don't know"/"not sure" should keep technicalScore and confidenceScore <= 4.

Transcript:
${transcript}

Return ONLY valid JSON. No markdown, no explanation, no code fence.
{"technicalScore":7,"communicationScore":8,"confidenceScore":6,"strengths":["..."],"weaknesses":["..."],"improvementPlan":["..."]}`;

  const text = await getAiResponse(prompt);
  if (!text) {
    return res.status(500).json(new ApiResponse(500, null, "Failed to get AI evaluation"));
  }

  const parsed = parseJsonFromAi(text);
  if (!parsed || typeof parsed !== "object") {
    return res.status(500).json(new ApiResponse(500, null, "Failed to parse AI evaluation"));
  }
  return res.json(new ApiResponse(200, parsed, "Interview evaluated successfully"));
});