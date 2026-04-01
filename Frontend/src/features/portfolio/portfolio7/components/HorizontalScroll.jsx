/**
 * Pinned horizontal strip — showcases **projects** only (experience lives in ExperienceSection).
 */
export default function HorizontalScroll({ projects }) {
  const items =
    projects.length > 0
      ? projects
      : [
          {
            title: "Project spotlight",
            description: "Add projects in your profile — each one becomes a full-width slide you scroll through sideways.",
          },
        ];

  return (
    <section id="p7-projects" data-section data-horizontal-track className="relative h-screen overflow-hidden border-y border-white/10 max-md:h-auto">
      <div className="pointer-events-none absolute left-6 top-6 z-10 md:left-12 lg:left-20">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Selected work</p>
        <p className="mt-1 max-w-xs text-sm text-white/55">Scroll - horizontal pass through your projects.</p>
      </div>
      <div data-horizontal-inner className="flex h-full w-max items-center gap-6 px-6 py-24 md:px-12 lg:px-20 max-md:h-auto max-md:w-full max-md:flex-col max-md:items-stretch">
        {items.map((entry, idx) => (
          <div
            key={`${entry.title}-${idx}`}
            data-micro
            data-parallax
            className="group relative flex h-[min(58vh,520px)] w-[72vw] max-w-[760px] flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-8 md:h-[58vh] md:p-10 max-md:h-auto max-md:w-full"
          >
            <div className="pointer-events-none absolute inset-0 scale-110 opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100 bg-[radial-gradient(circle_at_85%_15%,rgba(232,91,37,0.45),transparent_45%)]" />
            <p className="relative text-[11px] uppercase tracking-[0.26em] text-white/45">
              Project {String(idx + 1).padStart(2, "0")}
            </p>
            <div className="relative">
              <h3 className="text-2xl font-semibold leading-tight text-white md:text-3xl">{entry.title}</h3>
              <p className="mt-5 text-sm leading-relaxed text-white/70 md:text-base">{entry.description || "—"}</p>
            </div>
            <p className="relative text-xs uppercase tracking-[0.2em] text-white/45">Keep scrolling →</p>
          </div>
        ))}
      </div>
    </section>
  );
}
