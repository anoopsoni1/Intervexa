import { Github, Linkedin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

/**
 * Left rail — scroll line + socials (desktop). Links use only resume detail fields.
 */
export default function SidebarSocial({ linkedinHref, githubHref, waHref }) {
  const items = [
    linkedinHref ? { href: linkedinHref, label: "LinkedIn", Icon: Linkedin, lucide: true } : null,
    waHref ? { href: waHref, label: "WhatsApp", Icon: FaWhatsapp, lucide: false } : null,
    githubHref ? { href: githubHref, label: "GitHub", Icon: Github, lucide: true } : null,
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <aside
      className="pointer-events-none fixed left-4 top-1/2 z-[45] hidden -translate-y-1/2 flex-col items-center xl:left-8"
      aria-hidden
    >
      <div className="pointer-events-auto flex flex-col items-center gap-6">
        <div className="flex h-24 w-px flex-col items-center bg-gradient-to-b from-transparent via-white/25 to-transparent">
          <span className="-mt-1 h-1 w-1 rounded-full bg-white/40" />
          <span className="mt-auto mb-0 h-1 w-1 rounded-full bg-white/40" />
        </div>
        <div className="flex flex-col gap-4">
          {items.map(({ href, label, Icon, lucide }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="pointer"
              className="pointer-events-auto text-white/50 transition-colors hover:text-white"
              aria-label={label}
            >
              {lucide ? <Icon className="h-[18px] w-[18px]" strokeWidth={1.35} /> : <Icon className="h-[18px] w-[18px]" />}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
