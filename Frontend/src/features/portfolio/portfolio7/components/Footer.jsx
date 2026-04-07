export default function Footer({ email, phone, location, links }) {
  return (
    <footer id="p7-contact" data-section className="px-6 md:px-12 lg:px-20 pt-24 pb-16">
      <div data-section-inner>
        <div data-reveal data-micro className="border border-white/15 rounded-3xl bg-white/[0.04] backdrop-blur p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Contact</p>
          <h3 data-split="chars" className="mt-4 text-4xl md:text-6xl text-white leading-[0.95]">
            Let&apos;s build what&apos;s next.
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Email</p>
              <a className="mt-1 block text-white/85 hover:text-[#e85b25] transition-colors break-all" href={email ? `mailto:${email}` : "#"}>
                {email || "Add email in profile"}
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Phone</p>
              <a className="mt-1 block text-white/85 hover:text-[#e85b25] transition-colors" href={phone ? `tel:${phone}` : "#"}>
                {phone || "Add phone in profile"}
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Location</p>
              <p className="mt-1 text-white/80">{location || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Links</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {links.length ? (
                  links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-white/70 hover:text-[#e85b25] transition-colors"
                    >
                      {link.label}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-white/45">Add LinkedIn or GitHub</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
