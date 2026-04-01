import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { incrementDailyUserCount } from "../utils/dailyCount.js";
import { getAiResponse, hasAnyAiProvider } from "../utils/aiClient.js";

const ROADMAP_JSON_SCHEMA = `
Return ONLY valid JSON in this exact shape (no markdown, no code fences, no extra text):
{
  "phases": [
    {
      "title": "string",
      "description": "string",
      "duration": "string",
      "skills": ["string"],
      "milestones": ["string"],
      "tips": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "skills": ["string"],
      "difficulty": "string",
      "portfolioValue": "string"
    }
  ],
  "missingSkills": ["string"],
  "learningResources": [
    {
      "skill": "string",
      "resources": [
        { "title": "string", "url": "string", "type": "string" }
      ]
    }
  ],
  "careerTips": ["string"],
  "suggestedCertifications": ["string"]
}`;

/**
 * POST /api/generate-roadmap (requires verifyJWT; premium only, 15/day)
 * Body: { careerGoal, skills, experience, months }
 */
export const generateRoadmap = Asynchandler(async (req, res) => {
  if (!hasAnyAiProvider()) throw new ApiError(503, "AI service not configured (no LLM provider key found)");
  const userId = req.user?.id || req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { careerGoal, skills, experience, months } = req.body || {};

  if (!careerGoal || typeof careerGoal !== "string" || !careerGoal.trim()) {
    throw new ApiError(400, "careerGoal is required");
  }

  const skillsList = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  const experienceLevel = experience || "Beginner";
  const monthsNum = Math.max(1, Math.min(24, Number(months) || 6));

  const prompt = `You are an expert career coach and learning-path designer. Create a detailed, actionable career guidance roadmap to help the user reach their goal: "${careerGoal.trim()}".

CONTEXT:
- Current skills: ${skillsList.length ? skillsList.join(", ") : "None listed"}.
- Experience level: ${experienceLevel}.
- Time horizon: ${monthsNum} months.

REQUIREMENTS:
1. Phases: 3–6 clear phases in logical order. Each phase must have: title, description, duration (e.g. "2–3 weeks"), skills covered, 2–4 concrete milestones to check off, and a short "tips" string with study or practice advice.
2. Projects: 3–5 portfolio-worthy projects that build on each other. For each project include: title, description, skills used, difficulty (Beginner/Intermediate/Advanced), and "portfolioValue" (why it helps for jobs or interviews).
3. Missing skills: List skills the user should learn (prioritized). Only include skills not already in their current skills list where relevant.
4. Learning resources: For each major missing skill, suggest 2–4 resources with title, url (use real URLs when possible, otherwise placeholder like "https://example.com/resource"), and type (e.g. "course", "documentation", "book", "video").
5. Career tips: 3–6 short, actionable tips (networking, resume, LinkedIn, interviews, side projects, or industry-specific advice).
6. Suggested certifications: 0–4 relevant certifications or credentials that would strengthen their profile for this career goal (name only).

${ROADMAP_JSON_SCHEMA}

Generate a practical, industry-relevant roadmap. Be specific and actionable so the user can follow it step by step.`;

  let response;
  try {
    response = await getAiResponse(prompt);
    if (!response) throw new Error("Empty AI response");
  } catch (err) {
    console.error("[generateRoadmap] AI error:", err?.message || err);
    throw new ApiError(502, "AI service failed to generate roadmap");
  }

  if (!response || typeof response !== "string") {
    throw new ApiError(502, "Empty AI response");
  }

  const jsonStr = response
    .replace(/^[\s\S]*?```(?:json)?\s*/i, "")
    .replace(/\s*```[\s\S]*$/i, "")
    .trim();

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("[generateRoadmap] JSON parse error:", e?.message, "raw:", jsonStr?.slice(0, 300));
    throw new ApiError(502, "AI returned invalid JSON");
  }

  const normalized = {
    phases: Array.isArray(data.phases) ? data.phases : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
    learningResources: Array.isArray(data.learningResources) ? data.learningResources : [],
    careerTips: Array.isArray(data.careerTips) ? data.careerTips : [],
    suggestedCertifications: Array.isArray(data.suggestedCertifications) ? data.suggestedCertifications : [],
  };

  await incrementDailyUserCount(userId, "roadmapSuggestionsToday", "lastRoadmapSuggestionDate");

  return res
    .status(200)
    .json(new ApiResponse(200, normalized, "Roadmap generated"));
});
