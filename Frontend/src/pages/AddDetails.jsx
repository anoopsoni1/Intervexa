import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Globe,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Award,
  Eye,
  LayoutGrid,
} from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { API_BASE } from "../config";
import { sanitizeProjectsArray } from "../utils/stripMarkdownMarkers.js";
import { RESUME_ACHIEVEMENTS_MAX, limitAchievements } from "../utils/resumeAchievements";
import {
  emptyExperienceEntry,
  experienceStringToFormEntry,
  formExperienceToString,
  normalizeExperienceFormItem,
} from "../utils/experienceForm.js";
import {
  emptyProjectEntry,
  formProjectToString,
  normalizeProjectFormItem,
  projectStringToFormEntry,
} from "../utils/projectForm.js";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import AddDetailsSuggestionLists from "../components/forms/AddDetailsSuggestionLists.jsx";
import { SKILLS_ADVANCED, SKILLS_STUDENT } from "../data/formFieldSuggestions.js";
import {
  Resume1Layout,
  Resume2Layout,
  Resume3Layout,
  Resume4Layout,
  Resume5Layout,
  Resume6Layout,
  Resume7Layout,
  Resume8Layout,
  Resume9Layout,
  Resume10Layout,
  Resume11Layout,
  Resume12Layout,
  Resume13Layout,
  Resume14Layout,
  Resume15Layout,
  Resume16Layout,
} from "../layouts/modernResumeLayouts";
import ClassicLayout from "../layouts/ClassicLayout";
import ClassicLayout1 from "../layouts/ClassicLayout1";
import PremiumLayout from "../layouts/PremiumLayout";
import PremiumLayout2 from "../layouts/PremiumLayout2";
import PremiumLayout3 from "../layouts/PremiumLayout3";
import MinimalLayout from "../layouts/MinimalLayout";

const PREVIEW_TEMPLATE_STORAGE_KEY = "adddetails:previewTemplateId";

const PREVIEW_TEMPLATES = [
  { id: "modern-1", label: "Modern · Resume 1", Component: Resume1Layout },
  { id: "modern-2", label: "Modern · Resume 2", Component: Resume2Layout },
  { id: "modern-3", label: "Modern · Resume 3", Component: Resume3Layout },
  { id: "modern-4", label: "Modern · Resume 4", Component: Resume4Layout },
  { id: "modern-5", label: "Modern · Resume 5", Component: Resume5Layout },
  { id: "modern-6", label: "Modern · Resume 6", Component: Resume6Layout },
  { id: "modern-7", label: "Modern · Resume 7", Component: Resume7Layout },
  { id: "modern-8", label: "Modern · Resume 8", Component: Resume8Layout },
  { id: "modern-9", label: "Modern · Resume 9", Component: Resume9Layout },
  { id: "modern-10", label: "Modern · Resume 10", Component: Resume10Layout },
  { id: "modern-11", label: "Modern · Resume 11", Component: Resume11Layout },
  { id: "modern-12", label: "Modern · Resume 12", Component: Resume12Layout },
  { id: "modern-13", label: "Modern · Resume 13", Component: Resume13Layout },
  { id: "modern-14", label: "Modern · Resume 14", Component: Resume14Layout },
  { id: "modern-15", label: "Modern · Resume 15", Component: Resume15Layout },
  { id: "modern-16", label: "Modern · Resume 16", Component: Resume16Layout },
  { id: "classic-1", label: "Classic · 1", Component: ClassicLayout1 },
  { id: "classic-2", label: "Classic · 2", Component: ClassicLayout },
  { id: "minimal-1", label: "Minimal", Component: MinimalLayout },
  { id: "premium-1", label: "Premium · 1", Component: PremiumLayout },
  { id: "premium-2", label: "Premium · 2 (Ivy)", Component: PremiumLayout2 },
  { id: "premium-3", label: "Premium · 3", Component: PremiumLayout3 },
];

const DEFAULT_PREVIEW_TEMPLATE_ID = "modern-3";

function buildResumeText(form) {
  const lines = [];

  lines.push(form.name.trim() || "Your Name");
  lines.push(form.role.trim() || "Your Role");
  lines.push("");

  if (form.summary?.trim()) {
    lines.push("SUMMARY");
    lines.push(form.summary.trim());
    lines.push("");
  }

  if (form.skills?.length) {
    const skillList = form.skills.filter((s) => s?.trim()).join("\n");
    if (skillList) {
      lines.push("SKILLS");
      lines.push(skillList);
      lines.push("");
    }
  }

  if (form.experience?.length) {
    lines.push("EXPERIENCE");
    form.experience.forEach((exp) => {
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

  const certs = (form.certifications || []).map((c) => (c || "").trim()).filter(Boolean);
  if (certs.length) {
    lines.push("");
    lines.push("CERTIFICATIONS");
    certs.forEach((c) => lines.push(c));
  }

  const text = lines.join("\n");
  const contactParts = [
    form.email?.trim(),
    form.phone?.trim(),
    form.linkedin?.trim(),
    form.github?.trim(),
  ].filter(Boolean);
  const contact = contactParts.join(" | ");
  if (contact) {
    return text + (text ? "\n\n" : "") + contact;
  }
  return text;
}

const initialForm = {
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

/** Map backend detail (experience as string[]) to form shape */
function detailToForm(d) {
  if (!d) return initialForm;
  const experience =
    d.experience && d.experience.length > 0
      ? d.experience.map((item) =>
          experienceStringToFormEntry(typeof item === "string" ? item : "")
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

/** Map form to API payload (experience as string[]) */
function formToPayload(form) {
  const experience = (form.experience || [])
    .map(normalizeExperienceFormItem)
    .filter(
      (e) =>
        e.jobTitle ||
        e.company ||
        e.dates ||
        e.location ||
        e.arrangement !== "onsite" ||
        e.bullets.some((b) => (b || "").trim())
    )
    .map(formExperienceToString)
    .filter(Boolean);
  return {
    name: (form.name || "").trim() || "Your Name",
    role: (form.role || "").trim() || "Your Role",
    email: (form.email || "").trim() || "",
    phone: (form.phone || "").trim() || "",
    summary: (form.summary || "").trim() || "",
    skills: (form.skills || []).map((s) => (s || "").trim()).filter(Boolean),
    experience: experience.length ? experience : [""],
    projects: (() => {
      const list = (form.projects || [])
        .map(normalizeProjectFormItem)
        .filter((p) => p.title || p.link || p.description)
        .map(formProjectToString);
      return list.length ? sanitizeProjectsArray(list) : [""];
    })(),
    achievements: limitAchievements(form.achievements),
    education: (form.education || "").trim() || "",
    languageProficiency: (form.languageProficiency || "").trim() || "",
    website: "",
    linkedin: (form.linkedin || "").trim() || "",
    github: (form.github || "").trim() || "",
    certifications: (form.certifications || []).map((c) => (c || "").trim()).filter(Boolean),
  };
}

export default function AddDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.userData);
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [previewTemplateId, setPreviewTemplateId] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_PREVIEW_TEMPLATE_ID;
    try {
      const saved = window.localStorage.getItem(PREVIEW_TEMPLATE_STORAGE_KEY);
      if (saved && PREVIEW_TEMPLATES.some((t) => t.id === saved)) return saved;
    } catch (_) {
      /* ignore */
    }
    return DEFAULT_PREVIEW_TEMPLATE_ID;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PREVIEW_TEMPLATE_STORAGE_KEY, previewTemplateId);
    } catch (_) {
      /* ignore */
    }
  }, [previewTemplateId]);

  const previewData = useMemo(() => formToPayload(form), [form]);
  const ActiveTemplate = useMemo(() => {
    const match = PREVIEW_TEMPLATES.find((t) => t.id === previewTemplateId);
    return (match || PREVIEW_TEMPLATES[0]).Component;
  }, [previewTemplateId]);

  const languageItems = useMemo(() => {
    const raw = String(form.languageProficiency || "");
    const parts = raw
      .split(/[,;|\n]/)
      .map((s) => s.trim());
    if (raw.trim() === "") return [""];
    return parts.length ? parts : [""];
  }, [form.languageProficiency]);

  const commitLanguages = (items) => {
    const next = (items || []).map((s) => String(s || "").trim()).join(", ");
    setForm((prev) => ({ ...prev, languageProficiency: next }));
  };

  const setLanguageAt = (i, value) => {
    const next = [...languageItems];
    next[i] = value;
    commitLanguages(next);
  };

  const addLanguageRow = () => {
    commitLanguages([...languageItems, ""]);
  };

  const removeLanguageRow = (i) => {
    if (languageItems.length <= 1) {
      commitLanguages([""]);
      return;
    }
    const next = languageItems.filter((_, idx) => idx !== i);
    commitLanguages(next.length ? next : [""]);
  };

  const educationItems = useMemo(() => {
    const raw = String(form.education || "");
    const blocks = raw
      .split(/\n\s*\n/)
      .map((b) => b.trim());
    if (raw.trim() === "") return [""];
    return blocks.length ? blocks : [""];
  }, [form.education]);

  const commitEducation = (items) => {
    const blocks = (items || []).map((s) => String(s || "").trim());
    setForm((prev) => ({ ...prev, education: blocks.join("\n\n") }));
  };

  const setEducationAt = (i, value) => {
    const next = [...educationItems];
    next[i] = value;
    commitEducation(next);
  };

  const addEducationRow = () => {
    commitEducation([...educationItems, ""]);
  };

  const removeEducationRow = (i) => {
    if (educationItems.length <= 1) {
      commitEducation([""]);
      return;
    }
    const next = educationItems.filter((_, idx) => idx !== i);
    commitEducation(next.length ? next : [""]);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/get-detail`, {
          credentials: "include",
          headers: {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data) {
          setForm(detailToForm(json.data));
        }
      } catch (_) {
        /* keep initial form */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addSkill = () => setForm((prev) => ({ ...prev, skills: [...(prev.skills || [""]), ""] }));
  const setSkill = (i, v) =>
    setForm((prev) => {
      const s = [...(prev.skills || [""])];
      s[i] = v;
      return { ...prev, skills: s };
    });
  const removeSkill = (i) =>
    setForm((prev) => ({
      ...prev,
      skills: (prev.skills || [""]).filter((_, idx) => idx !== i),
    }));

  const applySkillSuggestion = (value) => {
    const v = String(value || "").trim();
    if (!v) return;
    setForm((prev) => {
      const skills = [...(prev.skills || [""])];
      const lastIdx = skills.length - 1;
      if (lastIdx >= 0 && !String(skills[lastIdx] || "").trim()) {
        skills[lastIdx] = v;
        return { ...prev, skills };
      }
      return { ...prev, skills: [...skills, v] };
    });
  };

  const addExperience = () =>
    setForm((prev) => ({
      ...prev,
      experience: [...(prev.experience || []), emptyExperienceEntry()],
    }));
  const setExperience = (i, field, value) =>
    setForm((prev) => {
      const ex = [...(prev.experience || [])];
      const cur = { ...ex[i], [field]: value };
      if (field === "jobTitle") delete cur.role;
      ex[i] = cur;
      return { ...prev, experience: ex };
    });
  const setExperienceBullet = (ei, bi, value) =>
    setForm((prev) => {
      const ex = [...(prev.experience || [])];
      const bullets = [...(ex[ei]?.bullets || [""])];
      bullets[bi] = value;
      ex[ei] = { ...ex[ei], bullets };
      return { ...prev, experience: ex };
    });
  const addExperienceBullet = (ei) =>
    setForm((prev) => {
      const ex = [...(prev.experience || [])];
      ex[ei] = { ...ex[ei], bullets: [...(ex[ei]?.bullets || [""]), ""] };
      return { ...prev, experience: ex };
    });
  const removeExperience = (i) =>
    setForm((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, idx) => idx !== i),
    }));

  const addProject = () =>
    setForm((prev) => ({ ...prev, projects: [...(prev.projects || [emptyProjectEntry()]), emptyProjectEntry()] }));
  const setProjectField = (i, field, value) =>
    setForm((prev) => {
      const list = [...(prev.projects || [emptyProjectEntry()])];
      const cur = normalizeProjectFormItem(list[i]);
      list[i] = { ...cur, [field]: value };
      return { ...prev, projects: list };
    });
  const removeProject = (i) =>
    setForm((prev) => ({
      ...prev,
      projects: (prev.projects || [emptyProjectEntry()]).filter((_, idx) => idx !== i),
    }));

  const addAchievement = () =>
    setForm((prev) => {
      const cur = prev.achievements || [""];
      if (cur.length >= RESUME_ACHIEVEMENTS_MAX) return prev;
      return { ...prev, achievements: [...cur, ""] };
    });
  const setAchievement = (i, v) =>
    setForm((prev) => {
      const a = [...(prev.achievements || [""])];
      a[i] = v;
      return { ...prev, achievements: a };
    });
  const removeAchievement = (i) =>
    setForm((prev) => ({
      ...prev,
      achievements: (prev.achievements || [""]).filter((_, idx) => idx !== i),
    }));

  const addCertification = () =>
    setForm((prev) => ({ ...prev, certifications: [...(prev.certifications || [""]), ""] }));
  const setCertification = (i, v) =>
    setForm((prev) => {
      const c = [...(prev.certifications || [""])];
      c[i] = v;
      return { ...prev, certifications: c };
    });
  const removeCertification = (i) =>
    setForm((prev) => ({
      ...prev,
      certifications: (prev.certifications || [""]).filter((_, idx) => idx !== i),
    }));

  const handleSave = async () => {
    setApiError(null);

    setSaveLoading(true);
    try {
      const payload = formToPayload(form);
      const res = await fetch(`${API_BASE}/save-user-data`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.data) {
        setApiError(null);
        setSaved(true);
        return true;
      }
      setSaved(false);
      setApiError(json?.message || "Failed to save to server");
      return false;
    } catch (_) {
      setSaved(false);
      setApiError("Failed to save to server");
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    const ok = await handleSave();
    if (ok) navigate("/templates");
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col">
        <AppHeader />
        <main className="flex-1 py-8 px-4 sm:px-6 mx-auto w-full max-w-4xl">
          <div className="space-y-4 mb-8">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex flex-col">
      <AppHeader />

        <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6  mx-auto w-full max-w-[1600px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium"
            >
              <ArrowLeft size={18} /> Back
            </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Add details for resume or project
                  </h1>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-500/15 border border-indigo-400/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                    Step 1
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Your templates will update automatically as you fill this in.
                </p>
              </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {saveLoading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={saveLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {saveLoading ? "Saving…" : "Save & choose template →"}
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Details saved. Use "Save & choose template" to build your resume or project.
          </div>
        )}
        {apiError && (
          <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {apiError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[calc(100vh-13rem)] lg:items-stretch">
          <div className="w-full lg:w-1/2 min-w-0 lg:h-full lg:overflow-y-auto lg:pr-3 space-y-8 add-details-scroll">
          {/* Personal */}
          <section id="personal" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <User size={20} className="text-indigo-400" />
              Personal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Full name
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Role / Title
                </span>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  placeholder="e.g. Web Developer · CS student"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Phone
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  LinkedIn
                </span>
                <input
                  type="text"
                  value={form.linkedin}
                  onChange={(e) => update("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/yourprofile"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  GitHub
                </span>
                <input
                  type="text"
                  value={form.github}
                  onChange={(e) => update("github", e.target.value)}
                  placeholder="github.com/yourusername"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
            </div>
          </section>

          {/* Summary */}
          <section id="summary" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <FileText size={20} className="text-indigo-400" />
              Summary
            </h2>
            <label className="block">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Short professional summary
              </span>
              <textarea
                value={form.summary}
                onChange={(e) => update("summary", e.target.value)}
                placeholder="What you’re studying or building, what you enjoy, and what role you’re aiming for — keep it simple."
                rows={4}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[100px]"
              />
            </label>
          </section>

          {/* Skills */}
          <section id="skills" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Briefcase size={20} className="text-indigo-400" />
                Skills
              </h2>
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={16} /> Add skill
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Start with skills you can learn in courses or tutorials. Optional advanced tools are in the same suggestion
              list and in the expandable section below.
            </p>
            <div className="mb-4 space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Quick add — fundamentals</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS_STUDENT.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => applySkillSuggestion(label)}
                    className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <details className="group rounded-xl border border-white/10 bg-black/20 p-3">
                <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-300">
                  Advanced tools (optional)
                </summary>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SKILLS_ADVANCED.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => applySkillSuggestion(label)}
                      className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-200 hover:border-indigo-400/50 hover:bg-indigo-500/20"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </details>
            </div>
            <div className="space-y-3">
              {(form.skills || [""]).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={s}
                    onChange={(e) => setSkill(i, e.target.value)}
                    list="adddetails-skills-suggestions"
                    placeholder="e.g. HTML, Git — or pick from suggestions"
                    className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {(form.skills?.length > 1) && (
                    <button
                      type="button"
                      onClick={() => removeSkill(i)}
                      className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/50"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section id="experience" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Briefcase size={20} className="text-indigo-400" />
                Experience
              </h2>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={16} /> Add experience
              </button>
            </div>
            <div className="space-y-6">
              {(form.experience || []).map((exp, ei) => (
                <div
                  key={ei}
                  className="rounded-xl border border-white/5 bg-black/30 p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block sm:col-span-2">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Job title
                          </span>
                          <input
                            type="text"
                            value={exp.jobTitle || exp.role || ""}
                            onChange={(e) => setExperience(ei, "jobTitle", e.target.value)}
                            placeholder="e.g. Software Developer Intern"
                            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Company
                          </span>
                          <input
                            type="text"
                            value={exp.company || ""}
                            onChange={(e) => setExperience(ei, "company", e.target.value)}
                            placeholder="e.g. Acme Inc."
                            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Dates
                          </span>
                          <input
                            type="text"
                            value={exp.dates || ""}
                            onChange={(e) => setExperience(ei, "dates", e.target.value)}
                            placeholder="e.g. Jan 2020 – Present"
                            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Location
                          </span>
                          <input
                            type="text"
                            value={exp.location || ""}
                            onChange={(e) => setExperience(ei, "location", e.target.value)}
                            placeholder="e.g. San Francisco, CA (optional)"
                            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Work arrangement
                          </span>
                          <select
                            value={exp.arrangement || "onsite"}
                            onChange={(e) => setExperience(ei, "arrangement", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="onsite">On-site</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </label>
                      </div>
                      {(form.experience?.length > 1) && (
                        <button
                          type="button"
                          onClick={() => removeExperience(ei)}
                          className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 shrink-0"
                          aria-label="Remove"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Dates and location are saved so resume templates can show them in one line (with Remote/Hybrid
                      when selected).
                    </p>
                  </div>
                  <div className="space-y-2 pl-0 sm:pl-2">
                    {(exp.bullets || [""]).map((b, bi) => (
                      <div key={bi} className="flex gap-2">
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => setExperienceBullet(ei, bi, e.target.value)}
                          list="adddetails-exp-bullet-suggestions"
                          placeholder="What you did — start simple, or choose a suggestion"
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {(exp.bullets?.length > 1) && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => {
                                const ex = [...(prev.experience || [])];
                                ex[ei] = {
                                  ...ex[ei],
                                  bullets: (ex[ei]?.bullets || []).filter((_, i) => i !== bi),
                                };
                                return { ...prev, experience: ex };
                              })
                            }
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 shrink-0"
                            aria-label="Remove bullet"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExperienceBullet(ei)}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      + Add bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section id="projects" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Globe size={20} className="text-indigo-400" />
                Projects
              </h2>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={16} /> Add project
              </button>
            </div>
            <div className="space-y-3">
              {(form.projects || [emptyProjectEntry()]).map((raw, i) => {
                const p = normalizeProjectFormItem(raw);
                return (
                  <div key={i} className="flex gap-2">
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => setProjectField(i, "title", e.target.value)}
                        list="adddetails-project-title-suggestions"
                        placeholder="e.g. Portfolio site — or pick a suggestion"
                        className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="url"
                        value={p.link}
                        onChange={(e) => setProjectField(i, "link", e.target.value)}
                        placeholder="Project link (optional)"
                        className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <textarea
                        value={p.description}
                        onChange={(e) => setProjectField(i, "description", e.target.value)}
                        placeholder="Description (optional)..."
                        rows={2}
                        className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[60px]"
                      />
                    </div>
                    {(form.projects?.length > 1) && (
                      <button
                        type="button"
                        onClick={() => removeProject(i)}
                        className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 shrink-0 self-start"
                        aria-label="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Achievements */}
          <section id="achievements" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                  <Award size={20} className="text-indigo-400" />
                  Achievements
                </h2>
                <p className="mt-1 text-xs text-zinc-500">Up to {RESUME_ACHIEVEMENTS_MAX} items (used on all resume templates).</p>
              </div>
              <button
                type="button"
                onClick={addAchievement}
                disabled={(form.achievements || [""]).length >= RESUME_ACHIEVEMENTS_MAX}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-indigo-400"
              >
                <Plus size={16} /> Add achievement
              </button>
            </div>
            <div className="space-y-3">
              {(form.achievements || [""]).map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={a}
                    onChange={(e) => setAchievement(i, e.target.value)}
                    list="adddetails-achievement-suggestions"
                    placeholder="e.g. Dean's List — or choose a suggestion"
                    className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {(form.achievements?.length > 1) && (
                    <button
                      type="button"
                      onClick={() => removeAchievement(i)}
                      className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/50"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Award size={20} className="text-indigo-400" />
                Certifications
              </h2>
              <button
                type="button"
                onClick={addCertification}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={16} /> Add certification
              </button>
            </div>
            <div className="space-y-3">
              {(form.certifications || [""]).map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => setCertification(i, e.target.value)}
                    list="adddetails-cert-suggestions"
                    placeholder="e.g. freeCodeCamp certificate — advanced certs in suggestions too"
                    className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {(form.certifications?.length > 1) && (
                    <button
                      type="button"
                      onClick={() => removeCertification(i)}
                      className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/50"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Education & Languages */}
          <section id="education" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <GraduationCap size={20} className="text-indigo-400" />
              Education & languages
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Education
                </span>
                <div className="mt-1 space-y-3">
                  {educationItems.map((ed, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <textarea
                        value={ed}
                        onChange={(e) => setEducationAt(idx, e.target.value)}
                        placeholder="Degree&#10;Institution&#10;Year (use new lines)"
                        rows={3}
                        className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[80px]"
                      />
                      {(educationItems.length > 1) && (
                        <button
                          type="button"
                          onClick={() => removeEducationRow(idx)}
                          className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 shrink-0 mt-1"
                          aria-label="Remove education"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addEducationRow}
                    className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus size={14} /> Add education
                  </button>
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Language proficiency
                </span>
                <div className="mt-1 space-y-3">
                  {languageItems.map((lang, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={lang}
                        onChange={(e) => setLanguageAt(idx, e.target.value)}
                        placeholder="e.g. English (Fluent)"
                        className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {(languageItems.length > 1) && (
                        <button
                          type="button"
                          onClick={() => removeLanguageRow(idx)}
                          className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 shrink-0"
                          aria-label="Remove language"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addLanguageRow}
                    className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus size={14} /> Add language
                  </button>
                </div>
              </label>
            </div>
          </section>
          </div>

          <aside className="w-full lg:w-1/2 shrink-0 min-w-0 lg:h-full lg:overflow-y-auto lg:pr-1 space-y-4 add-details-scroll">
            {/* Live preview pane */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-white/10 bg-black/30 sticky top-0 z-10 backdrop-blur-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <Eye size={16} className="text-indigo-400 shrink-0" />
                    <span className="text-sm font-semibold text-white truncate">
                      Live preview
                    </span>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-500/15 border border-indigo-400/20 px-2 py-0.5 text-[10px] font-medium text-indigo-200">
                      Updates as you type
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <LayoutGrid size={14} className="text-slate-400" />
                    <span className="sr-only sm:not-sr-only">Template</span>
                    <select
                      value={previewTemplateId}
                      onChange={(e) => setPreviewTemplateId(e.target.value)}
                      className="rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {PREVIEW_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="bg-zinc-100 p-3 sm:p-4">
                  <div
                    className="origin-top mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden text-black ring-1 ring-black/5"
                    style={{ width: "100%" }}
                  >
                    <ActiveTemplate data={previewData} />
                  </div>
                </div>
              </div>

          </aside>
        </div>

        <AddDetailsSuggestionLists />

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Save size={18} /> Save details
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Save & choose template →
          </button>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
