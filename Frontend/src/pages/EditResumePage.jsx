import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Sparkles, Save, Loader2, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { clearUser, setUser } from "../slices/user.slice";
import { setEditedResumeText } from "../slices/Resume.slice";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { buildResumeTextFromDetail, parsedToDetailPayload } from "../utils/detailApi.js";
import { sanitizeProjectsArray } from "../utils/stripMarkdownMarkers.js";
import { parseResume } from "../utils/parseResume.js";
import { limitAchievements } from "../utils/resumeAchievements.js";

import { API_BASE, JOB_API_BASE } from "../config";

function Topbar() {
  return <AppHeader />;
}

export default function EditResumePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [text, setText] = useState("");
  const [optimizedDetail, setOptimizedDetail] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const resumeTextFromRedux = useSelector((state) => state.resume?.resumeText || "");

  const token = () => localStorage.getItem("accessToken");

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      setAuthChecking(true);
      try {
        const accessToken = token();
        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            dispatch(clearUser());
            if (!cancelled) navigate("/login");
          }
          return;
        }
        const currentUser = data?.user || data?.data?.user;
        if (currentUser) dispatch(setUser(currentUser));
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (authChecking) return;
    let cancelled = false;

    async function loadInitialText() {
      const fromState = location.state?.extractedText;
      if (typeof fromState === "string" && fromState.trim()) {
        if (!cancelled) setText(fromState.trim());
        if (!cancelled) setInitialLoadDone(true);
        return;
      }
      const accessToken = token();
      if (!accessToken) {
        if (!cancelled) setText(resumeTextFromRedux);
        if (!cancelled) setInitialLoadDone(true);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/get-detail`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data) {
          const detail = json.data;
          const built = buildResumeTextFromDetail(detail);
          if (built.trim()) {
            if (!cancelled) setText(built);
          } else if (!cancelled) {
            setText(resumeTextFromRedux);
          }
        } else {
          const fallbackRes = await fetch(`${API_BASE}/get-edited-resume`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const fallback = await fallbackRes.json().catch(() => ({}));
          if (fallbackRes.ok && typeof fallback?.data?.text === "string" && fallback.data.text.trim()) {
            if (!cancelled) setText(fallback.data.text);
          } else if (!cancelled) {
            setText(resumeTextFromRedux);
          }
        }
      } catch (_) {
        if (!cancelled) setText(resumeTextFromRedux);
      }
      if (!cancelled) setInitialLoadDone(true);
    }

    loadInitialText();
    return () => { cancelled = true; };
  }, [authChecking, location.state?.extractedText, resumeTextFromRedux]);

  const handleAiImprove = async () => {
    const toImprove = text.trim() || resumeTextFromRedux.trim();
    if (!toImprove) {
      setError("Add or paste resume text first.");
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/aiedit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        },
        body: JSON.stringify({ resumeText: toImprove }),
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (!res.ok && res.status !== 202) throw new Error(data?.message || "AI edit failed");
      // 202 = job queued (poll for result). 200 = result returned directly (no Redis queue).

      const responseData = data?.data || {};
      let optimized = responseData.optimizedDetail || null;
      let edited = responseData.editedText || (optimized ? buildResumeTextFromDetail(optimized) : "");

      if (res.status === 202 && responseData.jobId) {
        const jobId = responseData.jobId;
        const maxAttempts = 60;
        const intervalMs = 2000;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((r) => setTimeout(r, intervalMs));
          const jobRes = await fetch(`${JOB_API_BASE}/${jobId}`, {
            credentials: "include",
            headers: token() ? { Authorization: `Bearer ${token()}` } : {},
          });
          const jobJson = await jobRes.json().catch(() => ({}));
          const jobData = jobJson?.data || {};
          if (jobData.status === "completed" && jobData.result?.data) {
            const resultData = jobData.result.data || {};
            optimized = resultData.optimizedDetail || null;
            edited = resultData.editedText || (optimized ? buildResumeTextFromDetail(optimized) : "") || "";
            break;
          }
          if (jobData.status === "completed") {
            const resultMessage = jobData?.result?.message;
            const fallbackMessage = jobJson?.message || "AI improvement failed";
            throw new Error(resultMessage || fallbackMessage);
          }
          if (jobData.status === "failed") {
            throw new Error(jobData.error || "AI improvement failed");
          }
        }
        if (!edited && !optimized) {
          setError("Improvement is taking longer than expected. Your text was not changed. Try again or save your current text.");
          return;
        }
      }

      if (edited.trim() || optimized) {
        const optimizedClean =
          optimized && Array.isArray(optimized.projects)
            ? { ...optimized, projects: sanitizeProjectsArray(optimized.projects) }
            : optimized;
        setOptimizedDetail(optimizedClean);
        setText(edited.trim() || buildResumeTextFromDetail(optimizedClean));
        const finalText = edited.trim() || buildResumeTextFromDetail(optimizedClean);
        dispatch(setEditedResumeText({ ...data, data: { optimizedDetail: optimizedClean, editedText: finalText } }));
        if (token()) {
          fetch(`${API_BASE}/increment-optimize`, {
            method: "POST",
            credentials: "include",
            headers: { Authorization: `Bearer ${token()}` },
          }).catch(() => {});
        }
      }
    } catch (err) {
      setError(err?.message || "AI improvement failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    const toSave = text.trim();
    if (!toSave && !optimizedDetail) {
      setError("Nothing to save. Add or paste resume text, or run Improve with AI first.");
      return;
    }
    if (!token()) {
      setError("Sign in to save to your account.");
      return;
    }
    setSaveLoading(true);
    setError("");
    setSaveSuccess(false);
    try {
      let payload = null;
      if (optimizedDetail) {
        payload = {
          name: optimizedDetail.name ?? "Your Name",
          role: optimizedDetail.role ?? "Your Role",
          summary: optimizedDetail.summary ?? "",
          skills: Array.isArray(optimizedDetail.skills) ? optimizedDetail.skills : [],
          experience: Array.isArray(optimizedDetail.experience) ? optimizedDetail.experience : [],
          projects: Array.isArray(optimizedDetail.projects)
            ? sanitizeProjectsArray(optimizedDetail.projects)
            : [],
          achievements: limitAchievements(optimizedDetail.achievements),
          education: optimizedDetail.education ?? "",
          languageProficiency: optimizedDetail.languageProficiency ?? "",
          email: optimizedDetail.email ?? "",
          phone: optimizedDetail.phone ?? "",
        };
      } else {
        const parsed = parseResume(toSave);
        payload = parsedToDetailPayload(parsed);
      }
      if (!payload) {
        setError("Could not parse resume text.");
        setSaveLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE}/save-user-data`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(data?.message || "Save failed");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err?.message || "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-zinc-400">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-9xl">
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-indigo-400/25 bg-indigo-500/10 p-4 text-sm text-indigo-100">
              <p className="font-semibold">1. Edit your text</p>
              <p className="mt-1 text-xs text-indigo-200/80">Update resume content before optimization.</p>
            </div>
            <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-4 text-sm text-violet-100">
              <p className="font-semibold">2. Improve with AI</p>
              <p className="mt-1 text-xs text-violet-200/80">Make bullets stronger and ATS-friendly.</p>
            </div>
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <p className="font-semibold">3. Save & design</p>
              <p className="mt-1 text-xs text-emerald-200/80">Store changes, then choose templates.</p>
            </div>
          </div>

            <header className="mb-6 text-center">
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-400/20 px-4 py-2 text-indigo-300 text-sm font-medium">
                  <FileText className="h-4 w-4" /> Upload flow
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Edit your resume
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
                Edit the extracted text below, improve it with AI, and save. This text will be used for your resume and project.
              </p>
            </header>

            <div className="rounded-2xl border border-white/15 bg-zinc-900/80 backdrop-blur-sm p-4 sm:p-6 shadow-2xl shadow-black/25">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label className="block font-medium text-zinc-300 text-sm">Resume text (editable)</label>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
                  {wordCount} words | {charCount} chars
                </span>
              </div>
              {initialLoadDone && !text.trim() && (
                <p className="mb-2 text-xs text-zinc-500 bg-zinc-800/50 rounded-lg px-3 py-2 border border-white/10">
                  No resume loaded. Upload a file from <Link to="/upload" className="text-indigo-400 hover:underline">Upload</Link>, fill in <Link to="/add-details" className="text-indigo-400 hover:underline">Add details</Link>, or paste your resume below. Saving or improving will store it to your account.
                </p>
              )}
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setOptimizedDetail(null);
                }}
                placeholder="Paste or type your resume, or upload a file first to see extracted text here."
                className="w-full h-72 sm:h-96 resize-y rounded-xl border border-white/20 bg-black/30 p-4 text-sm text-slate-200 placeholder-zinc-500 shadow-inner shadow-black/30 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                disabled={!initialLoadDone}
              />

              <div className="mt-4 grid grid-cols-1 gap-3 sm:max-w-md sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAiImprove}
                  disabled={aiLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {aiLoading ? "Improving…" : "Improve with AI"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading || (!text.trim() && !optimizedDetail)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saveLoading ? "Saving…" : "Save to account"}
                </button>
              </div>
              {saveSuccess && (
                <div className="mt-3 inline-flex items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 text-sm font-medium">
                  Saved successfully
                </div>
              )}

              {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
              <Link
                to="/templates"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Choose resume design <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/templates/portfoliodesign"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10"
              >
                Choose portfolio design <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <nav className="mt-8 flex justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/30 transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Back to upload
              </Link>
            </nav>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
