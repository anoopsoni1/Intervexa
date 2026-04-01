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

  return res.json(
    new ApiResponse(
      200,
      {
        fileUrl: cloudinaryRes.secure_url,
        resumeText: extractedText,
        extractionMethod,
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
    ? `You are a professional resume editor. The following text is ALREADY an optimized resume (previously improved by AI). Your task is to FURTHER optimize it while treating these 4 checks as mandatory priorities: (1) ATS parse/readability, (2) quantifying impact, (3) repetition removal, and (4) spelling & grammar accuracy. Strengthen wording, add measurable impact where possible without inventing facts, use stronger action verbs, improve ATS keyword density, tighten the summary, and polish every section. Keep long project text to 1-5 lines or 1-2 bullets per project; do not leave or create long paragraphs. Preserve all factual content and the same structure. Return a single JSON object with exactly these keys—no other keys, no markdown, no code fence:`
    : `You are a professional resume editor focused on ATS optimization. Parse the resume text below and improve it with 4 mandatory priorities: (1) ATS parse/readability, (2) quantifying impact, (3) repetition removal, and (4) spelling & grammar accuracy. Use strong action verbs, improve ATS keywords, and return a single JSON object with exactly these keys—no other keys, no markdown, no code fence:`;

  const prompt = `${baseInstruction}

- name (string): full name
- role (string): job title / professional role
- summary (string): "strict priority is always write a professional summary (1-3 sentences), always use strong action verbs and quantify impact where possible and always summary was different , don't write the same summary again and again, always write a full paragraph new summary this is very important"
- skills (array of strings): list of skills, one per element , remove the irrelevant skills and keep the relevant skills only, do not add any other skills here.
- experience (array of strings): job history. If the resume has a section named "Work Experience", "WORK EXPERIENCE", "Employment", "Professional Experience", "Employment History", "Experience", or similar, or any other section that contains job history,or add his experience here like leetcode,hackerrank,codechef,codeforces,gfg,etc,extract all such entries and put them here , do not education section here , also his rank and rating here of such platform like leetcode,hackerrank,codechef,codeforces,gfg,etc put in this section . Use the key "experience" only.do not add any other section here. If the section only says "Fresher", "No experience", "Seeking first role", or similar, still include it as one entry (e.g. "Fresher" or "Aspiring professional seeking first opportunity"). Each element is one job entry as a single string with newlines, e.g. "Job Title\\nCompany Name\\n2020 – Present\\n• Bullet one\\n• Bullet two"
- projects (array of strings): each element one project—keep each SHORT (1–2 brief bullets max); plain text only—never use ** or other markdown in project strings
- achievements (array of strings): include ONLY achievements/accomplishments/awards (one per element, e.g. "Won Smart India Hackathon 2024", "Solved DSA problems on LeetCode", "Solved  DSA problems on LeetCode", "Top 10% in coding competition",every such achievements, codechef rating , leetcode rating , etc , if he has any such achievements, put them here). If none exist, return an empty array [].
- education (string): education block
- languageProficiency (string): languages
- email (string): email address
- phone (string): phone number
- references (array of strings, optional): each element is one reference entry, e.g. "Name\\nTitle, Company\\nEmail / Phone". If the resume has no references section, return an empty array or omit this key.
-> strict the rules and do not break the rules.
Rules:
- Prioritize these 4 checks in every section: ATS parse/readability, quantifying impact, repetition removal, and spelling & grammar.
- Preserve all factual content; do not invent companies, roles, dates, projects, certifications, or numbers.
- Fix grammar and spelling.
- Quantify impact where possible from available facts; if exact numbers are not present, improve impact wording without fabricating metrics.
- Remove repetitive or duplicated phrases/points.
- Use strong action verbs and ATS-relevant keywords naturally.
- Keep projects concise—short title and 1-2 bullet points or 1-3 lines per project; never expand projects into long paragraphs.
- If achievements/accomplishments are not present in the resume, return achievements as an empty array [].
- Do not use markdown (no **bold** or __italic__ markers) in any string field—output plain text only.
- Return ONLY valid JSON. All string values must be properly escaped (e.g. newlines as \\n, quotes escaped).${isReoptimize ? " Focus on elevating the existing content (more impact, better keywords, tighter phrasing) rather than restructuring." : ""}


${isReoptimize ? "Already-optimized resume text to further optimize:" : "Resume text to parse and improve:"}
${resumeText}`;

  let raw = await getAiResponse(prompt);
  raw = (raw || "").replace(/```json/g, "").replace(/```/g, "").trim();

  if (!raw) {
    throw new ApiError(500, "Failed to get response from AI");
  }

  let optimizedDetail = null;
  let cleaned = raw.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/m, "$1").trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
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
    };
  } catch (e) {
    console.error("AI optimize JSON parse error:", e, raw?.slice(0, 300));
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

  const config = TEMPLATE_CONFIG[template];
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

      if (["SUMMARY","SKILLS","EXPERIENCE","ACHIEVEMENTS","EDUCATION","PROJECTS","REFERENCES"].includes(line.toUpperCase())) {
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
    return res.send(buffer);
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

      if (["SUMMARY","SKILLS","EXPERIENCE","ACHIEVEMENTS","EDUCATION","PROJECTS","REFERENCES"].includes(line.toUpperCase())) {
        doc.moveDown().fontSize(14).text(line, { underline: true });
        return;
      }

      const isJob = JOB_REGEX.test(line);
      doc.fontSize(11).font(isJob ? "Helvetica-Bold" : "Helvetica").text(line);
    });

    doc.end();
  }
});