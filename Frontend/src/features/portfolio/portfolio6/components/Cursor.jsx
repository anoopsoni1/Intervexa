import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const lerp = (a, b, n) => a + (b - a) * n;

/**
 * Custom cursor — IDs p6-cursor-* for static deploy parity.
 */
export default function Cursor({ disabled }) {
  const reduced = useReducedMotion();
  const active = !disabled && !reduced;

  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const dot = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) return undefined;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const interactive = el?.closest?.(
        "a[href], button, [role='button'], input, textarea, select, [data-cursor='pointer']"
      );
      hoverRef.current = !!interactive;
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    const loop = () => {
      const h = hoverRef.current;
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
      dot.current.x = lerp(dot.current.x, pos.current.x, 0.45);
      dot.current.y = lerp(dot.current.y, pos.current.y, 0.45);

      const s = h ? 1.28 : 1;
      const rw = h ? 44 : 36;
      if (ringRef.current) {
        ringRef.current.style.width = `${rw}px`;
        ringRef.current.style.height = `${rw}px`;
        ringRef.current.style.mixBlendMode = h ? "difference" : "normal";
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${s})`;
      }
      if (dotRef.current) {
        const dw = h ? 5 : 3;
        dotRef.current.style.width = `${dw}px`;
        dotRef.current.style.height = `${dw}px`;
        dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="p6-custom-cursor" aria-hidden>
      <div
        id="p6-cursor-ring"
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full border border-white/40 bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-[1px]"
        style={{
          width: 36,
          height: 36,
          willChange: "transform, width, height",
        }}
      />
      <div
        id="p6-cursor-dot"
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[91] rounded-full bg-[#A65C34]"
        style={{
          width: 3,
          height: 3,
          willChange: "transform, width, height",
        }}
      />
    </div>
  );
}
