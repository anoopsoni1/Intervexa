import fs from "fs";
import mammoth, { extractRawText } from "mammoth";
import { uploadonCloudinary, uploadVideoToCloudinary } from "../utils/Cloudinary.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getAiResponse, hasAnyAiProvider } from "../utils/aiClient.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from "docx";
import PDFDocument from "pdfkit";
import {
  ocrImageBuffer,
  ocrPdfBuffer,
  shouldFallbackToOcr,
} from "../utils/ocrExtract.js";
import { computeResumeParseRate } from "../utils/resumeParseRate.js";

const IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export const UploadResume = Asynchandler(async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  // Read file into buffer before upload (Cloudinary may delete local file); use this for OCR/extraction
  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(req.file.path);
  } catch (err) {
    console.error("Read file error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to read uploaded file",
    });
  }

  const cloudinaryRes = await uploadonCloudinary(req.file.path);
  if (!cloudinaryRes) {
    return res.status(500).json({
      success: false,
      message: "Cloudinary upload failed",
    });
  }

  const fileType = req.file.mimetype || "";
  const forceOcr =
    req.body?.forceOcr === "1" ||
    req.body?.forceOcr === "true" ||
    req.body?.forceOcr === true;

  let extractedText = "";
  let extractionMethod = "native";

  try {
    if (IMAGE_MIME.has(fileType)) {
      extractionMethod = "ocr";
      extractedText = await ocrImageBuffer(fileBuffer);
    } else if (fileType === "application/pdf") {
      if (forceOcr) {
        extractionMethod = "ocr";
        extractedText = await ocrPdfBuffer(fileBuffer);
      } else {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(fileBuffer),
          standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.449/standard_fonts/",
        });
        const pdf = await loadingTask.promise;
        const samplePages = Math.min(pdf.numPages, 3);
        let sampleText = "";
        for (let pageNum = 1; pageNum <= samplePages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          sampleText +=
            content.items.map((item) => item.str).join(" ") + "\n";
        }
        if (shouldFallbackToOcr(sampleText)) {
          extractionMethod = "ocr";
          extractedText = await ocrPdfBuffer(fileBuffer);
        } else {
          extractedText = sampleText;
          for (let pageNum = samplePages + 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            extractedText +=
              content.items.map((item) => item.str).join(" ") + "\n";
          }
        }
      }
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      const doc = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = doc.value || "";
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Only PDF, Word (DOC/DOCX), or image files (PNG, JPG, WebP) are supported",
      });
    }
  } catch (err) {
    console.error("Extract/OCR error:", err);
    return res.status(500).json({
      success: false,
      message:
        err?.code === "MODULE_NOT_FOUND" || err?.message?.includes("@napi-rs/canvas")
          ? "OCR requires canvas support. Ensure @napi-rs/canvas is installed."
          : "Failed to extract or OCR text from resume",
    });
  }

  const parseRate = computeResumeParseRate(extractedText, {
    extractionMethod,
    fileSizeBytes: fileBuffer?.length,
  });

  return res.json(
    new ApiResponse(
      200,
      {
        fileUrl: cloudinaryRes.secure_url,
        resumeText: extractedText,
        extractionMethod,
        parseRate,
      },
      extractionMethod === "ocr"
        ? "Resume uploaded & text scanned (OCR) successfully"
        : "Resume uploaded & text extracted successfully"
    )
  );
});

export const UploadVideo = Asynchandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No video uploaded",
    });
  }

  const fileType = req.file.mimetype || "";
  if (!fileType.startsWith("video/")) {
    return res.status(400).json({
      success: false,
      message: "Only video files are supported",
    });
  }

  const cloudinaryRes = await uploadVideoToCloudinary(req.file.path);
  if (!cloudinaryRes?.secure_url) {
    return res.status(500).json({
      success: false,
      message: "Video upload failed",
    });
  }

  return res.json(
    new ApiResponse(
      200,
      {
        fileUrl: cloudinaryRes.secure_url,
        publicId: cloudinaryRes.public_id,
        duration: cloudinaryRes.duration || null,
      },
      "Video uploaded successfully"
    )
  );
});


/** Remove **markdown** bold markers from AI/user strings (plain text for UI). */
function stripBoldMarkers(input) {
  if (input == null || typeof input !== "string") return input;
  let out = input;
  let prev;
  do {
    prev = out;
    out = out.replace(/\*\*([\s\S]*?)\*\*/g, "$1");
  } while (out !== prev);
  return out.replace(/\*\*/g, "");
}

function extractJsonObjectSegment(text) {
  const input = String(text || "");
  const start = input.indexOf("{");
  if (start < 0) return input.trim();

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i++) {
    const ch = input[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }
    if (ch === "\"") {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return input.slice(start, i + 1).trim();
    }
  }

  return input.slice(start).trim();
}

function buildJsonCandidates(rawText) {
  const raw = String(rawText || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/\uFEFF/g, "")
    .trim();

  const extracted = extractJsonObjectSegment(raw);
  const wrappedIfMissingBraces =
    extracted && !extracted.startsWith("{") && extracted.includes("\"name\"")
      ? `{${extracted}}`
      : extracted;

  const normalizedQuotes = wrappedIfMissingBraces
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'");

  const withoutTrailingCommas = normalizedQuotes.replace(/,\s*([}\]])/g, "$1");

  const candidates = [
    extracted,
    wrappedIfMissingBraces,
    normalizedQuotes,
    withoutTrailingCommas,
  ]
    .map((v) => (v || "").trim())
    .filter(Boolean);

  return Array.from(new Set(candidates));
}

function parseAiJson(rawText) {
  let lastError = null;
  for (const candidate of buildJsonCandidates(rawText)) {
    try {
      return { parsed: JSON.parse(candidate), cleaned: candidate };
    } catch (err) {
      lastError = err;
    }
  }
  return { parsed: null, cleaned: "", error: lastError };
}

/** Build plain resume text from structured detail (for backward compatibility / display). */
function detailToResumeText(d) {
  if (!d) return "";
  const lines = [];
  lines.push((d.name || "").trim() || "Your Name");
  lines.push((d.role || "").trim() || "Your Role");
  lines.push("");

  // Keep these four sections always present in final resume text.
  lines.push("SUMMARY");
  lines.push((d.summary || "").trim() || "Professional summary not provided.");
  lines.push("");

  lines.push("SKILLS");
  {
    const skillList = Array.isArray(d.skills)
      ? d.skills.map((s) => (s || "").trim()).filter(Boolean)
      : [];
    if (skillList.length > 0) {
      lines.push(...skillList);
    } else {
      lines.push("Relevant skills not provided.");
    }
  }
  lines.push("");

  lines.push("EXPERIENCE");
  {
    const experienceList = Array.isArray(d.experience)
      ? d.experience.map((entry) => (entry || "").trim()).filter(Boolean)
      : [];
    if (experienceList.length > 0) {
      experienceList.forEach((entry) => {
        lines.push(entry);
        lines.push("");
      });
    } else {
      lines.push("Experience details not provided.");
      lines.push("");
    }
  }

  if (Array.isArray(d.achievements) && d.achievements.length > 0) {
    const achievementList = d.achievements.map((a) => (a || "").trim()).filter(Boolean);
    if (achievementList.length) {
      lines.push("ACHIEVEMENTS");
      achievementList.forEach((a) => {
        lines.push(a);
        lines.push("");
      });
    }
  }
  if (Array.isArray(d.references) && d.references.length > 0) {
    const refs = d.references.map((r) => (r || "").trim()).filter(Boolean);
    if (refs.length) {
      lines.push("REFERENCES");
      refs.forEach((r) => {
        lines.push(r);
        lines.push("");
      });
    }
  }
  if (Array.isArray(d.projects) && d.projects.length > 0) {
    const projectTexts = d.projects.map((p) => (p || "").trim()).filter(Boolean);
    if (projectTexts.length) {
      lines.push("PROJECTS");
      projectTexts.forEach((p) => { lines.push(p); lines.push(""); });
    }
  }

  lines.push("EDUCATION");
  lines.push((d.education || "").trim() || "Education details not provided.");
  lines.push("");

  if ((d.languageProficiency || "").trim()) {
    lines.push("LANGUAGE PROFICIENCY");
    lines.push(d.languageProficiency.trim());
    lines.push("");
  }
  const contact = [(d.email || "").trim(), (d.phone || "").trim(), (d.github || "").trim()].filter(Boolean).join(" | ");
  if (contact) lines.push(contact);
  return lines.join("\n").trim();
}

export const aiEditResume = Asynchandler(async (req, res) => {
  const { resumeText, reoptimize } = req.body;

  if (!resumeText) {
    return res
      .status(400)
      .json({ success: false, message: "resumeText is required" });
  }

  if (!hasAnyAiProvider()) {
    return res.status(503).json({ message: "AI service not configured (no LLM provider key found)" });
  }

  const isReoptimize = Boolean(reoptimize);

  const baseInstruction = isReoptimize
    ? `You are an elite ATS resume optimizer AND refinement engine. The following resume is already optimized, but your job is to FURTHER IMPROVE it and ALWAYS increase its ATS score to 95+.
  
  Your strict priorities (in order):
  1. ATS keyword optimization (VERY IMPORTANT)
  2. Clarity and readability (clean structure, bullet points)
  3. Strong impact using action verbs
  4. Remove repetition completely
  5. Fix grammar, spelling, and punctuation perfectly
  
  You are allowed to aggressively rewrite, rephrase, and enhance content.
  You are NOT allowed to invent fake companies, roles, or numbers.
  
  You ARE allowed to:
  - Add relevant ATS keywords based on role/domain
  - Improve wording for stronger impact
  - Convert weak sentences into strong bullet points
  
  Return a single JSON object with exactly these keys—no other keys, no markdown, no code fence:`
    : `You are an elite ATS resume optimizer AND refinement engine. Your job is to parse and IMPROVE the resume so that its ATS score is ALWAYS higher and reaches 95+.
  
  Your strict priorities (in order):
  1. ATS keyword optimization (VERY IMPORTANT)
  2. Clarity and readability (clean structure, bullet points)
  3. Strong impact using action verbs
  4. Remove repetition completely
  5. Fix grammar, spelling, and punctuation perfectly
  
  You are allowed to aggressively rewrite, rephrase, and enhance content.
  You are NOT allowed to invent fake companies, roles, or numbers.
  
  You ARE allowed to:
  - Add relevant ATS keywords based on role/domain
  - Improve wording for stronger impact
  - Convert weak sentences into strong bullet points
  
  Return a single JSON object with exactly these keys—no other keys, no markdown, no code fence:`;
  
  const prompt = `${baseInstruction}
  
  - name (string)
  - role (string)
  
  - summary (string):
  Write a NEW high-impact summary (1–2 sentences).
  Include role + key skills + impact.
  Use strong action verbs and ATS keywords.
  
  - skills (array of strings):
  Keep relevant skills.
  Remove irrelevant skills.
  Add missing but logical skills for ATS.
  
  - experience (array of strings):
  Each entry:
  "Job Title\\nCompany\\nDuration\\n• Action + Impact\\n• Action + Impact"
  
  STRICT:
  - Strong action verbs only
  - Show impact
  - Quantification preferred
  - No weak verbs
  
  - projects (array of strings):
  1–2 bullets per project
  Action + impact + tech stack
  
  - achievements (array of strings):
  No duplicates
  
  - education (string)
  - languageProficiency (string)
  - email (string)
  - phone (string)
  - github (string)
  - linkedin (string)
  - references (array of strings)
  
  --------------------------------------------------
  🚨 ULTRA-STRICT FIX ENGINE (CRITICAL)
  --------------------------------------------------
  
  🔴 TASK 1: WORD REPETITION CONTROL
  - NO important word (verbs/keywords) should appear more than 2 times
  - Applies across ENTIRE resume
  
  If repeated:
  → Replace with strong synonyms
  
  Examples:
  - developed → engineered, built, implemented, created
  - created → designed, crafted
  - implemented → deployed, executed
  - specified → defined, outlined, detailed
  
  --------------------------------------------------
  
  🔴 TASK 2: SENTENCE REPETITION
  - No duplicate phrases
  - No similar sentence structures
  - Each bullet must be UNIQUE
  
  If repetition found:
  → Rewrite completely
  
  --------------------------------------------------
  
  🔴 TASK 3: GRAMMAR + COMMA FIX
  - Fix ALL spelling mistakes
  - Fix ALL grammar issues
  - Fix ALL punctuation and comma usage
  
  STRICT:
  - Every bullet must be a COMPLETE sentence
  - Proper comma usage required
  - No run-on sentences
  - Professional tone only
  - Correct tense usage
  
  --------------------------------------------------
  
  🔴 TASK 4: IMPACT IMPROVEMENT
  - Strengthen EVERY bullet
  
  RULES:
  - Start with strong action verb
  - Show clear outcome
  - Add measurable results IF available
  - If not → improve wording WITHOUT inventing data
  
  --------------------------------------------------
  
  🔴 TASK 5: CLARITY + CLEANUP
  - Remove unnecessary words
  - Simplify long sentences
  - Improve readability
  - Ensure ATS-friendly formatting
  
  --------------------------------------------------
  
  🔁 FINAL VALIDATION LOOP (MANDATORY)
  --------------------------------------------------
  
  Before returning output:
  1. Check word repetition → must be ZERO violations
  2. Check sentence repetition → must be ZERO
  3. Check grammar → must be PERFECT
  4. Check commas → must be correct
  5. Check clarity → must be clean
  
  ❗ If ANY issue exists:
  → Rewrite again
  → Re-check again
  
  Repeat until ALL conditions are satisfied.
  
  --------------------------------------------------
  
  FINAL OUTPUT CONDITIONS:
  ✔ No word repeated more than 2 times
  ✔ No repetition
  ✔ Perfect grammar
  ✔ Proper commas
  ✔ Strong impact
  
  --------------------------------------------------
  
  STRICT RULES:
  - Do NOT invent data
  - Do NOT use markdown
  - Return ONLY valid JSON
  - Escape \\n properly
  
  ${resumeText}`;

  let raw = await getAiResponse(prompt);
  raw = (raw || "").replace(/```json/g, "").replace(/```/g, "").trim();

  if (!raw) {
    throw new ApiError(500, "Failed to get response from AI");
  }

  let optimizedDetail = null;
  let { parsed, cleaned, error } = parseAiJson(raw);

  if (!parsed) {
    const repairPrompt = `Fix the following into strict valid JSON.
Rules:
- Return ONLY JSON object
- No markdown/code fences
- Keep same meaning and fields
- Remove invalid commas/brackets if present

INPUT:
${raw}`;
    const repairedRaw = await getAiResponse(repairPrompt);
    const repaired = parseAiJson(repairedRaw);
    parsed = repaired.parsed;
    cleaned = repaired.cleaned;
    error = repaired.error || error;
  }

  try {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw error || new Error("Invalid JSON object from AI");
    }
    optimizedDetail = {
      name: parsed.name != null ? String(parsed.name).trim() || "Your Name" : "Your Name",
      role: parsed.role != null ? String(parsed.role).trim() || "Your Role" : "Your Role",
      summary: parsed.summary != null ? String(parsed.summary).trim() : "",
      skills: Array.isArray(parsed.skills) ? parsed.skills.map((s) => String(s).trim()).filter(Boolean) : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience.map((e) => (e != null ? String(e).trim() : "")).filter(Boolean) : [],
      projects: Array.isArray(parsed.projects)
        ? parsed.projects
            .map((p) => (p != null ? stripBoldMarkers(String(p).trim()) : ""))
            .filter(Boolean)
        : [],
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements
            .map((a) => (a != null ? stripBoldMarkers(String(a).trim()) : ""))
            .filter(Boolean)
        : [],
      education: parsed.education != null ? String(parsed.education).trim() : "",
      languageProficiency: parsed.languageProficiency != null ? String(parsed.languageProficiency).trim() : "",
      email: parsed.email != null ? String(parsed.email).trim() : "",
      phone: parsed.phone != null ? String(parsed.phone).trim() : "",
      references: Array.isArray(parsed.references)
        ? parsed.references.map((r) => (r != null ? String(r).trim() : "")).filter(Boolean)
        : [],
      github: parsed.github != null ? String(parsed.github).trim() : "",
      linkedin: parsed.linkedin != null ? String(parsed.linkedin).trim() : "",
    };
  } catch (e) {
    console.error("AI optimize JSON parse error:", e, cleaned?.slice(0, 300) || raw?.slice(0, 300));
    throw new ApiError(500, "AI returned invalid format; please try again.");
  }

  const editedText = detailToResumeText(optimizedDetail);

  return res.json(
    new ApiResponse(200, { editedText, optimizedDetail }, "Resume optimized successfully by AI")
  );
});

const TEMPLATE_CONFIG = {
  classic: { name: 40, heading: 26, body: 22 },
  modern: { name: 44, heading: 28, body: 22 },
  minimal: { name: 36, heading: 24, body: 20 },
};

const JOB_REGEX = /(developer|engineer|intern|designer|manager)/i;

const SECTION_HEADERS = new Set([
  "SUMMARY",
  "SKILLS",
  "EXPERIENCE",
  "ACHIEVEMENTS",
  "EDUCATION",
  "PROJECTS",
  "REFERENCES",
  "LANGUAGE PROFICIENCY",
  "CERTIFICATIONS",
]);

export const exportResume = Asynchandler(async (req, res) => {
  const {
    resumeText,
    template = "modern",
    layout = "ats",
    format = "docx",
  } = req.body;

  if (!resumeText) {
    return res.status(400).json({ message: "resumeText required" });
  }

  const config = TEMPLATE_CONFIG[template] || TEMPLATE_CONFIG.modern;
  const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);

  /* ================= DOCX ================= */
  if (format === "docx") {
    const children = [];

    lines.forEach((line, index) => {
      if (index === 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: line, bold: true, size: config.name })],
        }));
        return;
      }

      if (SECTION_HEADERS.has(line.toUpperCase())) {
        children.push(new Paragraph({
          spacing: { before: 300 },
          children: [new TextRun({ text: line, bold: true, size: config.heading })],
        }));
        return;
      }

      const isJob = JOB_REGEX.test(line);

      children.push(new Paragraph({
        children: [new TextRun({
          text: line.replace(/^[-•]\s*/, ""),
          bold: isJob,
          size: config.body,
        })],
      }));
    });

    const doc = new Document({
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader("Content-Disposition", "attachment; filename=Resume.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
    return;
  }

  /* ================= PDF ================= */
  if (format === "pdf") {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Disposition", "attachment; filename=Resume.pdf");
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    lines.forEach((line, index) => {
      if (index === 0) {
        doc.fontSize(22).text(line, { underline: false });
        doc.moveDown();
        return;
      }

      if (SECTION_HEADERS.has(line.toUpperCase())) {
        doc.moveDown().fontSize(14).text(line, { underline: true });
        return;
      }

      const isJob = JOB_REGEX.test(line);
      doc.fontSize(11).font(isJob ? "Helvetica-Bold" : "Helvetica").text(line);
    });

    doc.end();
    return;
  }

  return res.status(400).json({ message: "format must be docx or pdf" });
});