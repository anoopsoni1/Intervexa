export default function Projects({ projects }) {
  return (
    <section id="p7-projects" data-section className="px-6 md:px-12 lg:px-20 py-24">
      <div data-section-inner>
        <div data-reveal className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Featured Work</p>
          <h3 data-split="chars" className="mt-3 text-4xl md:text-6xl text-white leading-[0.95]">
            Projects
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project, idx) => (
            <article
              key={`${project.title}-${idx}`}
              data-flip-card
              data-micro
              data-stagger
              className="group relative min-h-[220px] overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-6"
            >
              <div className="absolute inset-0 scale-110 opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100 bg-[radial-gradient(circle_at_85%_15%,rgba(232,91,37,0.5),transparent_45%)]" />
              <p className="relative text-[11px] uppercase tracking-[0.25em] text-white/45">Project {String(idx + 1).padStart(2, "0")}</p>
              <h4 className="relative mt-4 text-2xl text-white">{project.title}</h4>
              <p className="relative mt-3 text-sm leading-relaxed text-white/70">{project.description || "Project narrative."}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
