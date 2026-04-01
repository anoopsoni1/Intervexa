import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

function ChromaticBlob({ reduced }) {
  const wrapRef = useRef(null);
  const layersRef = useRef([]);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced || !wrapRef.current) return undefined;
    const el = wrapRef.current;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      target.current = {
        x: ((e.clientX - cx) / Math.max(rect.width / 2, 1)) * 22,
        y: ((e.clientY - cy) / Math.max(rect.height / 2, 1)) * 18,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let raf = 0;
    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      layersRef.current.forEach((layer, i) => {
        if (!layer) return;
        const off = (i - 1) * 7;
        layer.style.transform = `translate3d(${current.current.x + off}px, ${current.current.y - off * 0.4}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[min(72vw,520px)] w-[min(72vw,520px)] -translate-x-1/2 -translate-y-1/2 md:top-[45%]"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(n) => {
            layersRef.current[i] = n;
          }}
          className="absolute inset-0 rounded-[42%] opacity-[0.42] blur-3xl md:opacity-50"
          style={{
            background:
              i === 0
                ? "radial-gradient(circle at 30% 30%, rgba(120, 200, 255, 0.35), transparent 55%)"
                : i === 1
                  ? "radial-gradient(circle at 70% 40%, rgba(255, 120, 200, 0.28), transparent 50%)"
                  : "radial-gradient(circle at 50% 70%, rgba(255, 255, 255, 0.12), transparent 45%)",
            mixBlendMode: "screen",
            transform: `translate(${(i - 1) * 4}px, ${(i - 1) * -3}px)`,
          }}
        />
      ))}
      <div
        className="absolute inset-[12%] rounded-[38%] border border-white/[0.07] bg-gradient-to-br from-white/[0.09] via-white/[0.02] to-transparent shadow-[0_0_80px_-20px_rgba(255,255,255,0.35)] backdrop-blur-md"
        style={{ boxShadow: "inset 0 0 60px rgba(255,255,255,0.06)" }}
      />
    </div>
  );
}

export default function Hero({ firstName, roleLine1, roleLine2, onScrollClick }) {
  const reduced = useReducedMotion();

  const line1 = roleLine1 || "Full-stack Developer";
  const line2 = roleLine2 || "";

  return (
    <section
      id="p5-home"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-36 md:pt-28 sm:px-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_35%,rgba(255,255,255,0.06),transparent_65%)]" />
      <ChromaticBlob reduced={!!reduced} />

      <div className="relative z-10 flex max-w-8xl flex-col items-center text-center">
        <motion.p
          className="mb-4 text-sm font-medium tracking-[0.04em] text-white/55 sm:text-base"
          initial={reduced ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Hi! I&apos;m{" "}
          <span className="text-amber-200/95">{firstName}</span>
        </motion.p>

        <motion.h1
          className="text-[clamp(2.5rem,10.5vw,6.25rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-white"
          initial={reduced ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="block">{line1}</span>
          {line2 ? (
            <span className="mt-1 block text-white/92 sm:mt-2">{line2}</span>
          ) : null}
        </motion.h1>

      </div>

      <button
        type="button"
        data-cursor="pointer"
        onClick={onScrollClick}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-[10px] font-medium uppercase tracking-[0.35em] text-white/40 transition-colors hover:text-white/70"
        aria-label="Scroll to work"
      >
        scroll down
      </button>
    </section>
  );
}
