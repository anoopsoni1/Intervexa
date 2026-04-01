import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll + GSAP ScrollTrigger sync.
 * Skips when user prefers reduced motion.
 * @param {React.MutableRefObject<import('lenis').default | null>} [lenisRef] — optional ref to the Lenis instance for programmatic scrollTo.
 */
export function useLenis(enabled, lenisRef) {
  useEffect(() => {
    if (!enabled) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.65,
    });

    lenis.on("scroll", ScrollTrigger.update);
    if (lenisRef) lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("load", onLoad);
      cancelAnimationFrame(rafId);
      if (lenisRef) lenisRef.current = null;
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [enabled, lenisRef]);
}
