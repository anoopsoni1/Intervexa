export default function About({ summary, philosophy }) {
  const tagline = String(philosophy || "").trim();

  return (
    <section id="p7-about" data-section className="px-6 md:px-12 lg:px-20 py-24">
      <div data-section-inner className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Narrative</p>
          <h2 data-split="chars" className="mt-4 text-4xl font-semibold leading-[0.98] text-white md:text-6xl">
            About
          </h2>
          <p data-reveal className="mt-8 text-base leading-relaxed text-white/72 md:text-lg">
            {summary}
          </p>
        </div>
        <aside className="flex flex-col justify-between gap-8">
          <div data-micro className="rounded-2xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur">
            <p className="text-[11px] tracking-[0.22em] uppercase text-white/45">Point of view</p>
            {tagline ? (
              <p className="mt-4 text-lg italic leading-relaxed text-white/80 md:text-xl">{tagline}</p>
            ) : (
              <p className="mt-4 text-sm text-white/45">Add a tagline or life philosophy in your profile to show here.</p>
            )}
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">Resume → Portfolio · all sections below are live</p>
        </aside>
      </div>
    </section>
  );
}
