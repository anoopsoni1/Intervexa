import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const lerp = (a, b, n) => a + (b - a) * n;

/**
 * Circular custom cursor — ring + dot, smooth trailing, scale on interactive hover.
 * IDs p5-cursor-* for static deploy script parity.
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
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.11);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.11);
      dot.current.x = lerp(dot.current.x, pos.current.x, 0.42);
      dot.current.y = lerp(dot.current.y, pos.current.y, 0.42);

      const s = h ? 1.22 : 1;
      const rw = h ? 40 : 34;
      if (ringRef.current) {
        ringRef.current.style.width = `${rw}px`;
        ringRef.current.style.height = `${rw}px`;
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${s})`;
      }
      if (dotRef.current) {
        const dw = h ? 4 : 3;
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
    <div className="p5-custom-cursor" aria-hidden>
      <div
        id="p5-cursor-ring"
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-32 rounded-full border border-white/35 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        style={{
          width: 34,
          height: 34,
          willChange: "transform, width, height",
        }}
      />
      <div
        id="p5-cursor-dot"
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[33] rounded-full bg-white/90 shadow-sm"
        style={{
          width: 3,
          height: 3,
          willChange: "transform, width, height",
        }}
      />
    </div>
  );
}
