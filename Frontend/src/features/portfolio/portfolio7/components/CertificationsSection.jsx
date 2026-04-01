export default function CertificationsSection({ items }) {
  const list = items.length ? items : ["Certifications from your profile render in this grid."];

  return (
    <section id="p7-certifications" data-section className="border-y border-white/10 px-6 py-20 md:px-12 lg:px-20">
      <div data-section-inner>
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Credentials</p>
        <h2 data-split="chars" className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.05] text-white md:text-5xl">
          Certifications
        </h2>
        <div className="mt-10 columns-1 gap-4 md:columns-2">
          {list.map((raw, i) => {
            const lines = String(raw).split(/\n/).map((l) => l.trim()).filter(Boolean);
            const title = lines[0] || "Certificate";
            const detail = lines.slice(1).join(" · ");
            return (
              <div
                key={`${title}-${i}`}
                data-stagger
                data-micro
                className="mb-4 break-inside-avoid rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.06] to-transparent p-5"
              >
                <p className="font-medium text-white">{title}</p>
                {detail ? <p className="mt-2 text-xs text-white/55">{detail}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
