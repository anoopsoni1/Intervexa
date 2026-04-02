import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { ArrowLeft, Printer, Download } from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { useToast } from "../context/ToastContext";
import { getResumeContentForView } from "../utils/detailApi.js";
/** Modern layouts (Resume1–9) from the modern resume layouts page */
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
} from "../layouts/modernResumeLayouts";
import ClassicLayout from "../layouts/ClassicLayout";
import PremiumLayout from "../layouts/PremiumLayout";
import PremiumLayout2 from "../layouts/PremiumLayout2";
import MinimalLayout from "../layouts/MinimalLayout";

import { API_BASE } from "../config";
import { setUser } from "../slices/user.slice";
import { useUsageStatus, formatResetsLabel, isUsageBlocked } from "../hooks/useUsageStatus.js";
import { Skeleton } from "../components/ui/Skeleton.jsx";

/** Dedupe rapid double afterprint from window + document in some engines. */
const AFTERPRINT_RECORD_DEDUPE_MS = 700;

/** If `(print)` never matched, only count after the dialog was open at least this long (Save/PDF fallback). */
const MIN_DWELL_NO_MEDIA_MS = 8000;

function nowMonoMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

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
  website: "www.example.com",
  github: "github.com/yourhandle",
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
  const isLoggedIn = !!user || (typeof window !== "undefined" && !!localStorage.getItem("accessToken"));
  const canRecordDownload =
    isLoggedIn && !!(user?.emailVerified || user?.googleId);
  const { status: usageStatus, refresh: refreshUsage } = useUsageStatus(canRecordDownload);
  const downloadBlocked = isUsageBlocked(usageStatus?.resumeDownload);
  const refreshUsageRef = useRef(() => {});
  refreshUsageRef.current = refreshUsage;
  const [template, setTemplate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fitScale, setFitScale] = useState(1);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_MAX_WIDTH_MQ).matches : false
  );
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  /** Print flow: only count after dialog closes, and avoid counting instant Cancel when possible. */
  const printFlowActiveRef = useRef(false);
  const printMediaMatchedRef = useRef(false);
  const printFlowStartedAtRef = useRef(0);

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
    const tok = typeof window !== "undefined" ? localStorage.getItem("accessToken")?.trim() : "";
    if (!tok) {
      setPremiumAccessReady(true);
      return;
    }
    setPremiumAccessReady(false);
    let cancelled = false;
    fetch(`${API_BASE}/profile`, {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${tok}` },
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

  const handlePrint = useCallback(() => {
    if (downloadBlocked) return;
    printFlowActiveRef.current = true;
    printMediaMatchedRef.current = false;
    printFlowStartedAtRef.current = nowMonoMs();
    window.print();
  }, [downloadBlocked]);

  /**
   * Record download only after the system print / Save-as-PDF dialog closes — not when it opens.
   * Browsers do not expose Save vs Cancel; we skip counting when the dialog was dismissed very
   * quickly and print media never matched (typical instant Cancel). If print CSS applied, or the
   * dialog stayed open long enough, we count (covers real Save/PDF and mobile where media is flaky).
   */
  useEffect(() => {
    let lastRecordAt = 0;

    const postRecord = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const now = Date.now();
      if (now - lastRecordAt < AFTERPRINT_RECORD_DEDUPE_MS) return;
      lastRecordAt = now;
      fetch(`${API_BASE}/record-resume-download`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      })
        .then(async (res) => {
          const j = await res.json().catch(() => ({}));
          if (res.status === 429) {
            const base = j?.message || j?.error || "Daily resume download limit reached.";
            const hint = j?.resetsAt ? ` ${formatResetsLabel(j.resetsAt)}` : "";
            toast.error(base + hint);
          }
          if (res.ok || res.status === 429) refreshUsageRef.current();
        })
        .catch(() => {});
    };

    const onBeforePrint = () => {
      printFlowActiveRef.current = true;
      printMediaMatchedRef.current = false;
      printFlowStartedAtRef.current = nowMonoMs();
    };

    const onPrintMediaChange = (e) => {
      if (printFlowActiveRef.current && e.matches) printMediaMatchedRef.current = true;
    };

    const onAfterPrint = () => {
      if (!printFlowActiveRef.current) return;
      printFlowActiveRef.current = false;
      const hadPrintMedia = printMediaMatchedRef.current;
      printMediaMatchedRef.current = false;
      const dwellMs = nowMonoMs() - printFlowStartedAtRef.current;
      if (hadPrintMedia || dwellMs >= MIN_DWELL_NO_MEDIA_MS) postRecord();
    };

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    document.addEventListener("beforeprint", onBeforePrint);
    document.addEventListener("afterprint", onAfterPrint);

    const mq = window.matchMedia("(print)");
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onPrintMediaChange);
    } else {
      mq.addListener(onPrintMediaChange);
    }

    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      document.removeEventListener("beforeprint", onBeforePrint);
      document.removeEventListener("afterprint", onAfterPrint);
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", onPrintMediaChange);
      } else {
        mq.removeListener(onPrintMediaChange);
      }
    };
  }, [toast]);

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
            <span className="text-[10px] sm:text-xs text-zinc-500 hidden sm:inline">No date on PDF: uncheck &quot;Headers and footers&quot; in Print dialog</span>
            <button
              type="button"
              onClick={handlePrint}
              disabled={downloadBlocked}
              title={downloadBlocked ? formatResetsLabel(usageStatus?.resumeDownload?.resetsAt) : undefined}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium hover:bg-white/15 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-white/10"
            >
              <Printer size={14} className="sm:w-4 sm:h-4" /> <span className="max-sm:hidden">Print / PDF</span><span className="sm:hidden">Print</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={downloadBlocked}
              title={downloadBlocked ? formatResetsLabel(usageStatus?.resumeDownload?.resetsAt) : undefined}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-indigo-600 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              <Download size={14} className="sm:w-4 sm:h-4" /> <span className="max-sm:hidden">Download PDF</span><span className="sm:hidden">PDF</span>
            </button>
            {downloadBlocked && canRecordDownload ? (
              <p className="w-full basis-full text-center text-[10px] text-amber-300/95 sm:text-left sm:mt-0">
                Daily PDF download limit reached. {formatResetsLabel(usageStatus?.resumeDownload?.resetsAt)}
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
              if (style === "classic" || (!style && name.includes("classic"))) return <ClassicLayout data={displayData} />;
              if (style === "premium" || (!style && name.includes("premium"))) {
                const premiumIvy =
                  num === 2 ||
                  /\bpremium\s*2\b|wharton|\bivy\b/.test(name);
                if (premiumIvy) return <PremiumLayout2 data={displayData} />;
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
              return <Resume2Layout data={displayData} />;
            })()}
            <footer className="resume-doc-footer mt-auto pt-2 text-center text-zinc-500 text-[10px] sm:text-xs print:text-[10px] print:text-zinc-600">
              Made by Intervexa
            </footer>
          </div>
        </div>
      </main>

      <style>{`
        @page { size: letter; margin: 0; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; width: 100% !important; height: auto !important; }
          .print\\:hidden { display: none !important; }
          main {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Multi-page: do not lock to one sheet — fixed 11in + break-inside:avoid caused clipping and bad breaks. */
          .resume-one-page {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            page-break-after: auto !important;
            page-break-inside: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
          }
          .resume-content-fit {
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            position: relative !important;
            left: auto !important;
            top: auto !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
          }
          .resume-document {
            box-shadow: none !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            max-width: 100% !important;
            width: 100% !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            break-inside: auto !important;
            page-break-inside: auto !important;
            justify-content: flex-start !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Let two-column layouts break across pages instead of clipping. */
          .resume-document .flex-1,
          .resume-document [class*="min-h-0"] {
            min-height: 0 !important;
            overflow: visible !important;
            max-height: none !important;
          }
          .resume-document section,
          .resume-document article > div {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }
          .resume-section-avoid-break {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }
          .resume-document h1,
          .resume-document h2,
          .resume-document h3 {
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }
          .resume-document p,
          .resume-document li {
            orphans: 3;
            widows: 3;
          }
          .resume-doc-footer {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-top: 8px !important;
          }
        }
      `}</style>
      <div className="print:hidden">
        <AppFooter />
      </div>
    </div>
  );
}
