import axios from "axios";
import { VideocallInterview } from "../models/VideocallInterview.model.js";
import {
  getAiResponse,
  transcribeRecordingBuffer,
  canTranscribeWithGroq,
} from "../utils/aiClient.js";

const DOWNLOAD_TIMEOUT_MS = 90000;

/**
 * Download recording from Cloudinary URL, transcribe with Groq Whisper, evaluate with multi-LLM getAiResponse.
 */
export async function processInterviewRecording(interviewId) {
  const interview = await VideocallInterview.findById(interviewId);
  if (!interview || !interview.recordingUrl) {
    return;
  }
  if (!canTranscribeWithGroq()) {
    console.warn("[processInterviewRecording] No GROQ_API_KEY — cannot transcribe; marking completed.");
    await VideocallInterview.findByIdAndUpdate(interviewId, { status: "completed" });
    return;
  }
  try {
    const response = await axios.get(interview.recordingUrl, {
      responseType: "arraybuffer",
      timeout: DOWNLOAD_TIMEOUT_MS,
      maxContentLength: 12 * 1024 * 1024,
      maxBodyLength: 12 * 1024 * 1024,
    });
    const buffer = Buffer.from(response.data);
    // Cloudinary "raw" uploads often come back as application/octet-stream; Whisper still expects webm-like bytes from our client.
    const filename = "recording.webm";
    const mimeType = "video/webm";

    let transcript = await transcribeRecordingBuffer(buffer, filename, mimeType);
    if (!transcript?.trim()) {
      console.error("[processInterviewRecording] Empty transcript after Groq STT", interviewId);
      await VideocallInterview.findByIdAndUpdate(interviewId, { status: "completed" });
      return;
    }

    const evalPrompt = `You are a senior technical interviewer with 15+ years of experience. Evaluate the interview transcript STRICTLY. Do NOT inflate scores. Be evidence-based only.

STRICT SCORING (each score 0-10, integers only; no decimals):
- technicalScore: Technical accuracy and depth ONLY from transcript. 0 = no technical content or wrong/irrelevant answers, 5 = some correct but shallow, 10 = strong, accurate, deep technical answers with evidence. If the candidate said little or nothing technical, score 0-3.
- communicationScore: Clarity and structure ONLY from transcript. 0 = inaudible, unclear, or no real answers, 10 = very clear, structured, professional. Vague or rambling answers = 4-6 max.
- confidenceScore: Composure and confidence ONLY from transcript. 0 = silent, very hesitant, or excessive filler words, 10 = confident and composed. Score low if answers are mostly "I don't know" or silence.

STRICT REQUIREMENTS:
- Base every score and every list item ONLY on explicit evidence in the transcript. If something was not said or cannot be inferred from the text, do not score it favorably.
- Do not be generous. Missing or short answers must result in lower scores. Default to the lower end of the range when evidence is weak.
- strengths: 2-5 short strings, each tied to a specific quote or moment in the transcript.
- weaknesses: 2-5 short strings, specific and constructive; include lack of depth or missing answers where applicable.
- improvementPlan: 2-5 short, actionable next steps.

Transcript:
${transcript}

Return ONLY valid JSON. No markdown, no code fence, no explanation. Example shape:
{"technicalScore":7,"communicationScore":8,"confidenceScore":6,"strengths":["Clear API experience","Structured answers"],"weaknesses":["Could add more examples"],"improvementPlan":["Practice STAR format","Add metrics to answers"]}`;

    let text = await getAiResponse(evalPrompt);
    if (!text) {
      await VideocallInterview.findByIdAndUpdate(interviewId, { transcript, status: "completed" });
      return;
    }
    text = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    let aiReport;
    try {
      aiReport = JSON.parse(text);
    } catch (parseErr) {
      console.error("[processInterviewRecording] Invalid JSON from AI", interviewId, text?.slice(0, 200));
      throw parseErr;
    }

    const clamp = (n) => (typeof n === "number" && !Number.isNaN(n) ? Math.min(10, Math.max(0, Math.round(n))) : null);
    aiReport = {
      technicalScore: clamp(aiReport.technicalScore) ?? clamp(parseFloat(aiReport.technicalScore)),
      communicationScore: clamp(aiReport.communicationScore) ?? clamp(parseFloat(aiReport.communicationScore)),
      confidenceScore: clamp(aiReport.confidenceScore) ?? clamp(parseFloat(aiReport.confidenceScore)),
      strengths: Array.isArray(aiReport.strengths) ? aiReport.strengths.filter((s) => typeof s === "string").slice(0, 10) : [],
      weaknesses: Array.isArray(aiReport.weaknesses) ? aiReport.weaknesses.filter((s) => typeof s === "string").slice(0, 10) : [],
      improvementPlan: Array.isArray(aiReport.improvementPlan) ? aiReport.improvementPlan.filter((s) => typeof s === "string").slice(0, 10) : [],
    };

    await VideocallInterview.findByIdAndUpdate(interviewId, {
      transcript,
      aiReport,
      status: "completed",
    });
  } catch (err) {
    console.error("[processInterviewRecording]", interviewId, err?.message || err);
    await VideocallInterview.findByIdAndUpdate(interviewId, { status: "completed" });
  }
}
