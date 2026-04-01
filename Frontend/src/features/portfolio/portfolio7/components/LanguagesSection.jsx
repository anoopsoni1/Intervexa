export default function LanguagesSection({ lines }) {
  const list = lines.length ? lines : ["Language proficiency from your profile lists here."];

  return (
    <section id="p7-languages" data-section className="px-6 py-20 md:px-12 lg:px-20">
      <div data-section-inner>
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Communication</p>
        <h2 data-split="chars" className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.05] text-white md:text-5xl">
          Languages
        </h2>
        <div className="mt-10 flex flex-wrap gap-3">
          {list.map((line, i) => (
            <span
              key={`${line}-${i}`}
              data-stagger
              data-micro
              className="rounded-2xl border border-white/15 bg-black/40 px-5 py-3 text-sm text-white/85"
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
