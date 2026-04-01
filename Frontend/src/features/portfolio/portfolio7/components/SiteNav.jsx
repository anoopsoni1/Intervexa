import { forwardRef, useMemo } from "react";
import { Mail } from "lucide-react";

function monogramFromName(name) {
  const p = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!p.length) return "P7";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const SiteNav = forwardRef(function SiteNav({ items, onNavigate, activeId, displayName, displayRole, onContact }, ref) {
  const list = useMemo(() => items.filter((i) => i.show !== false), [items]);
  const m = monogramFromName(displayName);

  if (!list.length) return null;

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-[90] px-3 pt-3 sm:px-5 sm:pt-4 md:px-8">
      <div
        ref={ref}
        className="p7-header-shell pointer-events-auto relative mx-auto w-full  overflow-hidden rounded-2xl border border-white/[0.14] bg-black/45 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-[background-color,box-shadow,border-color,transform] duration-300 ease-out md:rounded-[1.35rem]"
        style={{
          boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3 md:px-5 md:py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
            <button
              type="button"
              data-magnetic
              data-micro
              onClick={() => onNavigate("p7-hero")}
              className="group flex shrink-0 items-center gap-3 rounded-xl text-left outline-none transition-transform active:scale-[0.98]"
              aria-label="Back to intro"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/18 bg-gradient-to-br from-white/[0.12] to-white/[0.02] font-semibold tracking-tight text-white shadow-inner shadow-white/10 transition-colors group-hover:border-[#e85b25]/45 group-hover:text-[#ffb08a] md:h-12 md:w-12">
                {m}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-tight text-white md:text-base">{displayName}</span>
                <span className="mt-0.5 block truncate text-[10px] uppercase tracking-[0.2em] text-white/45 md:text-[11px]">
                  {displayRole || "Portfolio"}
                </span>
              </span>
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0 sm:pl-2 md:border-l md:border-white/10 md:pl-5">
              <button
                type="button"
                data-magnetic
                data-micro
                onClick={onContact}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#e85b25]/50 hover:text-[#ffb08a] sm:hidden"
                aria-label="Contact"
              >
                <Mail size={18} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                data-magnetic
                data-micro
                onClick={onContact}
                className="hidden rounded-full border border-[#e85b25]/50 bg-[#e85b25]/15 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#ffd4bf] transition-colors hover:bg-[#e85b25]/30 sm:inline-block"
              >
                Contact
              </button>
            </div>
          </div>

          <nav className="relative -mx-1 min-w-0 flex-1 pr-10 sm:pr-14 md:pr-0" aria-label="Section navigation">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-6 bg-gradient-to-r from-black/80 to-transparent sm:w-8" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-6 bg-gradient-to-l from-black/80 to-transparent sm:w-8" />
            <ul
              className="flex snap-x snap-mandatory gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain px-2 py-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {list.map(({ id, label }) => (
                <li key={id} className="snap-start shrink-0">
                  <button
                    type="button"
                    data-magnetic
                    data-micro
                    onClick={() => onNavigate(id)}
                    className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition-all duration-200 md:px-3.5 md:py-2 md:text-[11px] ${
                      activeId === id
                        ? "bg-[#e85b25] text-black shadow-[0_0_20px_rgba(232,91,37,0.35)]"
                        : "text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          className="p7-header-progress h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#e85b25] via-white/70 to-[#e85b25] opacity-90"
          aria-hidden
        />
      </div>
    </header>
  );
});

export default SiteNav;
