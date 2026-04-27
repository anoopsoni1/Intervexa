/**
 * Fetch user's saved details from the backend.
 * Single source of truth: GET /get-detail (Detail model).
 * Both AddDetails (manual) and EditResumePage (upload → edit/AI → save) write via POST /save-user-data (upsert).
 * Returns data in the same shape as parseResume() for use in ResumeView, Portfolio, PortfolioDesignView.
 */

import { API_BASE } from "../config";
import { apiJson } from "../services/api";
import { sanitizeProjectsArray } from "./stripMarkdownMarkers.js";
import { RESUME_ACHIEVEMENTS_MAX, limitAchievements } from "./resumeAchievements.js";
import {
  emptyExperienceEntry,
  experienceStringToFormEntry,
  formExperienceToString,
  normalizeExperienceFormItem,
} from "./experienceForm.js";
import {
  emptyProjectEntry,
  formProjectToString,
  normalizeProjectFormItem,
  projectStringToFormEntry,
} from "./projectForm.js";

/** Default Add Details form shape */
const INITIAL_FORM = {
  name: "",
  role: "",
  email: "",
  phone: "",
  summary: "",
  skills: [""],
  experience: [emptyExperienceEntry()],
  projects: [emptyProjectEntry()],
  achievements: [""],
  education: "",
  languageProficiency: "",
  linkedin: "",
  github: "",
  certifications: [""],
};

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => (v != null ? String(v).trim() : "")).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,|;/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (value == null) return [];
  return [String(value).trim()].filter(Boolean);
}

/**
 * Build plain resume text from form shape (used by AddDetails and EditResumePage).
 * Inverse of parseResume for display; same format so parsing back works.
 */
export function buildResumeTextFromForm(form) {
  if (!form) return "";
  const lines = [];
  lines.push((form.name || "").trim() || "Your Name");
  lines.push((form.role || "").trim() || "Your Role");
  lines.push("");
  if (form.summary?.trim()) {
    lines.push("SUMMARY");
    lines.push(form.summary.trim());
    lines.push("");
  }
  if (form.skills?.length) {
    const skillList = form.skills.filter((s) => (s || "").trim()).join("\n");
    if (skillList) {
      lines.push("SKILLS");
      lines.push(skillList);
      lines.push("");
    }
  }
  if (form.experience?.length) {
    lines.push("EXPERIENCE");
    (form.experience || []).forEach((exp) => {
      const e = normalizeExperienceFormItem(exp);
      if (
        !e.jobTitle &&
        !e.company &&
        !e.dates &&
        !e.location &&
        e.arrangement === "onsite" &&
        !e.bullets.some((b) => (b || "").trim())
      ) {
        return;
      }
      const block = formExperienceToString(exp);
      if (block) {
        block.split("\n").forEach((line) => lines.push(line));
        lines.push("");
      }
    });
  }
  if (form.projects?.length) {
    const blocks = (form.projects || [])
      .map(normalizeProjectFormItem)
      .filter((p) => p.title || p.link || p.description)
      .map(formProjectToString)
      .filter(Boolean);
    if (blocks.length) {
      lines.push("PROJECTS");
      blocks.forEach((block) => {
        block.split("\n").forEach((line) => lines.push(line));
        lines.push("");
      });
    }
  }
  const achievementLines = limitAchievements(form.achievements);
  if (achievementLines.length) {
    lines.push("ACHIEVEMENTS");
    achievementLines.forEach((a) => lines.push(a));
    lines.push("");
  }
  if (form.education?.trim()) {
    lines.push("EDUCATION");
    lines.push(form.education.trim());
    lines.push("");
  }
  if (form.languageProficiency?.trim()) {
    lines.push("LANGUAGE PROFICIENCY");
    lines.push(form.languageProficiency.trim());
  }
  const certLines = (form.certifications || []).map((c) => (c || "").trim()).filter(Boolean);
  if (certLines.length) {
    lines.push("");
    lines.push("CERTIFICATIONS");
    certLines.forEach((c) => lines.push(c));
  }
  const text = lines.join("\n");
  const contactParts = [
    form.email?.trim(),
    form.phone?.trim(),
    form.linkedin?.trim(),
    form.github?.trim(),
  ].filter(Boolean);
  const contact = contactParts.join(" | ");
  if (contact) return text + (text ? "\n\n" : "") + contact;
  return text;
}

/**
 * Build plain resume text from API detail (get-detail response).
 */
export function buildResumeTextFromDetail(d) {
  if (!d) return "";
  return buildResumeTextFromForm(detailLikeToForm(d));
}

/**
 * Convert a detail-like object (parsed resume or API detail) to Add Details form shape.
 * Use after upload to map extracted/parsed resume into form shape.
 */
export function detailLikeToForm(d) {
  if (!d) return { ...INITIAL_FORM };
  const experience =
    d.experience && d.experience.length > 0
      ? d.experience.map((item) =>
          typeof item === "string"
            ? experienceStringToFormEntry(item)
            : normalizeExperienceFormItem(item)
        )
      : [emptyExperienceEntry()];
  const skills = Array.isArray(d.skills) && d.skills.length > 0 ? d.skills : [""];
  const projects =
    Array.isArray(d.projects) && d.projects.length > 0
      ? sanitizeProjectsArray(
          d.projects.map((item) =>
            typeof item === "string" ? projectStringToFormEntry(item) : normalizeProjectFormItem(item)
          )
        )
      : [emptyProjectEntry()];
  const achievements =
    Array.isArray(d.achievements) && d.achievements.length > 0
      ? d.achievements.slice(0, RESUME_ACHIEVEMENTS_MAX)
      : [""];
  return {
    name: d.name || "",
    role: d.role || "",
    email: d.email || "",
    phone: d.phone || "",
    summary: d.summary || "",
    skills,
    experience,
    projects,
    achievements,
    education: d.education || "",
    languageProficiency: d.languageProficiency || "",
    linkedin: d.linkedin || "",
    github: d.github || "",
    certifications:
      Array.isArray(d.certifications) && d.certifications.length > 0 ? d.certifications : [""],
  };
}

/**
 * Convert parseResume() output to payload for POST /save-user-data.
 */
export function parsedToDetailPayload(parsed) {
  if (!parsed) return null;
  const experience = Array.isArray(parsed.experience) && parsed.experience.length > 0
    ? parsed.experience.map((e) => (e != null ? String(e).trim() : "")).filter(Boolean)
    : [""];
  const skills = Array.isArray(parsed.skills) && parsed.skills.length > 0
    ? parsed.skills.map((s) => (s || "").trim()).filter(Boolean)
    : [""];
  const projects = Array.isArray(parsed.projects) && parsed.projects.length > 0
    ? sanitizeProjectsArray(parsed.projects.map((p) => (p || "").trim()).filter(Boolean))
    : [""];
  const achievements = limitAchievements(parsed.achievements);
  return {
    name: (parsed.name || "").trim() || "Your Name",
    role: (parsed.role || "").trim() || "Your Role",
    summary: (parsed.summary || "").trim() || "",
    skills,
    experience,
    projects,
    achievements,
    education: (parsed.education || "").trim() || "",
    languageProficiency: (parsed.languageProficiency || "").trim() || "",
    email: (parsed.email || "").trim() || "",
    phone: (parsed.phone || "").trim() || "",
    website: "",
    linkedin: (parsed.linkedin || "").trim() || "",
    github: (parsed.github || "").trim() || "",
    certifications: [],
  };
}

/**
 * @returns {Promise<{ name, role, summary, skills, experience, projects, education, languageProficiency, email, phone } | null>}
 */
export async function fetchDetailForResume() {
  try {
    const { res, data: json } = await apiJson("/api/v1/user/get-detail", {
      method: "GET",
    });
    if (!res.ok || !json?.data) return null;

    const d = json.data;
    const nameStr = d.name != null ? String(d.name).trim() : "";
    const roleStr = d.role != null ? String(d.role).trim() : "";
    return {
      name: nameStr || "Your Name",
      role: roleStr || "Your Role",
      summary: d.summary || "",
      skills: Array.isArray(d.skills) ? d.skills : [],
      experience: Array.isArray(d.experience) ? d.experience : [],
      projects: sanitizeProjectsArray(Array.isArray(d.projects) ? d.projects : []),
      achievements: limitAchievements(d.achievements),
      education: d.education || "",
      languageProficiency: d.languageProficiency || "",
      email: d.email || "",
      phone: d.phone || "",
      location: d.location != null ? String(d.location).trim() : "",
      linkedin: d.linkedin != null ? String(d.linkedin).trim() : "",
      github: d.github != null ? String(d.github).trim() : "",
      passions: d.passions != null ? String(d.passions).trim() : "",
      certifications: normalizeStringList(d.certifications),
      publications: d.publications,
      volunteering: d.volunteering,
    };
  } catch (_) {
    return null;
  }
}

/**
 * Get resume/portfolio content from the single source of truth: Detail API.
 * Both AddDetails (manual) and EditResumePage (upload → edit → save) write to the same Detail API.
 */
export async function getResumeContentForView() {
  return fetchDetailForResume();
}
