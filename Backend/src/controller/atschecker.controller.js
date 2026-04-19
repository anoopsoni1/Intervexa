import dotenv from "dotenv";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { getAiResponse, hasAnyAiProvider } from "../utils/aiClient.js";
import {
  blendAtsScoreWithParseRate,
  computeResumeParseRate,
} from "../utils/resumeParseRate.js";

dotenv.config();

function parseJsonFromAi(text) {
  const normalized = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // 1) Fast path: pure JSON
  try {
    return JSON.parse(normalized);
  } catch {
    // continue to extraction strategies
  }

  // 2) Greedy object extraction (works when AI adds headings before/after JSON)
  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const slice = normalized.slice(firstBrace, lastBrace + 1).trim();
    try {
      return JSON.parse(slice);
    } catch {
      // continue to balanced scan
    }
  }

  // 3) Balanced brace scan for the first valid JSON object
  for (let i = 0; i < normalized.length; i++) {
    if (normalized[i] !== "{") continue;
    let depth = 0;
    let inString = false;
    let escaping = false;
    for (let j = i; j < normalized.length; j++) {
      const ch = normalized[j];
      if (escaping) {
        escaping = false;
        continue;
      }
      if (ch === "\\") {
        escaping = true;
        continue;
      }
      if (ch === "\"") {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          const candidate = normalized.slice(i, j + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            break;
          }
        }
      }
    }
  }

  return null;
}

const CheckATSScore = Asynchandler(async (req, res) => {
  const { resumeText, jobDescription, extractionMethod, parseRate: parseRateBody } = req.body;

  if (!resumeText || !jobDescription) {
    return res
      .status(400)
      .json({ message: "resumeText and jobDescription are required" });
  }
  if (!hasAnyAiProvider()) {
    return res.status(503).json({ message: "AI service not configured (no LLM provider key found)" });
  }

  try {
    const prompt = `
    You are a production-grade Applicant Tracking System (ATS) used by top tech companies.
    
    You MUST behave like a strict deterministic scoring engine, NOT a helpful assistant.
    
    ## CRITICAL RULES (NON-NEGOTIABLE)
    
    - DO NOT infer or assume skills.
    - DO NOT give credit for vague mentions.
    - ONLY count a skill if there is clear evidence of usage (project, experience, or measurable work).
    - If a critical requirement is missing, aggressively reduce the score.
    - If resume domain ≠ job domain → score MUST be below 40.
    - If more than 40% of core skills are missing → score MUST be below 60.
    
    ---
    
    ## STEP 1: Extract JD Intelligence
    
    From the job description, extract:
    - Core Skills (most important, max 15)
    - Secondary Skills (max 15)
    - Required Experience Level
    - Domain (e.g., Web Dev, AI, Data, etc.)
    
    ---
    
    ## STEP 2: Resume Validation
    
    For EACH skill:
    - Check if explicitly present
    - Check if used in:
      - Experience ✅ (full credit)
      - Projects ✅ (medium credit)
      - Skills section only ⚠️ (low credit)
      - Mention without context ❌ (no credit)
    
    ---
    
    ## STEP 3: STRICT SCORING
    
    You MUST follow this EXACT formula:
    
    ATS Score =
    (Keyword Match × 0.45) +
    (Experience Relevance × 0.25) +
    (Structure × 0.10) +
    (Impact × 0.10) +
    (Education × 0.10)
    
    ---
    
    ### 1. Keyword Match (0–45)
    - Core skills missing → heavy penalty
    - Weak context → partial credit only
    
    ---
    
    ### 2. Experience Relevance (0–25)
    - Same domain + similar role → high score
    - Projects only → max 60% of this section
    - Unrelated domain → very low
    
    ---
    
    ### 3. Structure (0–10)
    - Clear sections → high
    - Missing sections → penalty
    
    ---
    
    ### 4. Impact (0–10)
    - Measurable results required
    - No numbers → score below 5
    
    ---
    
    ### 5. Education (0–10)
    - Missing required degree → penalty
    
    ---
    
    ## STEP 4: HARD PENALTIES
    
    Apply these strictly:
    
    - Missing ANY critical skill → subtract 10–25 points
    - No real experience (only projects) → cap total score at 70
    - No measurable achievements → cap impact ≤ 4
    - Resume too generic → reduce total score by 10–20%
    
    ---
    
    ## STEP 5: FINAL SCORE RULES
    
    - MUST return integer (0–100)
    - DO NOT round generously
    - Be conservative
    
    ---
    
    ## OUTPUT FORMAT (STRICT JSON ONLY)
    
    {"score":<number>,"matchedSkills":["string"],"missingSkills":["string"],"summary":"string","improvementSuggestions":["string"],"resumeMistakes":["string"]}
    
    ---
    
    ## IMPORTANT OUTPUT RULES
    
    - matchedSkills = ONLY skills clearly demonstrated
    - missingSkills = ONLY important JD skills not found
    - NO overlap between arrays
    - summary = 2–4 sentences max
    - suggestions = actionable, job-specific
    - resumeMistakes = REAL issues in resume (not JD gaps)
    
    ---
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    ---
    
    RESUME:
    ${resumeText}
    `;

    const raw = await getAiResponse(prompt);
    const parsed = parseJsonFromAi(raw);
    if (!parsed || typeof parsed !== "object") {
      console.error("JSON parse error from AI: unable to parse object", String(raw || "").slice(0, 1200));
      return res
        .status(500)
        .json({ message: "Failed to parse ATS JSON" });
    }

    const mistakes = Array.isArray(parsed.resumeMistakes) ? parsed.resumeMistakes : [];
    const suggestions = Array.isArray(parsed.improvementSuggestions)
      ? parsed.improvementSuggestions
      : [];

    const aiRaw = parsed.score;
    const aiN = Math.round(Number(aiRaw));
    const aiMatchScore = Number.isNaN(aiN)
      ? 0
      : Math.min(100, Math.max(0, aiN));

    const ext =
      extractionMethod === "ocr" || extractionMethod === "native"
        ? extractionMethod
        : undefined;
    let parseRate = null;
    if (parseRateBody != null && parseRateBody !== "") {
      const n = Math.round(Number(parseRateBody));
      if (!Number.isNaN(n)) parseRate = Math.min(100, Math.max(0, n));
    }
    if (parseRate == null) {
      parseRate = computeResumeParseRate(resumeText, {
        extractionMethod: ext,
      });
    }

    const score = blendAtsScoreWithParseRate(aiMatchScore, parseRate);

    return res.json(
      new ApiResponse(
        200,
        {
          score,
          aiMatchScore,
          resumeParseRate: parseRate,
          // Use frontend-friendly field names while preserving AI output
          matchedKeywords: parsed.matchedSkills,
          missingKeywords: parsed.missingSkills,
          summary: parsed.summary,
          improvementSuggestions: suggestions,
          resumeMistakes: mistakes,
        },
        "ATS score generated successfully"
      )
    );
  } catch (err) {
    console.error("ATS AI error:", err);
    return res.status(500).json({ message: "Error generating ATS score" });
  }
});


export {  CheckATSScore };
