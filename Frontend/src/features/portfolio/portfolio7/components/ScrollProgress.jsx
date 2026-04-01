import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgress() {
  const barRef = useRef(null);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress, transformOrigin: "left center" });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed left-0 top-0 z-[95] h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#e85b25] via-white/80 to-[#e85b25]"
      aria-hidden
    />
  );
}
