import { ArrowUpRight } from "lucide-react";

const NAV = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function NavLinks({ activeNav, onNavClick, className }) {
  return (
    <nav className={className} aria-label="Primary">
      {NAV.map((item) => {
        const isActive = activeNav === item.id;
        return (
          <a
            key={item.id}
            href={`#p5-${item.id}`}
            data-p5-nav={item.id}
            data-cursor="pointer"
            onClick={(e) => onNavClick(e, item.id)}
            className={`group relative text-[11px] font-medium tracking-[0.2em] transition-colors ${
              isActive ? "text-white" : "text-white/45 hover:text-white/85"
            }`}
          >
            {item.label}
            <span
              className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-white transition-transform duration-300 ${
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}

export default function Navbar({ monogram, activeNav, onNavClick, onContactClick, contactMailto }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-[50] border-b border-white/[0.06] bg-[#060608]/80 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-[1600px] items-center px-5 sm:px-8 lg:h-[4.25rem] lg:px-12">
        <a
          href="#p5-home"
          data-cursor="pointer"
          onClick={(e) => onNavClick(e, "home")}
          className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-sm font-semibold tracking-tight text-white transition-colors hover:border-white/25"
          aria-label="Home"
        >
          {monogram}
        </a>

        <NavLinks
          activeNav={activeNav}
          onNavClick={onNavClick}
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex"
        />

        <a
          href={contactMailto || "#p5-contact"}
          data-cursor="pointer"
          onClick={onContactClick}
          className="relative z-10 ml-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white px-4 py-2.5 text-[11px] font-semibold tracking-wide text-black transition-transform hover:scale-[1.02] active:scale-[0.98] sm:px-5"
        >
          Contact
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </a>
      </div>

      <NavLinks
        activeNav={activeNav}
        onNavClick={onNavClick}
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/[0.04] px-4 py-3 md:hidden"
      />
    </header>
  );
}
