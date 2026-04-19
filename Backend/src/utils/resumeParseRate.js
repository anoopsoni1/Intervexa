/**
 * Heuristic 0–100: how readable / machine-parseable resume text is for ATS (volume,
 * alphanumeric ratio, OCR vs native text layer, sparse extraction vs file size).
 * @param {string} text - Extracted resume plain text
 * @param {{ extractionMethod?: 'native'|'ocr', fileSizeBytes?: number }} [options]
 */
export function computeResumeParseRate(text, options = {}) {
  const raw = String(text ?? "");
  const normalized = raw.replace(/\s+/g, " ").trim();
  const len = normalized.length;
  if (len < 1) return 0;

  const wordMatches = normalized.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g);
  const words = wordMatches ? wordMatches.length : 0;
  const alnum = (normalized.match(/[A-Za-z0-9]/g) || []).length;
  const alnumRatio = alnum / len;

  // Volume: reward enough words for keyword matching (saturates ~150 words)
  const volumeScore = Math.min(36, (Math.min(words, 150) / 150) * 36);

  // Cleanliness: OCR / garbled PDFs tend to have lower letter-to-symbol ratio
  let cleanScore;
  if (alnumRatio >= 0.42) cleanScore = 44;
  else if (alnumRatio >= 0.28) cleanScore = 28 + ((alnumRatio - 0.28) / 0.14) * 16;
  else if (alnumRatio >= 0.18) cleanScore = 14 + ((alnumRatio - 0.18) / 0.1) * 14;
  else cleanScore = (alnumRatio / 0.18) * 14;

  const isOcr = options.extractionMethod === "ocr";
  const methodScore = isOcr ? 8 : 12;

  let adjClean = cleanScore;
  const fs = options.fileSizeBytes;
  if (typeof fs === "number" && fs > 350000 && words < 35) {
    adjClean *= 0.72;
  }

  let total = volumeScore + adjClean + methodScore;

  if (words < 20) total *= 0.82;
  if (words < 12) total = Math.min(total, 48);
  if (words < 6) total = Math.min(total, 28);

  return Math.min(100, Math.max(0, Math.round(total)));
}

/**
 * Combine LLM job-fit score with resume text parse quality.
 * @param {number} aiScore - 0–100 from model
 * @param {number} parseRate - 0–100 from computeResumeParseRate
 */
export function blendAtsScoreWithParseRate(aiScore, parseRate) {
  const a = Math.min(100, Math.max(0, Number(aiScore) || 0));
  const p = Math.min(100, Math.max(0, Number(parseRate) || 0));
  // Job/keyword fit dominates; parse quality nudges the final number
  return Math.min(100, Math.max(0, Math.round(a * 0.8 + p * 0.2)));
}
