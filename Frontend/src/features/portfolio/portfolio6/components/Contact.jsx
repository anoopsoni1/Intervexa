import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Contact({
  name,
  email,
  phone,
  linkedinHref,
  githubHref,
}) {
  const digits = phone ? String(phone).replace(/\D/g, "") : "";
  const waHref = digits.length >= 10 ? `https://wa.me/${digits}` : "";

  const rows = [
    email ? { href: `mailto:${email}`, label: "Email", value: email, Icon: Mail } : null,
    phone ? { href: `tel:${digits}`, label: "Phone", value: phone, Icon: Phone } : null,
    linkedinHref ? { href: linkedinHref, label: "LinkedIn", value: "Profile", Icon: Linkedin, external: true } : null,
    githubHref ? { href: githubHref, label: "GitHub", value: "Repositories", Icon: Github, external: true } : null,
    waHref
      ? { href: waHref, label: "WhatsApp", value: "Message", Icon: FaWhatsapp, external: true, isFa: true }
      : null,
  ].filter(Boolean);

  return (
    <footer
      id="p6-contact"
      className="relative z-10 scroll-mt-24 border-t border-white/[0.07] bg-black/25 px-5 py-24 backdrop-blur-[2px] sm:px-8 lg:px-12 lg:py-32"
    >
      <div className="p6-reveal-block mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#A65C34]">Contact</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl md:text-5xl">
              Let&apos;s talk
            </h2>
            {email ? <p className="mt-4 max-w-md text-sm text-white/50">{email}</p> : null}
          </div>
        </div>

        <motion.div
          className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          {rows.map((row) => {
            const Icon = row.Icon;
            return (
              <a
                key={row.label}
                href={row.href}
                target={row.external ? "_blank" : undefined}
                rel={row.external ? "noopener noreferrer" : undefined}
                data-cursor="pointer"
                className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 transition-colors hover:border-[#A65C34]/40 hover:bg-white/[0.04]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {row.isFa ? (
                    <Icon className="h-4 w-4 shrink-0 text-white/55" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4 shrink-0 text-white/55" strokeWidth={1.25} aria-hidden />
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">{row.label}</span>
                </span>
                <span className="truncate text-sm text-white/80 group-hover:text-white">{row.value}</span>
              </a>
            );
          })}
        </motion.div>

        {rows.length === 0 ? (
          <p className="mt-8 text-sm text-white/40">Add email, phone, or social links in your resume details.</p>
        ) : null}

        <p className="mt-16 text-[10px] tracking-[0.22em] text-white/25">
          © {new Date().getFullYear()} {name}.
        </p>
      </div>
    </footer>
  );
}
