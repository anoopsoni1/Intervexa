/**
 * Shared AI client: Groq with OpenAI-compatible chat completions API.
 * Uses chat.completions (Groq-supported); model chosen for reliability and long context.
 * Interview recording transcription uses Groq's OpenAI-compatible /audio/transcriptions (Whisper).
 */
import OpenAI from "openai";
import { toFile } from "openai/uploads";

const aiClient = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

const MODEL = "llama-3.3-70b-versatile";
const API_TIMEOUT_MS = 9000;
const MAX_RETRIES = 2;
const API1_COOLDOWN_MS = 5 * 60 * 1000;// for 5 minutes
let api1CooldownUntil = 0;

const api2Client =
  process.env.API2_API_KEY 
    ? new OpenAI({
        apiKey: process.env.API2_API_KEY,
        baseURL:
          process.env.API2_BASE_URL?.trim() || "https://api.groq.com/openai/v1",
      })
    : null;

const api3Client =
  process.env.API3_API_KEY
    ? new OpenAI({
        apiKey: process.env.API3_API_KEY,
        baseURL:
          process.env.API3_BASE_URL?.trim() || "https://api.groq.com/openai/v1",
      })
    : null;

/** API4: OpenAI-compatible provider (OpenAI, OpenRouter, etc.) — set API4_BASE_URL + API4_MODEL to match your key. */
const api4Base =
  process.env.API4_BASE_URL?.trim() || "https://api.openai.com/v1";
const api4Client = process.env.API4_API_KEY
  ? new OpenAI({
      apiKey: process.env.API4_API_KEY.trim(),
      baseURL: api4Base,
    })
  : null;
const API4_MODEL =
  process.env.API4_MODEL?.trim() || "gpt-4o-mini";

const API2_MODEL = "llama-3.3-70b-versatile";
const API3_MODEL = "llama-3.1-8b-instant";

/** Groq Whisper model for speech-to-text (see https://console.groq.com/docs/speech-to-text) */
const GROQ_WHISPER_MODEL = process.env.GROQ_WHISPER_MODEL || "whisper-large-v3";
const TRANSCRIPTION_TIMEOUT_MS = Number(process.env.GROQ_TRANSCRIPTION_TIMEOUT_MS) || 120000;

function withTimeout(promise, ms = API_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const err = new Error(`Request timed out after ${ms}ms`);
      err.code = "ETIMEDOUT";
      setTimeout(() => reject(err), ms);
    }),
  ]);
}

function shouldRetry(error) {
  const status = error?.status ?? error?.response?.status;
  if (status === 429) return true;
  if (typeof status === "number" && status >= 500 && status <= 599) return true;

  const code = error?.code;
  const retryableCodes = new Set([
    "ETIMEDOUT",
    "ECONNRESET",
    "ECONNREFUSED",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNABORTED",
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_SOCKET",
    "UND_ERR_CONNECT",
  ]);
  return retryableCodes.has(code);
}

async function retryWithBackoff(fn, label, maxRetries = MAX_RETRIES) {
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = shouldRetry(error);
      const isLastAttempt = attempt === maxRetries;

      if (!retryable || isLastAttempt) break;

      console.warn(
        `[aiClient] ${label} attempt ${attempt + 1} failed, retrying...`,
        error?.message || error
      );
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function callProvider(client, model, prompt, apiLabel) {
  if (!client) {
    const err = new Error(`${apiLabel} is not configured`);
    err.code = "NOT_CONFIGURED";
    throw err;
  }

  console.log(`[aiClient] Using ${apiLabel}`);
  const completion = await withTimeout(
    client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8192,
      temperature: 0.3,
    }),
    API_TIMEOUT_MS
  );

  const text = completion?.choices?.[0]?.message?.content;
  return typeof text === "string" ? text.trim() : null;
}

export async function callAPI1(prompt) {
  return callProvider(aiClient, MODEL, prompt, "API1");
}

export async function callAPI2(prompt) {
  return callProvider(api2Client, API2_MODEL, prompt, "API2");
}

export async function callAPI3(prompt) {
  return callProvider(api3Client, API3_MODEL, prompt, "API3");
}

export async function callAPI4(prompt) {
  return callProvider(api4Client, API4_MODEL, prompt, "API4");
}

export async function generateResponse(prompt) {
  const now = Date.now();
  const api1InCooldown = now < api1CooldownUntil;

  if (api1InCooldown) {
    const remainingMs = api1CooldownUntil - now;
    const remainingMin = Math.ceil(remainingMs / 60000); // for 5 minutes
    console.warn(`[aiClient] API1 is in cooldown. Skipping for ~${remainingMin} more minute(s).`);
  } else {
    try {
      return await retryWithBackoff(() => callAPI1(prompt), "API1", MAX_RETRIES);
    } catch (api1Error) {
      api1CooldownUntil = Date.now() + API1_COOLDOWN_MS;
      console.error("[aiClient] API1 failed:", api1Error?.message || api1Error);
      console.warn("[aiClient] API1 moved to cooldown for 5 minutes.");
    }
  }

  try {
    return await retryWithBackoff(() => callAPI2(prompt), "API2", MAX_RETRIES);
  } catch (api2Error) {
    console.error("[aiClient] API2 failed:", api2Error?.message || api2Error);
  }

  try {
    return await retryWithBackoff(() => callAPI3(prompt), "API3", MAX_RETRIES);
  } catch (api3Error) {
    console.error("[aiClient] API3 failed:", api3Error?.message || api3Error);
  }

  try {
    return await retryWithBackoff(() => callAPI4(prompt), "API4", MAX_RETRIES);
  } catch (api4Error) {
    console.error("[aiClient] API4 failed:", api4Error?.message || api4Error);
  }

  throw new Error("All LLM APIs failed");
}

/**
 * Send a text prompt and get raw text response.
 * @param {string} prompt
 * @returns {Promise<string|null>} response text or null
 */
export async function getAiResponse(prompt) {
  try {
    return await generateResponse(prompt);
  } catch (err) {
    console.error("[aiClient] getAiResponse error:", err?.message || err);
    return null;
  }
}

export function hasAnyAiProvider() {
  return Boolean(aiClient || api2Client || api3Client || api4Client);
}

/** True when Groq primary key is set (required for Whisper transcription on Groq). */
export function canTranscribeWithGroq() {
  return Boolean(aiClient);
}

/**
 * Transcribe interview recording bytes using Groq Whisper (OpenAI-compatible STT API).
 * @param {Buffer} buffer
 * @param {string} [filename]
 * @param {string} [mimeType]
 * @returns {Promise<string|null>}
 */
export async function transcribeRecordingBuffer(buffer, filename = "recording.webm", mimeType = "video/webm") {
  if (!aiClient) {
    console.warn("[aiClient] transcribeRecordingBuffer: GROQ_API_KEY not set");
    return null;
  }
  try {
    const file = await toFile(buffer, filename, { type: mimeType });
    console.log("[aiClient] Transcribing with Groq Whisper:", GROQ_WHISPER_MODEL);
    const result = await withTimeout(
      aiClient.audio.transcriptions.create({
        file,
        model: GROQ_WHISPER_MODEL,
      }),
      TRANSCRIPTION_TIMEOUT_MS
    );
    const text = typeof result === "string" ? result : result?.text;
    return typeof text === "string" ? text.trim() : null;
  } catch (err) {
    console.error("[aiClient] transcribeRecordingBuffer:", err?.message || err);
    return null;
  }
}

export { aiClient, MODEL };
