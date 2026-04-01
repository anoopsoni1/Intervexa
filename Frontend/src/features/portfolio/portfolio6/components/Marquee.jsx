import { useMemo } from "react";

export default function Marquee({ items }) {
  const line = useMemo(() => {
    const list = items.length ? items : ["Design", "Build", "Ship"];
    return `${list.join(" · ")} · `;
  }, [items]);

  return (
    <div className="relative z-10 overflow-hidden border-y border-white/[0.08] bg-black/35 py-4 backdrop-blur-md">
      <div className="p6-marquee-wrap overflow-hidden">
        <div className="p6-marquee-track flex w-max">
          <span className="px-6 text-[11px] font-medium uppercase tracking-[0.35em] text-white/35">
            {line}
          </span>
          <span className="px-6 text-[11px] font-medium uppercase tracking-[0.35em] text-white/35" aria-hidden>
            {line}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes p6-marquee-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .p6-marquee-track {
          animation: p6-marquee-move 42s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .p6-marquee-track { animation: none; transform: none; }
        }
      `}</style>
    </div>
  );
}
