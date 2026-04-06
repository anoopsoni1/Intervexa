import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Layers } from "lucide-react";
import ResumeProjectLink from "../../../components/resume/ResumeProjectLink";

const list = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const card = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

const noiseBg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

function skillHue(label) {
  const s = String(label);
  let h = 210;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 11)) % 360;
  return h;
}

function projectInitials(title) {
  const words = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "PR";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

/** Short label from description (first segment before . or newline) for the visual tag */
function previewTag(description, title) {
  const d = String(description || "").trim();
  if (!d) return "Case study";
  const line = d.split(/[.!?]/)[0].trim();
  if (line.length <= 42) return line;
  return `${line.slice(0, 40)}…`;
}

export default function Work({ projects }) {
  const reduced = useReducedMotion();

  return (
    <section
      id="p5-work"
      className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
    >
      <div className="p5-reveal-block mx-auto max-w-8xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">Selected work</p>
            <div className="mt-3 h-px w-12 bg-gradient-to-r from-white/50 to-transparent" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
              Projects
            </h2>
          </div>
          {projects.length > 0 ? (
            <p className="text-[10px] tabular-nums tracking-[0.28em] text-white/30">
              {String(projects.length).padStart(2, "0")} · CASE STUDIES
            </p>
          ) : null}
        </div>

        {projects.length > 0 ? (
          <motion.div
            className="mt-16 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:gap-10"
            variants={list}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-8%" }}
          >
            {projects.map((p, i) => {
              const hue = skillHue(p.title);
              const initials = projectInitials(p.title);
              const tag = previewTag(p.description, p.title);
              const h2 = (hue + 180) % 360;

              return (
                <motion.article
                  key={`${p.title}-${i}`}
                  variants={card}
                  className="group relative"
                  whileHover={reduced ? undefined : { y: -6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <div
                    className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.07] bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-[border-color,box-shadow,transform] duration-500 ease-out sm:rounded-3xl sm:duration-700"
                    style={{
                      boxShadow: "0 24px 80px -40px rgba(0,0,0,0.75)",
                    }}
                  >
                    {/* Hover ring */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[1.35rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:rounded-3xl"
                      style={{
                        boxShadow: `inset 0 0 0 1px hsla(${hue}, 45%, 55%, 0.25), 0 0 60px -20px hsla(${hue}, 50%, 45%, 0.15)`,
                      }}
                    />

                    <div className="relative aspect-[16/11] overflow-hidden sm:aspect-[5/3]" data-cursor="pointer">
                      {/* Slow drift gradients (disabled when reduced motion) */}
                      {reduced ? (
                        <div
                          className="absolute inset-[-20%] opacity-90"
                          style={{
                            background: `
                            radial-gradient(ellipse 85% 75% at 70% 20%, hsla(${hue}, 58%, 46%, 0.55) 0%, transparent 58%),
                            radial-gradient(ellipse 65% 60% at 12% 88%, hsla(${h2}, 48%, 38%, 0.35) 0%, transparent 55%),
                            linear-gradient(168deg, rgba(255,255,255,0.09) 0%, rgba(8,8,10,0.98) 100%)
                          `,
                          }}
                        />
                      ) : (
                        <motion.div
                          className="absolute inset-[-20%] opacity-90"
                          style={{
                            background: `
                            radial-gradient(ellipse 85% 75% at 70% 20%, hsla(${hue}, 58%, 46%, 0.55) 0%, transparent 58%),
                            radial-gradient(ellipse 65% 60% at 12% 88%, hsla(${h2}, 48%, 38%, 0.35) 0%, transparent 55%),
                            linear-gradient(168deg, rgba(255,255,255,0.09) 0%, rgba(8,8,10,0.98) 100%)
                          `,
                          }}
                          animate={{
                            scale: [1, 1.04, 1],
                            x: [0, 6, 0],
                            y: [0, -4, 0],
                          }}
                          transition={{
                            duration: 14,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[46%] bg-gradient-to-t from-[#060608]/88 via-[#060608]/25 to-transparent"
                        aria-hidden
                      />

                      <div
                        className="absolute inset-0 z-[2] opacity-[0.18] mix-blend-overlay"
                        style={{
                          backgroundImage: noiseBg,
                          backgroundSize: "96px 96px",
                        }}
                      />

                      <div
                        className="absolute inset-0 z-[2] opacity-[0.12]"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                          backgroundSize: "32px 32px",
                        }}
                      />

                      <span
                        className="pointer-events-none absolute right-4 top-4 z-[3] font-mono text-[clamp(3.5rem,12vw,5.5rem)] font-extralight leading-none tabular-nums text-white/[0.06] sm:right-5 sm:top-5"
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-1 p-8">
                        <motion.span
                          className="text-center text-[clamp(2.25rem,8vw,3.75rem)] font-extralight tracking-[0.18em] text-white/[0.94] drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                          whileHover={reduced ? undefined : { scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 380, damping: 24 }}
                        >
                          {initials}
                        </motion.span>
                        <p className="max-w-[90%] text-center text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
                          {tag}
                        </p>
                      </div>

                      <div className="absolute inset-0 z-[4] flex flex-col justify-end p-6 sm:p-7">
                        <div className="translate-y-3 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/75">
                            View project
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                          </span>
                          <p className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed text-white/88">
                            {p.description || p.title}
                          </p>
                        </div>
                      </div>

                      <motion.div
                        className="absolute bottom-5 right-5 z-[5] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100 sm:bottom-6 sm:right-6"
                        whileHover={reduced ? undefined : { scale: 1.08 }}
                        aria-hidden
                      >
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                      </motion.div>
                    </div>

                    <div className="relative border-t border-white/[0.06] bg-[#060608]/40 px-5 py-5 sm:px-7 sm:py-6">
                      <div className="absolute left-0 top-0 h-px w-0 bg-gradient-to-r from-white/40 to-transparent transition-[width] duration-500 group-hover:w-full" />
                      <span className="inline-flex items-center gap-2 text-[10px] font-medium tabular-nums tracking-[0.22em] text-white/38">
                        <Layers className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold tracking-tight text-white sm:text-xl">{p.title}</h3>
                      {p.description ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-[1.65] text-white/48">{p.description}</p>
                      ) : null}
                      {p.link ? (
                        <p className="mt-2 text-sm">
                          <ResumeProjectLink url={p.link} className="text-white/70 underline hover:text-white" />
                        </p>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        ) : (
          <div className="mt-14 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-14 text-center">
            <p className="text-sm text-white/45">Add projects in your resume details to showcase work here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
