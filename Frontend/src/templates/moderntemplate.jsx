import { Link, useNavigate } from "react-router-dom";
import { FileText, LayoutTemplate, ChevronRight, ArrowLeft, Layers, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Particles from "../components/ui/Lighting.jsx";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

function Topbar() {
  return <AppHeader />;
}

export default function ModernTemplate() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const isPremium = !!user?.Premium;

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePortfolio = () => {
    if (!isPremium) return;
    navigate("/templates/portfoliodesign", { state: { templateId: "modern" } });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
        <Particles
          particleColors={["#ffffff", "#818cf8", "#c084fc"]}
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
      <div className="absolute inset-0 z-1 bg-gradient-to-br from-black/50 via-black/40 to-indigo-950/30" />
      <div className="relative z-10">
        <Topbar />
        <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14 md:py-20 min-h-[60vh] flex flex-col items-center justify-center">
          <header className="mb-8 sm:mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/25 border-2 border-indigo-400/50 px-4 py-2 text-indigo-200 text-sm font-medium shadow-lg shadow-indigo-500/10">
                <Layers className="h-4 w-4 text-indigo-300" /> Modern template
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
              Resume or portfolio
            </h1>
            <p className="mt-3 max-w-sm mx-auto text-sm text-indigo-100/80">
              Choose a modern design for your resume or project. Both use your saved details.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
            <Link
              to="/templates/modern/resumedesign"
              state={{ templateId: "modern" }}
              className="group rounded-xl border-2 border-indigo-400/40 bg-indigo-950/40 backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/20 active:scale-[0.99] w-full block"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/30 text-indigo-300 shrink-0 mb-3 group-hover:bg-indigo-500/40 transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">Resume</h2>
              <p className="mt-1.5 text-xs sm:text-sm text-indigo-200/70 leading-snug">
                Pick a modern resume layout and view or download.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-indigo-300 group-hover:text-indigo-200 transition-colors">
                Resume designs <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
            {isPremium ? (
              <button
                type="button"
                onClick={handlePortfolio}
                className="group rounded-xl border-2 border-violet-400/40 bg-violet-950/40 backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/20 active:scale-[0.99] w-full"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/30 text-violet-300 shrink-0 mb-3 group-hover:bg-violet-500/40 transition-colors">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Portfolio</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-violet-200/70 leading-snug">
                  Pick a modern project layout and view or download.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-violet-300 group-hover:text-violet-200 transition-colors">
                  Portfolio designs <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ) : (
              <Link
                to="/price"
                className="group rounded-xl border-2 border-amber-400/50 bg-amber-950/30 backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-200 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 w-full relative block"
              >
                <div className="absolute top-3 right-3 rounded-full bg-amber-500/25 p-1.5 border border-amber-400/50" title="Premium feature">
                  <Lock className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/25 text-amber-300 shrink-0 mb-3">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Portfolio</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-amber-200/70 leading-snug">
                  Pick a modern project layout. Upgrade to unlock.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-amber-300">
                  <Lock className="h-3.5 w-3.5" /> Upgrade to unlock
                </span>
              </Link>
            )}
          </div>

          <nav className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-2 sm:gap-4">
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full border-2 border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-sm text-indigo-200 hover:text-white hover:border-indigo-400 hover:bg-indigo-500/25 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back to templates
            </Link>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 rounded-full border-2 border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm text-violet-200 hover:text-white hover:border-violet-400 hover:bg-violet-500/25 transition-all"
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
