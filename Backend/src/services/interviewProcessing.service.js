import axios from "axios";
import { VideocallInterview } from "../models/VideocallInterview.model.js";
import {
  getAiResponse,
  transcribeRecordingBuffer,
  canTranscribeWithGroq,
} from "../utils/aiClient.js";

const DOWNLOAD_TIMEOUT_MS = 90000;

function parseJsonFromAi(text) {
  const normalized = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(normalized);
  } catch {
    // try extracting first JSON object from mixed content
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

function countWords(text) {
  const words = String(text || "").match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g);
  return words ? words.length : 0;
}

function countMatches(text, regex) {
  const hits = String(text || "").match(regex);
  return hits ? hits.length : 0;
}

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

    const evalPrompt = `You are a strict senior technical interviewer. Evaluate this transcript conservatively and ONLY by evidence in the text.

STRICT SCORING (each score 0-10, integers only; no decimals):
- technicalScore: Technical accuracy and depth ONLY from transcript. 0 = no technical content or wrong/irrelevant answers, 5 = some correct but shallow, 10 = strong, accurate, deep technical answers with evidence. If the candidate said little or nothing technical, score 0-3.
- communicationScore: Clarity and structure ONLY from transcript. 0 = inaudible, unclear, or no real answers, 10 = very clear, structured, professional. Vague or rambling answers = 4-6 max.
- confidenceScore: Composure and confidence ONLY from transcript. 0 = silent, very hesitant, or excessive filler words, 10 = confident and composed. Score low if answers are mostly "I don't know" or silence.

STRICT REQUIREMENTS:
- Base every score and every list item ONLY on explicit evidence in the transcript. If something was not said or cannot be inferred from the text, do not score it favorably.
- Do not be generous. Missing or short answers must result in lower scores. Default to the lower end of the range when evidence is weak.
- Apply hard penalties:
  - If transcript appears short/fragmented, no score should exceed 4.
  - If candidate repeatedly says "I don't know"/"not sure"/silence, technicalScore and confidenceScore should be <= 4.
  - If most answers are generic without examples, communicationScore should be <= 6.
- strengths: 2-5 short strings, each tied to a specific quote or moment in the transcript.
- weaknesses: 2-5 short strings, specific and constructive; include lack of depth or missing answers where applicable.
- improvementPlan: 2-5 short, actionable next steps.

Transcript:
${transcript}

Return ONLY valid JSON. No markdown, no code fence, no explanation. Example shape:
{"technicalScore":7,"communicationScore":8,"confidenceScore":6,"strengths":["Clear API experience","Structured answers"],"weaknesses":["Could add more examples"],"improvementPlan":["Practice STAR format","Add metrics to answers"]}`;

    const text = await getAiResponse(evalPrompt);
    if (!text) {
      await VideocallInterview.findByIdAndUpdate(interviewId, { transcript, status: "completed" });
      return;
    }
    let aiReport = parseJsonFromAi(text);
    if (!aiReport || typeof aiReport !== "object") {
      console.error("[processInterviewRecording] Invalid JSON from AI", interviewId, String(text).slice(0, 250));
      throw new Error("Invalid AI report JSON");
    }

    const clamp = (n) => (typeof n === "number" && !Number.isNaN(n) ? Math.min(10, Math.max(0, Math.round(n))) : null);
    const wordCount = countWords(transcript);
    const lowConfidenceHits = countMatches(transcript, /\b(i don't know|dont know|not sure|no idea|can't remember|cannot remember)\b/gi);

    let technicalScore = clamp(aiReport.technicalScore) ?? clamp(parseFloat(aiReport.technicalScore));
    let communicationScore = clamp(aiReport.communicationScore) ?? clamp(parseFloat(aiReport.communicationScore));
    let confidenceScore = clamp(aiReport.confidenceScore) ?? clamp(parseFloat(aiReport.confidenceScore));

    // Enforce strict caps independent of model generosity.
    if (wordCount < 60) {
      technicalScore = Math.min(technicalScore ?? 0, 3);
      communicationScore = Math.min(communicationScore ?? 0, 3);
      confidenceScore = Math.min(confidenceScore ?? 0, 3);
    } else if (wordCount < 120) {
      technicalScore = Math.min(technicalScore ?? 0, 5);
      communicationScore = Math.min(communicationScore ?? 0, 5);
      confidenceScore = Math.min(confidenceScore ?? 0, 5);
    }
    if (lowConfidenceHits >= 3) {
      technicalScore = Math.min(technicalScore ?? 0, 4);
      confidenceScore = Math.min(confidenceScore ?? 0, 4);
    }
    if (lowConfidenceHits >= 6) {
      technicalScore = Math.min(technicalScore ?? 0, 2);
      confidenceScore = Math.min(confidenceScore ?? 0, 2);
    }

    const normalizeList = (arr, minCount, fallback) => {
      const clean = Array.isArray(arr)
        ? arr.map((s) => (s == null ? "" : String(s).trim())).filter(Boolean)
        : [];
      const sliced = clean.slice(0, 5);
      if (sliced.length >= minCount) return sliced;
      return [...sliced, ...fallback].slice(0, Math.max(minCount, 2));
    };

    aiReport = {
      technicalScore: technicalScore ?? 0,
      communicationScore: communicationScore ?? 0,
      confidenceScore: confidenceScore ?? 0,
      strengths: normalizeList(aiReport.strengths, 2, [
        "Attempted to answer at least some questions directly.",
        "Showed willingness to continue despite difficult questions.",
      ]),
      weaknesses: normalizeList(aiReport.weaknesses, 2, [
        "Technical depth was limited or inconsistent in multiple answers.",
        "Several responses lacked concrete examples or implementation detail.",
      ]),
      improvementPlan: normalizeList(aiReport.improvementPlan, 2, [
        "Practice 10-15 role-specific interview questions with structured sample answers.",
        "Add project-based examples with tools used, decisions made, and measurable outcomes.",
      ]),
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
