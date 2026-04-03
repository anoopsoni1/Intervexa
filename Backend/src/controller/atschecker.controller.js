import dotenv from "dotenv";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { getAiResponse, hasAnyAiProvider } from "../utils/aiClient.js";

dotenv.config();

const CheckATSScore = Asynchandler(async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res
      .status(400)
      .json({ message: "resumeText and jobDescription are required" });
  }
  if (!hasAnyAiProvider()) {
    return res.status(503).json({ message: "AI service not configured (no LLM provider key found)" });
  }

  try {
    const prompt = `You are an extremely strict Applicant Tracking System (ATS) evaluator used in a hiring pipeline. 
Your job is to objectively measure how well a resume matches a job description.

Be conservative and unforgiving: do NOT "guess" matches that are not clearly present in the resume. 
Minor mismatches or missing core skills MUST significantly reduce the score.

## Scoring criteria (0–100, MUST be strict)

1. Keyword & skill match (0–45)
   - Identify important skills, tools, technologies, responsibilities, and domain terms from the job description.
   - Give full credit ONLY when the same or very clear synonyms appear in the resume context that proves actual usage.
   - If a required/critical skill is missing, heavily penalize (large score reduction).
   - If a keyword appears only in an irrelevant or very weak context, give partial or zero credit.

2. Experience relevance (0–25)
   - Compare past roles, projects, and responsibilities in the resume to the job description.
   - Roles in the same domain & level (e.g., "Senior Frontend Engineer" for a senior frontend role) should get high credit.
   - If experience is in a different field or level (e.g., student projects only for a senior role), penalize.

3. Structure, clarity, and ATS-friendliness (0–10)
   - Reward clear sections (Experience, Skills, Education, Projects).
   - Penalize chaotic structure, missing key sections, or walls of text that are hard to parse.
   - Reward bullet points, consistent formatting, and clear job titles and dates.

4. Quantifiable impact (0–10)
   - Reward metrics and measurable outcomes (e.g., "increased conversion by 20%", "reduced latency by 35%").
   - If almost no bullets have numbers/impact, give a low score in this category.

5. Education & credentials (0–10)
   - Compare required/desired education, certifications, and licenses from the job description to the resume.
   - Penalize when hard requirements are missing.

## Score interpretation (MUST follow)

- 90–100: Exceptional, extremely strong match; almost all critical skills present; very relevant experience.
- 75–89: Strong match; most key skills present, relevant experience, only minor gaps.
- 55–74: Partial match; some important skills or experience missing or weak.
- 35–54: Weak match; multiple major requirements missing or only loosely related.
- 0–34: Very poor match; resume is largely unrelated to the role.

You MUST:
- Output a SINGLE integer between 0 and 100 (no decimals).
- Base everything ONLY on the provided resume and job description.
- If key requirements are missing, the score should NOT exceed 60 under any circumstance.
- If the resume is clearly from a different field, the score should usually be below 40.

## Required output

Return a JSON object with EXACTLY these fields:

- score: integer 0–100 (overall match).
- matchedSkills: array of strings. Important skills/keywords from the job description that are clearly present in the resume (max 20).
- missingSkills: array of strings. Important skills/keywords from the job description that are missing or very weak in the resume (max 20).
- summary: string. 2–4 sentences, concise, objective explanation of the match quality.
- improvementSuggestions: array of strings. 3–7 concrete, actionable suggestions to improve the resume for THIS job.
- resumeMistakes: array of strings. 4–10 specific problems or weaknesses IN THE RESUME ITSELF (not just missing JD keywords). Include where relevant: unclear or missing dates, weak or vague bullets, grammar/spelling issues you can infer from the text, messy structure or missing sections (Experience, Education, Skills), walls of text, inconsistent formatting, tables/columns/icons that confuse ATS parsers, lack of measurable impact, unprofessional tone, wrong tense, keyword stuffing, or contact/header issues. Each item must be one clear, standalone sentence. Do not repeat the same point twice.

The same concept or keyword must not appear in both matchedSkills and missingSkills.

## Response format (VERY IMPORTANT)

Respond with ONLY valid JSON. No markdown, no comments, no code fences, no extra text.

Use exactly this structure:

{"score":<number>,"matchedSkills":["string"],"missingSkills":["string"],"summary":"string","improvementSuggestions":["string"],"resumeMistakes":["string"]}

---

JOB DESCRIPTION:
${jobDescription}

---

RESUME:
${resumeText}
`;

    let raw = await getAiResponse(prompt);
    raw = (raw || "").replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error from AI:", e, raw);
      return res
        .status(500)
        .json({ message: "Failed to parse ATS JSON" });
    }

    const mistakes = Array.isArray(parsed.resumeMistakes) ? parsed.resumeMistakes : [];
    const suggestions = Array.isArray(parsed.improvementSuggestions)
      ? parsed.improvementSuggestions
      : [];

    return res.json(
      new ApiResponse(
        200,
        {
          score: parsed.score,
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
