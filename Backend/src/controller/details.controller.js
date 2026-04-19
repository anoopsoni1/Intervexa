import { Detail } from "../models/Detail.model.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";

/**
 * Normalize request body to a Detail document payload (resume / profile fields).
 */
function detailPayloadFromBody(body) {
  const {
    name,
    role,
    summary,
    skills,
    experience,
    projects,
    achievements,
    education,
    languageProficiency,
    email,
    phone,
    website,
    linkedin,
    github,
    certifications,
    resumeParseRate,
    resumeExtractionMethod,
  } = body;
  const payload = {
    name: name != null && String(name).trim() ? String(name).trim() : "Your Name",
    role: role != null && String(role).trim() ? String(role).trim() : "Your Role",
    summary: summary != null ? String(summary).trim() : "",
    skills: Array.isArray(skills) ? skills.map((s) => String(s).trim()).filter(Boolean) : [],
    experience: Array.isArray(experience)
      ? experience.map((e) => (e != null ? String(e).trim() : ""))
      : [],
    projects: Array.isArray(projects) ? projects.map((p) => (p != null ? String(p).trim() : "")) : [],
    achievements: Array.isArray(achievements)
      ? achievements.map((a) => (a != null ? String(a).trim() : "")).filter(Boolean)
      : [],
    education: education != null ? String(education).trim() : "",
    languageProficiency: languageProficiency != null ? String(languageProficiency).trim() : "",
    email: email != null ? String(email).trim() : "",
    phone: phone != null ? String(phone).trim() : "",
    website: website != null ? String(website).trim() : "",
    linkedin: linkedin != null ? String(linkedin).trim() : "",
    github: github != null ? String(github).trim() : "",
    certifications: Array.isArray(certifications)
      ? certifications.map((c) => String(c).trim()).filter(Boolean)
      : [],
  };
  if (resumeParseRate != null && resumeParseRate !== "") {
    const n = Number(resumeParseRate);
    if (!Number.isNaN(n)) {
      payload.resumeParseRate = Math.min(100, Math.max(0, n));
    }
  }
  if (resumeExtractionMethod != null && String(resumeExtractionMethod).trim()) {
    payload.resumeExtractionMethod = String(resumeExtractionMethod).trim();
  }
  return payload;
}

/**
 * Save or replace the authenticated user's resume/profile detail (one document per user).
 * Use POST /save-user-data or POST /create-detail — same behavior.
 */
const saveUserData = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const payload = detailPayloadFromBody(req.body);
  const detail = await Detail.findOneAndUpdate(
    { userId },
    { ...payload, userId },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(200).json(new ApiResponse(200, detail, "User data saved successfully"));
});

/** Legacy route name; same implementation as saveUserData */
const createDetail = saveUserData;

const getDetail = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const detail = await Detail.findOne({ userId });
  if (!detail) return res.status(404).json({ message: "Detail not found" });
  return res.status(200).json(new ApiResponse(200, detail, "Detail fetched successfully"));
});

const updateDetail = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const detail = await Detail.findOne({ _id: id, userId });
  if (!detail) return res.status(404).json({ message: "Detail not found" });

  const {
    name,
    role,
    summary,
    skills,
    experience,
    projects,
    achievements,
    education,
    languageProficiency,
    email,
    phone,
    website,
    linkedin,
    github,
    certifications,
  } = req.body;

  const payload = {
    name: name != null && String(name).trim() ? String(name).trim() : "Your Name",
    role: role != null && String(role).trim() ? String(role).trim() : "Your Role",
    summary: summary != null ? String(summary).trim() : "",
    skills: Array.isArray(skills) ? skills.map((s) => String(s).trim()).filter(Boolean) : [],
    experience: Array.isArray(experience)
      ? experience.map((e) => (e != null ? String(e).trim() : ""))
      : [],
    projects: Array.isArray(projects) ? projects.map((p) => (p != null ? String(p).trim() : "")) : [],
    achievements: Array.isArray(achievements)
      ? achievements.map((a) => (a != null ? String(a).trim() : "")).filter(Boolean)
      : [],
    education: education != null ? String(education).trim() : "",
    languageProficiency: languageProficiency != null ? String(languageProficiency).trim() : "",
    email: email != null ? String(email).trim() : "",
    phone: phone != null ? String(phone).trim() : "",
  };
  if ("website" in req.body) {
    payload.website = website != null ? String(website).trim() : "";
  } else {
    payload.website = detail.website ?? "";
  }
  if ("linkedin" in req.body) {
    payload.linkedin = linkedin != null ? String(linkedin).trim() : "";
  } else {
    payload.linkedin = detail.linkedin ?? "";
  }
  if ("github" in req.body) {
    payload.github = github != null ? String(github).trim() : "";
  } else {
    payload.github = detail.github ?? "";
  }
  if ("certifications" in req.body) {
    payload.certifications = Array.isArray(certifications)
      ? certifications.map((c) => String(c).trim()).filter(Boolean)
      : [];
  } else {
    payload.certifications = Array.isArray(detail.certifications) ? detail.certifications : [];
  }

  const updatedDetail = await Detail.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return res.status(200).json(new ApiResponse(200, updatedDetail, "Detail updated successfully"));
});

const deleteDetail = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const detail = await Detail.findOne({ _id: id, userId });
  if (!detail) return res.status(404).json({ message: "Detail not found" });
  await Detail.findByIdAndDelete(id);
  return res.status(200).json(new ApiResponse(200, null, "Detail deleted successfully"));
});

export { createDetail, saveUserData, getDetail, updateDetail, deleteDetail };
