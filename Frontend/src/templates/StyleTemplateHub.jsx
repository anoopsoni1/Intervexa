import { Link, useNavigate } from "react-router-dom";
import { FileText, LayoutTemplate, ChevronRight, ArrowLeft, Layers, Lock } from "lucide-react";
import { useSelector } from "react-redux";
import Particles from "../components/ui/Lighting.jsx";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { templatesListPathWithSkip } from "../constants/templatesFlow.js";

function Topbar() {
  return <AppHeader />;
}

const STYLES = {
  classic: {
    name: "Classic",
    resumePath: "/templates/classic/resumedesign",
    particleColors: ["#ffffff", "#94a3b8", "#cbd5e1"],
    gradient: "from-black/50 via-black/40 to-slate-950/35",
    badge: "bg-slate-500/25 border-2 border-slate-400/50 text-slate-200 shadow-slate-500/10",
    resumeCard:
      "border-2 border-slate-400/40 bg-slate-950/40 hover:border-slate-400 hover:shadow-slate-500/20",
    resumeIcon: "bg-slate-500/30 text-slate-300 group-hover:bg-slate-500/40",
    resumeText: "text-slate-200/70",
    resumeCta: "text-slate-300 group-hover:text-slate-200",
    portfolioOpen:
      "border-2 border-slate-400/45 bg-slate-950/35 hover:border-slate-300 hover:shadow-slate-500/15",
    portfolioIcon: "bg-slate-500/30 text-slate-300 group-hover:bg-slate-500/40",
    portfolioText: "text-slate-200/70",
    portfolioCta: "text-slate-300 group-hover:text-slate-200",
    lockedCard:
      "border-2 border-amber-400/50 bg-amber-950/30 hover:border-amber-400 hover:shadow-amber-500/20",
    navBack: "border-2 border-slate-400/40 bg-slate-500/15 text-slate-200 hover:border-slate-400 hover:bg-slate-500/25",
    navOther: "border-2 border-white/15 bg-white/5 text-zinc-300 hover:border-white/25 hover:bg-white/10",
  },
  minimal: {
    name: "Minimal",
    resumePath: "/templates/minimal/resumedesign",
    particleColors: ["#ffffff", "#a1a1aa", "#d4d4d8"],
    gradient: "from-black/50 via-black/40 to-zinc-950/35",
    badge: "bg-zinc-500/25 border-2 border-zinc-400/45 text-zinc-200 shadow-zinc-500/10",
    resumeCard:
      "border-2 border-zinc-400/40 bg-zinc-950/40 hover:border-zinc-400 hover:shadow-zinc-500/20",
    resumeIcon: "bg-zinc-500/30 text-zinc-300 group-hover:bg-zinc-500/40",
    resumeText: "text-zinc-200/70",
    resumeCta: "text-zinc-300 group-hover:text-zinc-200",
    portfolioOpen:
      "border-2 border-zinc-400/45 bg-zinc-950/35 hover:border-zinc-300 hover:shadow-zinc-500/15",
    portfolioIcon: "bg-zinc-500/30 text-zinc-300 group-hover:bg-zinc-500/40",
    portfolioText: "text-zinc-200/70",
    portfolioCta: "text-zinc-300 group-hover:text-zinc-200",
    lockedCard:
      "border-2 border-amber-400/50 bg-amber-950/30 hover:border-amber-400 hover:shadow-amber-500/20",
    navBack: "border-2 border-zinc-400/40 bg-zinc-500/15 text-zinc-200 hover:border-zinc-400 hover:bg-zinc-500/25",
    navOther: "border-2 border-white/15 bg-white/5 text-zinc-300 hover:border-white/25 hover:bg-white/10",
  },
  premium: {
    name: "Premium",
    resumePath: "/templates/premium/resumedesign",
    particleColors: ["#ffffff", "#fb923c", "#fdba74"],
    gradient: "from-black/50 via-black/40 to-orange-950/25",
    badge: "bg-orange-500/25 border-2 border-orange-400/50 text-orange-200 shadow-orange-500/10",
    resumeCard:
      "border-2 border-orange-400/40 bg-orange-950/35 hover:border-orange-400 hover:shadow-orange-500/20",
    resumeIcon: "bg-orange-500/30 text-orange-300 group-hover:bg-orange-500/40",
    resumeText: "text-orange-200/75",
    resumeCta: "text-orange-300 group-hover:text-orange-200",
    portfolioOpen:
      "border-2 border-amber-500/40 bg-amber-950/35 hover:border-amber-400 hover:shadow-amber-500/20",
    portfolioIcon: "bg-amber-500/30 text-amber-300 group-hover:bg-amber-500/40",
    portfolioText: "text-amber-200/75",
    portfolioCta: "text-amber-300 group-hover:text-amber-200",
    lockedCard:
      "border-2 border-amber-400/50 bg-amber-950/30 hover:border-amber-400 hover:shadow-amber-500/20",
    navBack: "border-2 border-orange-400/40 bg-orange-500/15 text-orange-200 hover:border-orange-400 hover:bg-orange-500/25",
    navOther: "border-2 border-white/15 bg-white/5 text-zinc-300 hover:border-white/25 hover:bg-white/10",
  },
};

/**
 * @param {{ styleId: 'classic' | 'minimal' | 'premium' }} props
 */
export default function StyleTemplateHub({ styleId }) {
  const cfg = STYLES[styleId];
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const isPremium = !!user?.Premium;

  const handlePortfolio = () => {
    if (!isPremium) return;
    navigate("/templates/portfoliodesign", { state: { templateId: styleId } });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
        <Particles
          particleColors={cfg.particleColors}
          particleCount={220}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      <div className={`absolute inset-0 z-1 bg-linear-to-br ${cfg.gradient}`} />
      <div className="relative z-10">
        <Topbar />
        <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14 md:py-20 min-h-[60vh] flex flex-col items-center justify-center">
          <header className="mb-8 sm:mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg ${cfg.badge}`}
              >
                <Layers className="h-4 w-4" /> {cfg.name} template
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
              Resume or portfolio
            </h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-white/75">
              Choose a {cfg.name.toLowerCase()} design for your resume or project. Both use your saved details.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
            <Link
              to={cfg.resumePath}
              state={{ templateId: styleId }}
              className={`group rounded-xl backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:shadow-xl active:scale-[0.99] w-full block ${cfg.resumeCard}`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 mb-3 transition-colors ${cfg.resumeIcon}`}
              >
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">Resume</h2>
              <p className={`mt-1.5 text-xs sm:text-sm leading-snug ${cfg.resumeText}`}>
                Pick a {cfg.name.toLowerCase()} resume layout and view or download.
              </p>
              <span
                className={`mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors ${cfg.resumeCta}`}
              >
                Resume designs <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
            {isPremium ? (
              <button
                type="button"
                onClick={handlePortfolio}
                className={`group rounded-xl backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:shadow-xl active:scale-[0.99] w-full ${cfg.portfolioOpen}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 mb-3 transition-colors ${cfg.portfolioIcon}`}
                >
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Portfolio</h2>
                <p className={`mt-1.5 text-xs sm:text-sm leading-snug ${cfg.portfolioText}`}>
                  Pick a {cfg.name.toLowerCase()} project layout and view or download.
                </p>
                <span
                  className={`mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors ${cfg.portfolioCta}`}
                >
                  Portfolio designs{" "}
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ) : (
              <Link
                to="/price"
                className={`group rounded-xl backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:shadow-xl w-full relative block ${cfg.lockedCard}`}
              >
                <div
                  className="absolute top-3 right-3 rounded-full bg-amber-500/25 p-1.5 border border-amber-400/50"
                  title="Premium feature"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/25 text-amber-300 shrink-0 mb-3">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Portfolio</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-amber-200/70 leading-snug">
                  Pick a {cfg.name.toLowerCase()} project layout. Upgrade to unlock.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-amber-300">
                  <Lock className="h-3.5 w-3.5" /> Upgrade to unlock
                </span>
              </Link>
            )}
          </div>

          <nav className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-2 sm:gap-4">
            <Link
              to={templatesListPathWithSkip()}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-all ${cfg.navBack}`}
            >
              <ArrowLeft className="h-4 w-4" /> Back to templates
            </Link>
            <Link
              to={templatesListPathWithSkip()}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-all ${cfg.navOther}`}
            >
              Other styles
            </Link>
          </nav>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
