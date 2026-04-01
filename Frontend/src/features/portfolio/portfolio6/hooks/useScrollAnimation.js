import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Debounced ScrollTrigger.refresh after layout changes.
 */
export function useScrollRefresh(deps) {
  const t = useRef(0);
  useEffect(() => {
    t.current = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(t.current);
  }, deps);
}
