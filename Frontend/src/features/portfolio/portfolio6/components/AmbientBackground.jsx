import { useReducedMotion } from "framer-motion";

/**
 * Full-viewport ambient layer — visible mesh, orbs, grid, vignette.
 * Sits behind all content (z-0); pointer-events none.
 */
export default function AmbientBackground() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Base — not flat black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_-10%,#0a0a12_0%,#020203_45%,#000000_100%)]" />

      {/* Animated color mesh (CSS only) */}
      <div
        className={`absolute inset-[-2px] opacity-100 mix-blend-screen ${reduced ? "" : "p6-bg-mesh-animate"}`}
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 15% 10%, rgba(166, 92, 52, 0.35), transparent 52%),
            radial-gradient(ellipse 70% 55% at 85% 15%, rgba(99, 102, 241, 0.14), transparent 50%),
            radial-gradient(ellipse 80% 70% at 50% 95%, rgba(166, 92, 52, 0.12), transparent 55%),
            radial-gradient(ellipse 50% 40% at 70% 60%, rgba(56, 189, 248, 0.06), transparent 45%)
          `,
        }}
      />

      {/* Large soft orbs — slow drift */}
      <div
        className={`absolute -left-[25%] top-[-15%] h-[min(90vh,720px)] w-[min(90vh,720px)] rounded-full bg-[#A65C34]/25 blur-[100px] sm:blur-[120px] ${reduced ? "opacity-70" : "p6-orb-a opacity-80"}`}
      />
      <div
        className={`absolute -right-[20%] top-[25%] h-[min(70vh,560px)] w-[min(70vh,560px)] rounded-full bg-indigo-500/20 blur-[90px] sm:blur-[110px] ${reduced ? "opacity-50" : "p6-orb-b opacity-70"}`}
      />
      <div
        className={`absolute bottom-[-25%] left-[15%] h-[55vh] w-[55vh] max-w-[520px] rounded-full bg-[#A65C34]/15 blur-[80px] ${reduced ? "opacity-40" : "p6-orb-c opacity-60"}`}
      />

      {/* Structural grid — clearly visible */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 75%)",
        }}
      />

      {/* Finer secondary grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(166,92,52,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(166,92,52,0.12) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[rgba(166,92,52,0.08)] via-transparent to-transparent" />

      {/* Edge vignette — keeps focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_0%,rgba(0,0,0,0.5)_85%,rgba(0,0,0,0.85)_100%)]" />

      {/* Subtle scan shimmer (optional, very light) */}
      {!reduced ? (
        <div className="p6-scan absolute inset-0 opacity-[0.035] mix-blend-overlay" />
      ) : null}

      <style>{`
        @keyframes p6-mesh-shift {
          0%, 100% {
            transform: scale(1) translate(0%, 0%);
            filter: hue-rotate(0deg);
          }
          33% {
            transform: scale(1.03) translate(1.5%, -1%);
            filter: hue-rotate(6deg);
          }
          66% {
            transform: scale(1.02) translate(-1%, 1.5%);
            filter: hue-rotate(-4deg);
          }
        }
        .p6-bg-mesh-animate {
          animation: p6-mesh-shift 22s ease-in-out infinite;
        }
        @keyframes p6-orb-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, 5%) scale(1.08); }
        }
        @keyframes p6-orb-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-6%, 8%) scale(1.05); }
        }
        @keyframes p6-orb-drift-c {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4%, -6%); }
        }
        .p6-orb-a { animation: p6-orb-drift-a 28s ease-in-out infinite; }
        .p6-orb-b { animation: p6-orb-drift-b 32s ease-in-out infinite; }
        .p6-orb-c { animation: p6-orb-drift-c 24s ease-in-out infinite; }
        @keyframes p6-scan {
          0% { background-position: 0 0; }
          100% { background-position: 0 400px; }
        }
        .p6-scan {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 3px
          );
          animation: p6-scan 14s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .p6-bg-mesh-animate,
          .p6-orb-a,
          .p6-orb-b,
          .p6-orb-c,
          .p6-scan {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
