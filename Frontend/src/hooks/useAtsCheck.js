import { useMutation } from "@tanstack/react-query";
import { API_BASE, JOB_API_BASE } from "../config";

function normalizeAtsResult(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const scoreRaw = raw.score;
  const score =
    typeof scoreRaw === "number" && !Number.isNaN(scoreRaw)
      ? Math.min(100, Math.max(0, scoreRaw))
      : Number(scoreRaw);
  const aiRaw = raw.aiMatchScore;
  const aiMatchScore =
    typeof aiRaw === "number" && !Number.isNaN(aiRaw)
      ? Math.min(100, Math.max(0, aiRaw))
      : aiRaw != null
        ? Number(aiRaw)
        : undefined;
  const prRaw = raw.resumeParseRate;
  const resumeParseRate =
    typeof prRaw === "number" && !Number.isNaN(prRaw)
      ? Math.min(100, Math.max(0, prRaw))
      : prRaw != null
        ? Number(prRaw)
        : undefined;
  const matched = Array.isArray(raw.matchedKeywords) ? raw.matchedKeywords : [];
  const missing = Array.isArray(raw.missingKeywords) ? raw.missingKeywords : [];
  const improvementSuggestions = Array.isArray(raw.improvementSuggestions)
    ? raw.improvementSuggestions
    : [];
  const resumeMistakes = Array.isArray(raw.resumeMistakes) ? raw.resumeMistakes : [];
  const dedupe = (arr) => {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      const s = String(x ?? "").trim();
      if (!s) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
    return out;
  };
  return {
    ...raw,
    score: Number.isFinite(score) ? score : raw.score,
    ...(Number.isFinite(aiMatchScore) ? { aiMatchScore } : {}),
    ...(Number.isFinite(resumeParseRate) ? { resumeParseRate } : {}),
    matchedKeywords: dedupe(matched),
    missingKeywords: dedupe(missing),
    improvementSuggestions: dedupe(improvementSuggestions),
    resumeMistakes: dedupe(resumeMistakes),
  };
}

function pollIntervalMs(attempt) {
  if (attempt < 12) return 1000;
  if (attempt < 28) return 1800;
  return 2500;
}

export function useAtsCheck({ onUnauthorized }) {
  const saveAtsScoreMutation = useMutation({
    mutationFn: async ({ score: scoreValue, parseRate: pr }) => {
      const saveRes = await fetch(`${API_BASE}/create-atsscore`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: scoreValue,
          ...(pr != null && typeof pr === "number" && !Number.isNaN(pr) ? { parseRate: pr } : {}),
        }),
      });

      if (!saveRes.ok) {
        const saveJson = await saveRes.json().catch(() => ({}));
        throw new Error(saveJson?.message || "Failed to save ATS score");
      }
      return saveRes.json().catch(() => ({}));
    },
  });

  const runAtsCheckMutation = useMutation({
    mutationFn: async (
      { resumeTextValue, jobDescriptionValue, parseRate: clientParseRate, extractionMethod },
      { signal }
    ) => {
      const resumeText = String(resumeTextValue ?? "").trim();
      const jobDescription = String(jobDescriptionValue ?? "").trim();

      const headers = {
        "Content-Type": "application/json",
      };

      const ext =
        extractionMethod === "ocr" || extractionMethod === "native" ? extractionMethod : undefined;
      const bodyPayload = {
        resumeText,
        jobDescription,
        ...(ext ? { extractionMethod: ext } : {}),
      };
      if (clientParseRate != null && clientParseRate !== "") {
        const n = Number(clientParseRate);
        if (!Number.isNaN(n)) bodyPayload.parseRate = Math.min(100, Math.max(0, n));
      }

      const res = await fetch(`${API_BASE}/atscheck`, {
        method: "POST",
        credentials: "include",
        headers,
        signal,
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        if (typeof onUnauthorized === "function") onUnauthorized();
        throw new Error("Unauthorized");
      }

      if (!res.ok && res.status !== 202) {
        throw new Error(data?.message || "Failed to calculate ATS score");
      }

      let resultData = data?.data ?? data;
      if (res.status === 202 && resultData?.jobId) {
        const jobId = resultData.jobId;
        const maxAttempts = 48;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          if (signal?.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }
          await new Promise((r) => setTimeout(r, pollIntervalMs(attempt)));
          if (signal?.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }

          const jobRes = await fetch(`${JOB_API_BASE}/${jobId}`, {
            credentials: "include",
            signal,
            headers: {},
          });
          const jobJson = await jobRes.json().catch(() => ({}));
          const jobData = jobJson?.data ?? jobJson;

          if (jobData?.status === "completed" && jobData?.result) {
            resultData = jobData.result?.data ?? jobData.result;
            break;
          }
          if (jobData?.status === "failed") {
            throw new Error(jobData?.error || "ATS check failed");
          }
        }

        const n = Number(resultData?.score);
        if (resultData?.score == null || Number.isNaN(n)) {
          throw new Error("ATS result did not complete in time. Please try again.");
        }
      }

      if (resultData == null || typeof resultData !== "object") {
        throw new Error("Invalid ATS response from server");
      }

      const normalized = normalizeAtsResult(resultData);
      const score =
        typeof normalized?.score === "number"
          ? normalized.score
          : Number(normalized?.score);

      if (typeof score === "number" && !Number.isNaN(score)) {
        try {
          const pr =
            typeof normalized?.resumeParseRate === "number" && !Number.isNaN(normalized.resumeParseRate)
              ? normalized.resumeParseRate
              : undefined;
          await saveAtsScoreMutation.mutateAsync({ score, parseRate: pr });
        } catch (saveErr) {
          console.warn("ATS score save failed:", saveErr?.message || "Unknown error");
        }
      }

      return normalized;
    },
  });

  return {
    checkAts: runAtsCheckMutation.mutateAsync,
    loading: runAtsCheckMutation.isPending,
  };
}
