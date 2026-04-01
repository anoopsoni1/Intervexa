import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pins inner track and scrolls it horizontally (desktop). Stacks on small screens.
 */
export default function HorizontalScroll({ children, enabled }) {
  const pinRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return undefined;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const getMax = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -getMax(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${getMax() * 1.08}`,
          pin: true,
          scrub: 1.15,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [enabled]);

  return (
    <div ref={pinRef} className="relative w-full overflow-hidden md:min-h-screen">
      <div
        ref={trackRef}
        className="flex w-full flex-col gap-10 px-5 pb-24 pt-8 md:w-max md:flex-row md:gap-0 md:px-8 md:pb-0 md:pt-0 lg:px-12"
      >
        {children}
      </div>
    </div>
  );
}
