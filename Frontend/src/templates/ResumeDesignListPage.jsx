import { Link, useNavigate } from "react-router-dom";
import { FileText, Eye, LayoutGrid, ArrowLeft, Layers, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

import { API_BASE } from "../config";

function Topbar() {
  return <AppHeader />;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm animate-pulse">
      <div className="h-[160px] sm:h-[200px] md:h-[220px] bg-white/10" />
      <div className="p-3 space-y-2 border-t border-white/10">
        <div className="h-3.5 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
      </div>
      <div className="p-2.5 flex gap-2 border-t border-white/10">
        <div className="h-8 flex-1 rounded-lg bg-white/10" />
        <div className="h-8 flex-1 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}

function ApiTemplatePreview({ template, onSelect, isLocked }) {
  const { _id, name, image } = template;
  return (
    <article
      className={`group rounded-xl border border-white/15 overflow-hidden bg-zinc-900/80 backdrop-blur-sm shadow-lg shadow-black/20 hover:border-indigo-400/40 hover:shadow-indigo-500/15 transition-all duration-300 flex flex-col relative ${isLocked ? "opacity-90" : ""}`}
    >
      {isLocked && (
        <div
          className="absolute top-2 right-2 z-10 rounded-full bg-amber-500/20 p-1.5 border border-amber-400/40"
          title="Premium template"
        >
          <Lock className="h-3.5 w-3.5 text-amber-400" />
        </div>
      )}
      <div
        role="button"
        tabIndex={0}
        className="flex flex-1 flex-col cursor-pointer"
        onClick={() => !isLocked && onSelect?.(_id)}
        onKeyDown={(e) => !isLocked && (e.key === "Enter" || e.key === " ") && onSelect?.(_id)}
      >
        <div className="relative flex h-[160px] sm:h-[200px] md:h-[220px] bg-zinc-800 shrink-0 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        <div className="px-3 py-2.5 border-t border-white/10 bg-white/5 flex flex-col justify-center">
          <p className="text-white font-semibold text-xs truncate">{name}</p>
          <p className="text-zinc-500 text-[11px] mt-0.5 flex items-center gap-1">
            <LayoutGrid className="h-2.5 w-2.5" /> Resume template
          </p>
        </div>
      </div>
      <div className="px-2.5 py-2 border-t border-white/10 bg-white/5 flex gap-1.5">
        {isLocked ? (
          <Link
            to="/price"
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-amber-600 px-2.5 py-2 text-xs font-medium text-white hover:bg-amber-500 transition-all"
          >
            <Lock className="h-3.5 w-3.5" /> Upgrade to unlock
          </Link>
        ) : (
          <Link
            to={`/templates/resumedesign/${_id}`}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-white/25 px-2.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-indigo-400/50 hover:bg-white/5 transition-all"
          >
            <Eye className="h-3.5 w-3.5" /> View full
          </Link>
        )}
      </div>
    </article>
  );
}

const THEMES = {
  classic: {
    listLabel: "Classic resume designs",
    hintClass: "text-slate-200/70",
    chipClass: "bg-slate-500/15 border border-slate-400/20 text-slate-300",
    navPrimaryClass:
      "border-2 border-slate-400/40 bg-slate-500/15 text-slate-200 hover:text-white hover:border-slate-400 hover:bg-slate-500/25",
  },
  minimal: {
    listLabel: "Minimal resume designs",
    hintClass: "text-zinc-300/80",
    chipClass: "bg-zinc-500/15 border border-zinc-400/20 text-zinc-300",
    navPrimaryClass:
      "border-2 border-zinc-400/40 bg-zinc-500/15 text-zinc-200 hover:text-white hover:border-zinc-400 hover:bg-zinc-500/25",
  },
  premium: {
    listLabel: "Premium resume designs",
    hintClass: "text-orange-200/75",
    chipClass: "bg-orange-500/15 border border-orange-400/25 text-orange-200",
    navPrimaryClass:
      "border-2 border-orange-400/40 bg-orange-500/15 text-orange-200 hover:text-white hover:border-orange-400 hover:bg-orange-500/25",
  },
};

/**
 * @param {{ styleKey: 'classic' | 'minimal' | 'premium', hubPath: string, styleTitle: string }} props
 */
export default function ResumeDesignListPage({ styleKey, hubPath, styleTitle }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const [resumeTemplates, setResumeTemplates] = useState([]);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeError, setResumeError] = useState(null);

  const theme = THEMES[styleKey] || THEMES.classic;
  const styleLabel = styleTitle || styleKey.charAt(0).toUpperCase() + styleKey.slice(1);

  useEffect(() => {
    const fetchResumeTemplates = async () => {
      try {
        setResumeLoading(true);
        setResumeError(null);
        const { data } = await axios.get(`${API_BASE}/templates`, { params: { type: "resume" } });
        if (data?.success && Array.isArray(data?.data)) {
          const numFromName = (t) => {
            const m = (t?.name || "").match(/\b(\d+)\s*$/);
            return m ? parseInt(m[1], 10) : null;
          };
          const styleMatch = (t) => (t?.style || "").toLowerCase() === styleKey;
          const resumes = data.data
            .filter((t) => t.type !== "portfolio" && styleMatch(t))
            .sort((a, b) => {
              const orderA = Number(a.order);
              const orderB = Number(b.order);
              if (!Number.isNaN(orderA) && !Number.isNaN(orderB) && (orderA !== 0 || orderB !== 0))
                return orderA - orderB;
              const na = numFromName(a);
              const nb = numFromName(b);
              if (na != null && nb != null) return na - nb;
              if (na != null) return -1;
              if (nb != null) return 1;
              return a.createdAt > b.createdAt ? -1 : 1;
            });
          setResumeTemplates(resumes);
        } else {
          setResumeTemplates([]);
        }
      } catch (err) {
        setResumeError(err?.response?.data?.message || err?.message || "Failed to load templates");
        setResumeTemplates([]);
      } finally {
        setResumeLoading(false);
      }
    };
    fetchResumeTemplates();
  }, [styleKey]);

  const handleSelectApiTemplate = (templateId) => {
    if (templateId) {
      localStorage.setItem("selectedTemplate", templateId);
      navigate(`/templates/resumedesign/${templateId}`);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative z-10">
        <Topbar />
        <main className="mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20 min-h-[60vh]">
          <header className="mb-10 sm:mb-14 flex flex-col items-center text-center">
            <div className={`mb-4 flex items-center gap-2 rounded-full px-4 py-2 ${theme.chipClass}`}>
              <FileText className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{theme.listLabel}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Choose a resume design
            </h1>
            <p className={`mt-4 max-w-lg text-base sm:text-lg leading-relaxed ${theme.hintClass}`}>
              Pick a {styleLabel.toLowerCase()} layout for your resume. Each design uses your saved details—add them
              first if you haven’t.
            </p>
          </header>

          {user ? (
            <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm px-5 py-4 text-zinc-200 text-sm flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                <FileText className="h-4 w-4 text-zinc-200" />
              </div>
              <div className="min-w-0">
                <p className="leading-relaxed">
                  You can edit your resume information anytime in{" "}
                  <Link to="/add-details" className="text-white font-semibold hover:underline underline-offset-2">
                    Add details
                  </Link>
                  .
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <Link
                  to="/add-details"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all"
                >
                  Edit details
                </Link>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {resumeLoading && (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}
            {resumeError && (
              <div className="col-span-full rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm px-5 py-4 text-amber-200 text-sm flex items-center gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">!</span>
                {resumeError}
              </div>
            )}
            {!resumeLoading && resumeTemplates.length === 0 && !resumeError && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <Layers className="h-7 w-7 text-zinc-500" />
                </div>
                <p className="text-zinc-400 text-sm sm:text-base">No {styleLabel.toLowerCase()} resume templates yet.</p>
                <p className="text-zinc-500 text-sm mt-1">
                  Upload templates with style “{styleLabel}” in the admin panel, or try another category.
                </p>
              </div>
            )}
            {!resumeLoading &&
              resumeTemplates.map((template) => (
                <ApiTemplatePreview
                  key={template._id}
                  template={template}
                  onSelect={handleSelectApiTemplate}
                  isLocked={false}
                />
              ))}
          </div>

          <nav className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <Link
              to={hubPath}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-all ${theme.navPrimaryClass}`}
            >
              <ArrowLeft className="h-4 w-4" /> {styleLabel} (resume or portfolio)
            </Link>
            <span className="hidden sm:inline w-px h-4 bg-white/20" aria-hidden />
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
            >
              Other styles
            </Link>
            <span className="hidden sm:inline w-px h-4 bg-white/20" aria-hidden />
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
            >
              Back to templates
            </Link>
          </nav>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
