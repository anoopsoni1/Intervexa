import { useEffect, useState } from "react";

/** Thin vertical scroll progress on the right edge (klmnko-style). */
export default function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      setP(Math.min(1, Math.max(0, ratio)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed right-0 top-0 z-[55] h-full w-[2px] bg-white/[0.06]"
      aria-hidden
    >
      <div
        className="w-full origin-top bg-[#A65C34] transition-[height] duration-150 ease-out"
        style={{ height: `${p * 100}%` }}
      />
    </div>
  );
}
