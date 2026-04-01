import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useWebGL } from "../hooks/useWebGL.js";

export default function WebGLScene({ containerRef }) {
  const canvasRef = useRef(null);
  const uniformsRef = useWebGL(canvasRef);

  useEffect(() => {
    const onEnter = () => {
      const uniforms = uniformsRef.current;
      if (!uniforms) return;
      gsap.to(uniforms.uHover, { value: 1, duration: 0.5, ease: "power2.out" });
    };
    const onLeave = () => {
      const uniforms = uniformsRef.current;
      if (!uniforms) return;
      gsap.to(uniforms.uHover, { value: 0, duration: 0.8, ease: "power3.out" });
    };

    const root = containerRef?.current;
    const interactive = root
      ? Array.from(root.querySelectorAll("[data-micro], [data-magnetic]"))
      : Array.from(document.querySelectorAll("[data-micro], [data-magnetic]"));

    const handlers = interactive.map((el) => {
      const inFn = () => onEnter();
      const outFn = () => onLeave();
      el.addEventListener("mouseenter", inFn);
      el.addEventListener("mouseleave", outFn);
      return () => {
        el.removeEventListener("mouseenter", inFn);
        el.removeEventListener("mouseleave", outFn);
      };
    });

    return () => handlers.forEach((cleanup) => cleanup());
  }, [uniformsRef, containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 block h-[100dvh] min-h-[100dvh] w-full min-w-full max-w-none opacity-70"
    />
  );
}
