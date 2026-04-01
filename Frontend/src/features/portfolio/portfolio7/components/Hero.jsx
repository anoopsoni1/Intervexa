import { ArrowUpRight } from "lucide-react";

export default function Hero({ name, role, summary, onContact }) {
  return (
    <section id="p7-hero" data-scene="intro" data-parallax className="relative min-h-screen px-6 md:px-12 lg:px-20 pt-40 pb-20 flex items-end sm:pt-44 md:pt-48">
      <div className="w-full max-w-6xl">
        <h1 data-split="chars" className="text-[14vw] sm:text-[12vw] md:text-[9vw] leading-[0.88] font-semibold uppercase text-white">
          {name}
        </h1>
        <p data-split="chars" className="mt-4 text-[8vw] sm:text-[5vw] md:text-[3.4vw] max-w-4xl leading-[0.9] text-white/90">
          {role || "Creative Developer"}
        </p>
        <div data-reveal className="mt-10 max-w-xl">
          <p className="text-white/65 text-sm md:text-base leading-relaxed">{summary}</p>
          <button
            type="button"
            onClick={onContact}
            data-magnetic
            data-micro
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-[#e85b25] hover:border-[#e85b25]"
          >
            Get in touch <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
