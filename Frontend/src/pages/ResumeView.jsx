import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { ArrowLeft, FileDown } from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { useToast } from "../context/ToastContext";
import { getResumeContentForView } from "../utils/detailApi.js";
/** Modern layouts (Resume1–19) from the modern resume layouts page */
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
  Resume17Layout,
  Resume18Layout,
  Resume19Layout,
} from "../layouts/modernResumeLayouts";
import ClassicLayout from "../layouts/ClassicLayout";
import ClassicLayout1 from "../layouts/ClassicLayout1";
import PremiumLayout from "../layouts/PremiumLayout";
import PremiumLayout2 from "../layouts/PremiumLayout2";
import PremiumLayout3 from "../layouts/PremiumLayout3";
import MinimalLayout from "../layouts/MinimalLayout";

import { API_BASE } from "../config";
import { getAuthHeaders } from "../services/api";
import { intervexaCopyrightLine } from "../constants/branding.js";
import { setUser } from "../slices/user.slice";
import { useUsageStatus, formatResetsLabel, isUsageBlocked } from "../hooks/useUsageStatus.js";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import resumePrintCss from "../styles/resumePrintPdf.css?raw";
import { buildVisualResumePdfPayload } from "../utils/resumeVisualExport.js";

/** Placeholder data so logged-out users can still view template designs */
const PLACEHOLDER_RESUME_DATA = {
  name: "Your Name",
  role: "Your Role",
  summary: "Add a short summary of your experience and goals. Sign in and add your details to see your own content here.",
  skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  experience: [
    "Job Title\nCompany Name\n2020 – Present\nBrief description of your role and key responsibilities.",
    "Previous Role\nPrevious Company\n2018 – 2020\nSecond role achievement one.\nSecond role achievement two.",
  ],
  education: "Degree or certification\nInstitution name\nYear",
  projects: ["Sample project\nShort description of what you built."],
  languageProficiency: "English – Native\nSpanish – Advanced",
  certifications: ["Certificate name\nIssuer or details"],
  email: "email@example.com",
  phone: "+1 234 567 8900",
  location: "City, Country",
  linkedin: "linkedin.com/in/yourprofile",
  github: "github.com/yourhandle",
  passions:
    "Open source — Contributing to developer tools\nPhotography — City and travel\nPublic speaking — Meetups and workshops",
};

/** Screen (sm+): single-page preview with scale-to-fit. Print: natural height — long resumes span multiple pages. */
const ONE_PAGE_WRAPPER_CLASS =
  "resume-one-page w-full min-h-[11in] h-auto max-h-none overflow-visible relative flex flex-col justify-start items-stretch print:h-auto print:min-h-0 print:max-h-none print:overflow-visible";

/** Below `sm` (max-width 639px): full document height, page scroll, no clip or shrink-to-fit. */
const MOBILE_RESUME_WRAPPER_CLASS =
  "resume-one-page w-full min-h-0 h-auto max-h-none overflow-visible relative flex flex-col justify-start items-stretch print:h-auto print:min-h-0 print:max-h-none print:overflow-visible";

const MOBILE_MAX_WIDTH_MQ = "(max-width: 639px)";

function Topbar() {
  return <AppHeader />;
}

function ResumeLoadingSkeleton() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
        <Skeleton className="h-[min(70vh,820px)] w-full rounded-2xl" />
      </div>
    </main>
  );
}

function getTemplateNumber(t) {
  const nm = (t?.name || "").toString();
  const matches = nm.match(/(\d+)/g);
  if (matches && matches.length > 0) {
    // Prefer explicit number in template name (e.g. "Resume 8") so stale backend order
    // values do not map the user to a different layout.
    return Number(matches[matches.length - 1]);
  }
  const orderNum = Number(t?.order);
  if (!Number.isNaN(orderNum) && orderNum > 0) return orderNum;
  return null;
}

/** Matches classic / minimal / premium resume designs (modern numeric layouts stay free). */
function templateRecordRequiresPremium(t) {
  if (!t) return false;
  const style = String(t.style || "").toLowerCase();
  const name = String(t.name || "").toLowerCase();
  if (style === "classic" || style === "minimal" || style === "premium") return true;
  if (!style && (name.includes("classic") || name.includes("minimal") || name.includes("premium"))) return true;
  return false;
}

export default function ResumeView() {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((state) => state.user?.userData);
  const isLoggedIn = !!user ;
  const canRecordDownload =
    isLoggedIn && !!(user?.emailVerified || user?.googleId);
  const { status: usageStatus, refresh: refreshUsage } = useUsageStatus(canRecordDownload);
  const exportBlocked = isUsageBlocked(usageStatus?.resumeGenerate);
  const [template, setTemplate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fitScale, setFitScale] = useState(1);
  const [exportBusy, setExportBusy] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_MAX_WIDTH_MQ).matches : false
  );
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  const needsPremiumAccess = !!(template && templateRecordRequiresPremium(template));
  const [premiumAccessReady, setPremiumAccessReady] = useState(false);

  useEffect(() => {
    if (!needsPremiumAccess) {
      setPremiumAccessReady(true);
      return;
    }
    if (user) {
      setPremiumAccessReady(true);
      return;
    }
    const tok = "";
    if (!tok) {
      setPremiumAccessReady(true);
      return;
    }
    setPremiumAccessReady(false);
    let cancelled = false;
    fetch(`${API_BASE}/profile`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (cancelled) return;
        const u = data?.user || data?.data?.user;
        if (u) dispatch(setUser(u));
      })
      .catch(() => {
        /* CORS / network — allow page to render with placeholder */
      })
      .finally(() => {
        if (!cancelled) setPremiumAccessReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [needsPremiumAccess, user, dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_MAX_WIDTH_MQ);
    const onChange = () => setIsMobileViewport(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useLayoutEffect(() => {
    // Keep natural document scale so long resumes flow instead of shrinking/clipping.
    setFitScale(1);
  }, [template, data, loading, detailLoading, isMobileViewport]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No template ID");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: res } = await axios.get(`${API_BASE}/templates/${id}`);
        if (!cancelled && res?.success && res?.data) setTemplate(res.data);
        else if (!cancelled) setError("Template not found");
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || err?.message || "Failed to load template");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      const content = await getResumeContentForView();
      if (!cancelled) {
        setData(content);
        setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleVisualPdfDownload = useCallback(async () => {
    if (exportBlocked) return;
    if (!canRecordDownload) {
      toast.error("Verify your email to download your resume.");
      return;
    }
    const host = contentRef.current;
    if (!host) {
      toast.error("Nothing to export yet.");
      return;
    }
    setExportBusy(true);
    try {
      const { html, css } = await buildVisualResumePdfPayload(
        host,
        ONE_PAGE_WRAPPER_CLASS,
        resumePrintCss
      );
      const res = await fetch(`${API_BASE}/resume-visual-pdf`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ html, css }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const base = j?.message || j?.error || `PDF failed (${res.status})`;
        const hint = j?.resetsAt ? ` ${formatResetsLabel(j.resetsAt)}` : "";
        toast.error(res.status === 429 ? base + hint : base);
        refreshUsage();
        return;
      }
      const blob = await res.blob();
      const ct = (res.headers.get("Content-Type") || "").toLowerCase();
      const mimeLooksPdf =
        ct.includes("application/pdf") || ct.includes("/pdf") || /\bpdf\b/.test(ct);
      let magicLooksPdf = false;
      if (blob.size >= 4) {
        const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
        magicLooksPdf =
          head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
      }
      if (!mimeLooksPdf && !magicLooksPdf) {
        const text = await blob.text();
        let msg = "Unexpected response from server.";
        try {
          const j = JSON.parse(text);
          msg = j?.message || j?.error || msg;
        } catch {
          /* not JSON */
        }
        toast.error(msg);
        refreshUsage();
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume.pdf";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded.");
      refreshUsage();
    } catch (e) {
      toast.error(e?.message || "PDF export failed.");
    } finally {
      setExportBusy(false);
    }
  }, [canRecordDownload, exportBlocked, toast, refreshUsage]);

  const isLoading = loading || detailLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Topbar />
        <ResumeLoadingSkeleton />
        <AppFooter />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Topbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <p className="text-amber-400">{error || "Template not found"}</p>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-white"
          >
            <ArrowLeft size={18} /> Back to templates
          </Link>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (needsPremiumAccess && !premiumAccessReady) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Topbar />
        <ResumeLoadingSkeleton />
        <AppFooter />
      </div>
    );
  }

  const resumeViewReturnPath = `${location.pathname}${location.search}`;
  if (needsPremiumAccess && premiumAccessReady) {
    if (!user) {
      return (
        <Navigate to={`/login?from=${encodeURIComponent(resumeViewReturnPath)}`} replace />
      );
    }
    if (!user.Premium) {
      return (
        <Navigate to={`/price?from=${encodeURIComponent(resumeViewReturnPath)}`} replace />
      );
    }
  }

  const displayData = data || PLACEHOLDER_RESUME_DATA;
  const isPlaceholder = !data;

  const resolvedNum = template ? getTemplateNumber(template) : null;

  // Back to resume design list for this template style (e.g. /templates/classic/resumedesign)
  const templateStyle = (template?.style || "").toLowerCase();
  const resumeDesignPath =
    ["classic", "modern", "minimal", "premium"].includes(templateStyle)
      ? `/templates/${templateStyle}/resumedesign`
      : "/templates";

  return (
    <div className="min-h-screen print:min-h-0 bg-zinc-900 print:bg-white text-white print:text-black flex flex-col print:block">
      {isPlaceholder && (
        <div className="print:hidden bg-amber-500/20 border-b border-amber-400/30 px-3 sm:px-4 py-2.5">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2 text-sm">
            <p className="text-amber-200">
              {isLoggedIn
                ? "Add or upload your resume to see your own details here. You can edit and save from the Edit resume or Add details pages."
                : "Viewing with sample data. Sign in to use your own details and save your resume."}
            </p>
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/upload"
                    className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400"
                  >
                    Upload resume
                  </Link>
                  <Link
                    to="/add-details"
                    className="inline-flex items-center rounded-lg border border-amber-400/50 px-3 py-1.5 text-sm font-medium text-amber-200 hover:text-white hover:border-amber-300"
                  >
                    Add details
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center rounded-lg border border-amber-400/50 px-3 py-1.5 text-sm font-medium text-amber-200 hover:text-white hover:border-amber-300"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden border-b border-white/10 bg-zinc-900/95 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to={resumeDesignPath}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white shrink-0"
            >
              <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back
            </Link>
            <span className="text-zinc-500 max-sm:hidden">|</span>
            <span className="text-xs sm:text-sm text-zinc-400 truncate max-w-[220px] sm:max-w-none">
              Template: {template.name}
              {resolvedNum != null && (
                <span className="ml-2 text-[11px] text-zinc-500">
                  (layout {resolvedNum}, order {template?.order ?? "?"}, style {template?.style ?? "?"})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
            <span className="text-[10px] sm:text-xs text-zinc-500 hidden lg:inline max-w-[240px]">
              PDF matches what you see. Free: 5/day · Premium: 20/day (UTC).
            </span>
            <button
              type="button"
              onClick={handleVisualPdfDownload}
              disabled={exportBusy || exportBlocked}
              title={
                exportBlocked
                  ? formatResetsLabel(usageStatus?.resumeGenerate?.resetsAt)
                  : "Download PDF (same layout as on screen)"
              }
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-indigo-600 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              <FileDown size={14} className="sm:w-4 sm:h-4" /> <span className="max-sm:hidden">PDF</span><span className="sm:hidden">PDF</span>
            </button>
            {exportBlocked && canRecordDownload ? (
              <p className="w-full basis-full text-center text-[10px] text-amber-300/95 sm:text-left sm:mt-0">
                Daily PDF export limit reached. {formatResetsLabel(usageStatus?.resumeGenerate?.resetsAt)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <main className="flex-1 print:flex-none px-2 sm:px-4 py-3 sm:py-5 overflow-auto print:p-0 print:min-h-0">
        <div
          ref={wrapperRef}
          className={`${isMobileViewport ? MOBILE_RESUME_WRAPPER_CLASS : ONE_PAGE_WRAPPER_CLASS} print:max-w-none max-sm:mx-auto max-sm:max-w-full`}
        >
          <div
            ref={contentRef}
            className="resume-content-fit w-full origin-top-left flex flex-col justify-start items-stretch min-h-0"
            style={
              isMobileViewport
                ? {
                    transform: "none",
                    width: "100%",
                    maxWidth: "100%",
                    position: "relative",
                    flex: 1,
                  }
                : {
                    transform: `scale(${fitScale})`,
                    width: fitScale < 1 ? `${100 / fitScale}%` : "100%",
                    ...(fitScale < 1 ? { position: "absolute", top: 0, left: 0 } : { flex: 1 }),
                  }
            }
          >
            {(() => {
              const style = (template?.style || "").toLowerCase();
              const name = (template?.name || "").toLowerCase();
              const num = resolvedNum;
              if (style === "classic" || (!style && name.includes("classic"))) {
                const classicOne =
                  num === 1 ||
                  /\bclassic\s*1\b|\bresume\s*1\b/.test(name);
                if (classicOne) return <ClassicLayout1 data={displayData} />;
                return <ClassicLayout data={displayData} />;
              }
              if (style === "premium" || (!style && name.includes("premium"))) {
                const premiumIvy =
                  num === 2 ||
                  /\bpremium\s*2\b|wharton|\bivy\b/.test(name);
                const premiumThree =
                  num === 3 ||
                  /\bpremium\s*3\b/.test(name);
                if (premiumIvy) return <PremiumLayout2 data={displayData} />;
                if (premiumThree) return <PremiumLayout3 data={displayData} />;
                return <PremiumLayout data={displayData} />;
              }
              if (style === "minimal" || (!style && name.includes("minimal"))) return <MinimalLayout data={displayData} />;
              if (num === 1) return <Resume1Layout data={displayData} />;
              if (num === 3) return <Resume3Layout data={displayData} />;
              if (num === 5) return <Resume5Layout data={displayData} />;
              if (num === 6) return <Resume6Layout data={displayData} />;
              if (num === 4) return <Resume4Layout data={displayData} />;
              if (num === 7) return <Resume7Layout data={displayData} />;
              if (num === 8) return <Resume8Layout data={displayData} />;
              if (num === 9) return <Resume9Layout data={displayData} />;
              if (num === 10) return <Resume10Layout data={displayData} />;
              if (num === 11) return <Resume11Layout data={displayData} />;
              if (num === 12) return <Resume12Layout data={displayData} />;
              if (num === 13) return <Resume13Layout data={displayData} />;
              if (num === 14) return <Resume14Layout data={displayData} />;
              if (num === 15) return <Resume15Layout data={displayData} />;
              if (num === 16) return <Resume16Layout data={displayData} />;
              if (num === 17) return <Resume17Layout data={displayData} />;
              if (num === 18) return <Resume18Layout data={displayData} />;
              if (num === 19) return <Resume19Layout data={displayData} />;
              return <Resume2Layout data={displayData} />;
            })()}
            <footer className="resume-doc-footer mt-auto pt-2 text-center text-zinc-500 text-[10px] sm:text-xs print:text-[10px] print:text-zinc-600">
              {intervexaCopyrightLine()}
            </footer>
          </div>
        </div>
      </main>

      <style>{resumePrintCss}</style>
      <div className="print:hidden">
        <AppFooter />
      </div>
    </div>
  );
}
