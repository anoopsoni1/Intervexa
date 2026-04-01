export default function SkillsSection({ skills }) {
  const list = skills.length ? skills : ["Add skills in your profile to populate this strip."];
  const doubled = [...list, ...list];

  return (
    <section id="p7-skills" data-section className="border-y border-white/10 px-6 py-20 md:px-12 lg:px-20">
      <div data-section-inner>
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Capabilities</p>
        <h2 data-split="chars" className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.05] text-white md:text-5xl">
          Skills &amp; tools
        </h2>
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div
            className="flex w-max gap-3 py-5 pl-6 md:gap-4"
            style={{ animation: "p7-skills-marquee 36s linear infinite" }}
          >
            {doubled.map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                data-micro
                className="shrink-0 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white/85 md:text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes p7-skills-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </section>
  );
}
