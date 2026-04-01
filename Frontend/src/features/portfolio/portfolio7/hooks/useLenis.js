import { useEffect } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useLenis(enabled, lenisRef) {
  useEffect(() => {
    if (!enabled) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);
    if (lenisRef) lenisRef.current = lenis;

    const onTick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(onTick);
      if (lenisRef) lenisRef.current = null;
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [enabled, lenisRef]);
}

