import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { VideocallInterview } from "../models/VideocallInterview.model.js";
import { getAiResponse, hasAnyAiProvider } from "../utils/aiClient.js";

const INTERVIEW_DURATION_MINUTES = 15;

/** Get next AI interviewer question for the given role. Optional: previous Q&A for context. Uses shared multi-provider AI fallback. */
export const getNextAiQuestion = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const { id } = req.params;
  const { previousQuestions } = req.body || {};

  const interview = await VideocallInterview.findOne({
    _id: id,
    $or: [{ recruiterId: userId }, { candidateId: userId }],
  });
  if (!interview) throw new ApiError(404, "Interview not found");

  const role = interview.role || "Software Engineer";

  const context = Array.isArray(previousQuestions) && previousQuestions.length > 0
    ? `Previous questions asked:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nGenerate the NEXT single question only.`
    : "Generate the FIRST interview question only.";

  const prompt = `You are a strict, professional AI interviewer conducting a real job interview for the role: ${role}.

${context}

STRICT RULES (follow exactly):
- Ask exactly ONE question. No preamble, no "Great, so...". Return ONLY the question text.
- Be concise: one or two sentences maximum. No long setups.
- First question: either a brief self-introduction request OR a direct role-specific technical/behavioral question. No small talk.
- Follow-up questions: must be role-relevant and substantive. Go deeper on technical depth, past experience, or problem-solving. Do NOT repeat or rephrase previous questions.
- Tone: professional and neutral. Do not give hints, answers, or encouragement. Do not say "Interesting" or "Tell me more" as the full question—ask something specific.
- Do not include numbering, "Question:", or quotation marks. Output only the raw question.`;

  let question;
  if (!hasAnyAiProvider()) {
    const isFirst = !Array.isArray(previousQuestions) || previousQuestions.length === 0;
    question = isFirst
      ? `Tell me about yourself and your experience relevant to the ${role} role.`
      : `Can you elaborate on that? Or tell me about a challenge you faced in your work.`;
    return res.status(200).json(new ApiResponse(200, { question, durationMinutes: INTERVIEW_DURATION_MINUTES }, "OK"));
  }

  try {
    question = await getAiResponse(prompt);
    question = (question || "").trim();
  } catch (err) {
    console.error("[getNextAiQuestion] AI fetch failed:", err?.message || err);
    const isFirst = !Array.isArray(previousQuestions) || previousQuestions.length === 0;
    question = isFirst
      ? `Tell me about yourself and your experience relevant to the ${role} role.`
      : `Can you elaborate on that? Or tell me about a challenge you faced in your work.`;
  }

  if (!question) question = "What interests you most about this role?";
  return res.status(200).json(new ApiResponse(200, { question, durationMinutes: INTERVIEW_DURATION_MINUTES }, "OK"));
});
