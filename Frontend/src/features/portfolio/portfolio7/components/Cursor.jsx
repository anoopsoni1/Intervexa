import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor({ enabled, rootRef }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    const xDot = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3.out" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3.out" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    const move = (event) => {
      xDot(event.clientX);
      yDot(event.clientY);
      xRing(event.clientX);
      yRing(event.clientY);
    };

    const scope = rootRef?.current ?? document;
    const buttons = Array.from(scope.querySelectorAll("[data-magnetic]"));
    const cleanups = buttons.map((button) => {
      const onEnter = () => {
        gsap.to(dot, { scale: 0.35, duration: 0.2 });
        gsap.to(ring, { scale: 1.35, borderColor: "rgba(232,91,37,0.65)", duration: 0.28 });
      };
      const onLeave = () => {
        gsap.to(dot, { scale: 1, duration: 0.25 });
        gsap.to(ring, { scale: 1, borderColor: "rgba(255,255,255,0.35)", duration: 0.3 });
      };
      const onMove = (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        gsap.to(button, { x: x * 0.16, y: y * 0.2, duration: 0.28, ease: "power3.out" });
      };
      const onOut = () => gsap.to(button, { x: 0, y: 0, duration: 0.45, ease: "power3.out" });
      button.addEventListener("mouseenter", onEnter);
      button.addEventListener("mouseleave", onLeave);
      button.addEventListener("mousemove", onMove);
      button.addEventListener("mouseout", onOut);
      return () => {
        button.removeEventListener("mouseenter", onEnter);
        button.removeEventListener("mouseleave", onLeave);
        button.removeEventListener("mousemove", onMove);
        button.removeEventListener("mouseout", onOut);
      };
    });

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cleanups.forEach((fn) => fn());
    };
  }, [enabled, rootRef]);

  if (!enabled) return null;
  return (
    <>
      <div
        id="p7-cursor-ring"
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[99] h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35"
      />
      <div
        id="p7-cursor-dot"
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e85b25]"
      />
    </>
  );
}
