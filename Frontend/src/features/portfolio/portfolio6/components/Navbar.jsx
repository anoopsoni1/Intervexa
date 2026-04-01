import { useEffect, useRef } from "react";
import gsap from "gsap";

const NAV = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export default function Navbar({
  monogram,
  menuOpen,
  setMenuOpen,
  activeNav,
  onNavClick,
  onContactClick,
  contactMailto,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return undefined;
    const links = el.querySelectorAll("[data-p6-menu-link]");
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      const items = gsap.utils.toArray(links);
      gsap.fromTo(
        items,
        { y: 56, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.065,
          ease: "power3.out",
          delay: 0.12,
        }
      );
    } else {
      gsap.set(links, { clearProps: "opacity,transform" });
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="p6-site-header fixed left-0 right-0 top-0 z-[70] flex h-16 items-center justify-between px-5 sm:h-[4.25rem] sm:px-8 lg:px-12">
        <a
          href="#p6-home"
          data-cursor="pointer"
          onClick={(e) => {
            setMenuOpen(false);
            onNavClick(e, "home");
          }}
          className="relative z-[80] font-semibold tracking-[0.12em] text-white"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          aria-label="Home"
        >
          {monogram}
        </a>

        <button
          type="button"
          data-cursor="pointer"
          className="relative z-[80] flex h-11 w-11 items-center justify-center text-white"
          aria-expanded={menuOpen}
          aria-controls="p6-menu-overlay"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="relative block h-3 w-7">
            <span
              className={`absolute left-0 top-1/2 block h-px w-7 -translate-y-1/2 bg-white transition-transform duration-300 ${
                menuOpen ? "rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 block h-px w-7 -translate-y-1/2 bg-white transition-transform duration-300 ${
                menuOpen ? "-rotate-45" : "translate-y-1.5"
              }`}
            />
          </span>
        </button>
      </header>

      <div
        id="p6-menu-overlay"
        ref={overlayRef}
        className={`fixed inset-0 z-[65] flex flex-col bg-black transition-[clip-path,visibility] duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          menuOpen ? "visible" : "invisible pointer-events-none"
        }`}
        style={{
          clipPath: menuOpen ? "circle(150% at 100% 0%)" : "circle(0% at 100% 0%)",
        }}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-1 flex-col justify-center gap-2 px-8 pb-24 pt-28 sm:px-16 lg:px-24">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.4em] text-[#A65C34]">Menu</p>
          {NAV.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={`#p6-${item.id}`}
                data-p6-menu-link
                data-p6-nav={item.id}
                data-cursor="pointer"
                onClick={(e) => {
                  onNavClick(e, item.id);
                  setMenuOpen(false);
                }}
                className={`block origin-left border-b border-white/[0.08] py-5 text-4xl font-semibold tracking-[-0.03em] transition-colors sm:text-5xl md:text-6xl ${
                  isActive ? "text-white" : "text-white/50 hover:text-white/90"
                }`}
                style={{ perspective: "800px" }}
              >
                {item.label}
              </a>
            );
          })}
          <a
            href={contactMailto || "#p6-contact"}
            data-p6-menu-link
            data-cursor="pointer"
            onClick={(e) => {
              onContactClick(e);
              setMenuOpen(false);
            }}
            className="mt-8 inline-flex w-max border-b border-white pb-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white"
          >
            Request a project
          </a>
        </div>
      </div>
    </>
  );
}
