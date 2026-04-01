import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

function hueFromString(s) {
  let h = 28;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 7)) % 360;
  return h;
}

function initialsFromTitle(title) {
  const words = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "PR";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function ProjectCardMedia({ title, description, videoUrl, index }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const hue = hueFromString(title);
  const h2 = (hue + 160) % 360;
  const initials = initialsFromTitle(title);

  useEffect(() => {
    const root = wrapRef.current;
    const vid = videoRef.current;
    if (!root || !videoUrl || !vid) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.18);
        if (vis) vid.play().catch(() => {});
        else vid.pause();
      },
      { threshold: [0, 0.2, 0.45], rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [videoUrl]);

  if (videoUrl) {
    return (
      <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="h-full w-full scale-[1.03] object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
          src={videoUrl}
          muted
          playsInline
          loop
          preload="metadata"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/40 backdrop-blur-md">
            <ArrowUpRight className="h-6 w-6 text-white/90" strokeWidth={1.5} />
          </span>
        </div>
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
          <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[10px] tabular-nums text-white/80 backdrop-blur-md">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-[-25%] opacity-95 transition-transform duration-[1.35s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        style={{
          background: `
            radial-gradient(ellipse 85% 75% at 72% 22%, hsla(${hue}, 58%, 46%, 0.55), transparent 58%),
            radial-gradient(ellipse 70% 60% at 12% 88%, hsla(${h2}, 48%, 38%, 0.42), transparent 55%),
            linear-gradient(168deg, rgba(255,255,255,0.1) 0%, #030303 100%)
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`,
            backgroundSize: "96px 96px",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <span
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[clamp(4rem,18vw,7.5rem)] font-extralight tabular-nums text-white/[0.07] transition-all duration-700 group-hover:text-white/[0.11]"
        aria-hidden
      >
        {initials}
      </span>

      <div className="pointer-events-none absolute left-4 top-4 sm:left-5 sm:top-5">
        <span className="rounded-full border border-white/12 bg-black/35 px-2.5 py-1 font-mono text-[10px] tabular-nums text-white/75 backdrop-blur-md">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/95 via-black/50 to-transparent p-6 pt-24 sm:p-8 sm:pt-28">
        <p className="line-clamp-3 text-sm leading-relaxed text-white/70 transition-colors duration-300 group-hover:text-white/90">
          {description || title}
        </p>
      </div>
    </div>
  );
}
