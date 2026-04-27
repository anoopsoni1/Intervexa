import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { Sparkles, Eye, LayoutGrid, ArrowLeft, Layers, Lock } from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { useState, useEffect } from "react";

import { API_BASE } from "../config";

function Topbar() {
  return <AppHeader />;
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-zinc-900/50 backdrop-blur-sm animate-pulse ring-1 ring-white/[0.04]">
      <div className="h-[168px] sm:h-[208px] md:h-[228px] bg-gradient-to-br from-white/[0.08] to-white/[0.02]" />
      <div className="p-4 space-y-2 border-t border-white/[0.06]">
        <div className="h-3.5 w-2/3 rounded-md bg-white/10" />
        <div className="h-2.5 w-1/2 rounded-md bg-white/[0.06]" />
      </div>
      <div className="px-3 pb-3">
        <div className="h-10 w-full rounded-xl bg-white/[0.06]" />
      </div>
    </div>
  );
}

/**
 * Design template: API portfolio image — shows template from backend (name + image).
 */
function ApiTemplatePreview({ template, onSelect, index = 0 }) {
  const { _id, name, image } = template;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      whileTap={{ scale: 0.985 }}
      className="group relative rounded-2xl border border-white/[0.1] overflow-hidden bg-zinc-900/70 backdrop-blur-md shadow-xl shadow-black/30 ring-1 ring-white/[0.04] hover:border-emerald-400/35 hover:shadow-emerald-500/10 hover:ring-emerald-500/15 transition-all duration-300 flex flex-col"
    >
      <div
        role="button"
        tabIndex={0}
        className="flex flex-1 flex-col cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-t-2xl"
        onClick={() => onSelect?.(_id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(_id)}
      >
        <div className="relative flex h-[168px] sm:h-[208px] md:h-[228px] bg-zinc-800/90 shrink-0 overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)] bg-[length:200%_100%] group-hover:bg-[position:100%_0]" />
          <span className="absolute top-3 right-3 rounded-full bg-black/45 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200/95">
            Preview
          </span>
        </div>
        <div className="px-4 py-3 border-t border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-transparent flex flex-col justify-center">
          <p className="text-white font-semibold text-sm tracking-tight truncate group-hover:text-emerald-50 transition-colors">
            {name}
          </p>
          <p className="text-zinc-500 text-[11px] mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center rounded-md bg-emerald-500/15 p-0.5 text-emerald-400/90">
              <LayoutGrid className="h-2.5 w-2.5" />
            </span>
            Project template
          </p>
        </div>
      </div>
      <div className="px-3 pb-3 pt-0">
        <Link
          to={`/templates/portfoliodesign/${_id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/85 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/25 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/20 border border-emerald-400/20 transition-all duration-200"
        >
          <Eye className="h-3.5 w-3.5 opacity-90" /> View full design
        </Link>
      </div>
    </motion.article>
  );
}

export default function TemplatesDesignPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.userData);
  const [premiumChecked, setPremiumChecked] = useState(false);
  const isPremium = !!user?.Premium;

  useEffect(() => {
    let cancelled = false;
    async function checkPremium() {
      try {
        
        const headers = {};
        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (cancelled) return;
        if (!res.ok && res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const profileUser = data?.user ?? data;
          if (!profileUser?.Premium) {
            navigate("/price", { replace: true });
            return;
          }
        }
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      } finally {
        if (!cancelled) setPremiumChecked(true);
      }
    }
    checkPremium();
    return () => { cancelled = true; };
  }, [navigate]);

  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState(null);
  /** Style filter for portfolio templates: "all" | "modern" | "classic" | "minimal" | "premium" */
  const [styleFilter, setStyleFilter] = useState(() => {
    const raw = (location.state?.templateId || "").toString().toLowerCase();
    return ["modern", "classic", "minimal", "premium"].includes(raw) ? raw : "all";
  });

  useEffect(() => {
    const fetchPortfolioImages = async () => {
      try {
        setPortfolioLoading(true);
        setPortfolioError(null);
        const { data } = await axios.get(`${API_BASE}/templates`, { params: { type: "portfolio" } });
        if (data?.success && Array.isArray(data?.data)) {
          const numFromName = (t) => {
            const m = (t?.name || "").match(/\b(\d+)\s*$/);
            return m ? parseInt(m[1], 10) : null;
          };
          const portfolios = data.data
            .filter((t) => t.type === "portfolio")
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
              return (a.createdAt > b.createdAt ? -1 : 1);
            });
          setPortfolioImages(portfolios);
        } else {
          setPortfolioImages([]);
        }
      } catch (err) {
        setPortfolioError(err?.response?.data?.message || err?.message || "Failed to load templates");
        setPortfolioImages([]);
      } finally {
        setPortfolioLoading(false);
      }
    };
    fetchPortfolioImages();
  }, []);

  const handleSelectDesign = (designId) => {
    localStorage.setItem("selectedDesignTemplate", designId);
    navigate("/upload");
  };
  const handleSelectApiTemplate = (templateId) => {
    navigate(`/templates/portfoliodesign/${templateId}`);
  };

  if (!premiumChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md px-10 py-8 text-center shadow-xl shadow-black/40 ring-1 ring-white/[0.05]">
          <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" aria-hidden />
          <p className="text-white font-semibold tracking-tight">Checking access…</p>
          <p className="text-zinc-500 text-xs mt-1.5">Verifying your subscription</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[100px]" />
        <div className="absolute top-1/3 -right-32 h-[320px] w-[320px] rounded-full bg-teal-500/[0.06] blur-[90px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>
      <div className="relative z-10">
        <Topbar />

        <main className="mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20 min-h-[60vh]">
          <header className="mb-10 sm:mb-14 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/12 border border-emerald-400/25 px-4 py-2 text-emerald-200/95 shadow-lg shadow-emerald-950/20"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="text-sm font-medium tracking-wide">
                {styleFilter === "modern" && "Modern projects"}
                {styleFilter === "classic" && "Classic projects"}
                {styleFilter === "minimal" && "Minimal projects"}
                {styleFilter === "premium" && "Premium projects"}
                {styleFilter === "all" && "Design templates"}
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] max-w-4xl"
            >
              <span className="text-white">Choose a </span>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                portfolio design
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="mt-5 max-w-xl text-base sm:text-lg text-zinc-400 leading-relaxed"
            >
              Pick a layout for your project. Each design uses your saved details—add them first if you haven’t.
            </motion.p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {portfolioLoading && (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}
            {portfolioError && (
              <div className="col-span-full rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-500/15 to-amber-950/20 backdrop-blur-md px-5 py-4 text-amber-100 text-sm flex items-center gap-4 shadow-lg shadow-amber-950/20">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/25 border border-amber-400/30 flex items-center justify-center font-bold text-amber-200">
                  !
                </span>
                <span className="leading-relaxed">{portfolioError}</span>
              </div>
            )}
            {!portfolioLoading &&
              (() => {
                const matchesStyle = (t) => {
                  if (styleFilter === "all") return true;
                  const s = (t?.style || "").toLowerCase();
                  if (styleFilter === "modern") return s === "modern" || s === "";
                  return s === styleFilter;
                };
                const filtered = portfolioImages.filter(matchesStyle);
                if (!filtered.length && !portfolioError) {
                  return (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-sm text-center ring-1 ring-white/[0.04]">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/20 flex items-center justify-center mb-5 shadow-inner">
                        <Layers className="h-8 w-8 text-emerald-400/80" />
                      </div>
                      {styleFilter === "all" ? (
                        <>
                          <p className="text-zinc-400 text-sm sm:text-base">
                            No project templates available yet.
                          </p>
                          <p className="text-zinc-500 text-sm mt-1">
                            Check back later or try another category.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-zinc-400 text-sm sm:text-base">
                            No project templates for this style.
                          </p>
                          <p className="text-zinc-500 text-sm mt-1">
                            Upload templates with style “{styleFilter}” in the admin panel.
                          </p>
                        </>
                      )}
                    </div>
                  );
                }
                return filtered.map((template, index) => (
                  <ApiTemplatePreview
                    key={template._id}
                    template={template}
                    onSelect={handleSelectApiTemplate}
                    index={index}
                  />
                ));
              })()}
          </div>

          <nav className="mt-14 sm:mt-20 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:border-white/25 hover:bg-white/[0.08] transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 opacity-80" /> Change type
            </Link>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/25 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 opacity-90" /> Back to templates
            </Link>
          </nav>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
