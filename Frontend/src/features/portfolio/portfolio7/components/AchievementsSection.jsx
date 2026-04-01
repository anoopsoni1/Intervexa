export default function AchievementsSection({ items }) {
  const list = items.length ? items : ["Recognition and wins you add in your profile appear here."];

  return (
    <section id="p7-achievements" data-section className="px-6 py-20 md:px-12 lg:px-20">
      <div data-section-inner>
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Highlights</p>
        <h2 data-split="chars" className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.05] text-white md:text-5xl">
          Achievements
        </h2>
        <ul className="mt-10 grid gap-3 md:grid-cols-2">
          {list.map((text, i) => (
            <li
              key={`${text}-${i}`}
              data-stagger
              data-micro
              className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-relaxed text-white/80"
            >
              <span className="font-mono text-xs text-[#e85b25]/80">{String(i + 1).padStart(2, "0")}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
