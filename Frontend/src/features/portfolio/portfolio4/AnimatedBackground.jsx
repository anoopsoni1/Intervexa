import { motion, useReducedMotion } from "framer-motion";

/**
 * Full-viewport ambient motion behind Portfolio 4 content.
 * Uses inline styles so colors always apply (Tailwind arbitrary opacity can be easy to miss in build),
 * and sits above the global layout particles via z-index inside the page subtree.
 */
export default function AnimatedBackground() {
  const reduced = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[0] min-h-[100dvh] w-full overflow-hidden"
      style={{ isolation: "isolate" }}
      aria-hidden
    >
      {/* Opaque base — slightly lifted so hero matches lower sections perceptually */}
      <div className="absolute inset-0 bg-[#08080c]" />

      {/* Slow drifting orbs (inline rgba so visibility is reliable) */}
      <motion.div
        className="absolute -left-[12%] top-[6%] rounded-full blur-[100px] sm:blur-[120px]"
        style={{
          width: "min(72vw, 520px)",
          height: "min(72vw, 520px)",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.38) 0%, rgba(139, 92, 246, 0.08) 45%, transparent 70%)",
        }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, 40, -14, 0],
                y: [0, -32, 16, 0],
                scale: [1, 1.07, 1.02, 1],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[8%] top-[32%] rounded-full blur-[90px] sm:blur-[110px]"
        style={{
          width: "min(58vw, 420px)",
          height: "min(58vw, 420px)",
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, rgba(34, 211, 238, 0.06) 50%, transparent 72%)",
        }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, -36, 20, 0],
                y: [0, 44, -18, 0],
                scale: [1, 1.09, 1, 1],
              }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute bottom-[-12%] left-[18%] rounded-full blur-[100px] sm:blur-[130px]"
        style={{
          width: "min(68vw, 480px)",
          height: "min(68vw, 480px)",
          background: "radial-gradient(circle, rgba(217, 70, 239, 0.22) 0%, rgba(217, 70, 239, 0.05) 48%, transparent 72%)",
        }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, -28, 22, 0],
                y: [0, -40, 14, 0],
                opacity: [0.75, 1, 0.82, 0.75],
              }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      {/* Breathing radial veil */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 18%, rgba(255,255,255,0.06) 0%, transparent 55%)",
        }}
        animate={reduced ? undefined : { opacity: [0.58, 0.88, 0.62, 0.58] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Was 0.42 — heavy vignette made the hero viewport read darker than scrolled sections */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.16)_100%)]" />
    </div>
  );
}
