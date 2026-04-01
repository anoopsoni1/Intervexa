export default function ExperienceSection({ entries }) {
  const rows = entries.length
    ? entries
    : [{ title: "Your role", company: "", dateLine: "", bullets: ["Add experience blocks in your profile — each block: title, company, dates, then bullet lines."] }];

  return (
    <section id="p7-experience" data-section className="px-6 py-20 md:px-12 lg:px-20">
      <div data-section-inner>
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Timeline</p>
        <h2 data-split="chars" className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.05] text-white md:text-5xl">
          Experience
        </h2>
        <div className="mt-12 space-y-0">
          {rows.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              data-stagger
              data-micro
              className="grid gap-6 border-t border-white/10 py-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] md:items-start md:gap-12"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#e85b25]/90">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white md:text-2xl">{item.title || "Role"}</h3>
                {item.company ? <p className="mt-1 text-sm text-white/70">{item.company}</p> : null}
                {item.dateLine ? <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/45">{item.dateLine}</p> : null}
              </div>
              {item.bullets.length > 0 ? (
                <ul className="space-y-2 text-sm leading-relaxed text-white/72">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/35" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/50">No bullet points for this role.</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
