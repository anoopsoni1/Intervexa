import { motion, useReducedMotion } from "framer-motion";
import ScrambleText from "./ScrambleText.jsx";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

function skillHue(label) {
  let h = 24;
  const s = String(label);
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 3)) % 360;
  return h;
}

export default function Services({ skills }) {
  const reduced = useReducedMotion();
  const list = skills.length ? skills : [];
  const featured = list.length >= 5;

  return (
    <section
      id="p6-services"
      className="relative z-20 scroll-mt-24 overflow-hidden bg-transparent px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(166, 92, 52, 0.07), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(255,255,255,0.03), transparent 50%)",
        }}
      />

      <div className="p6-reveal-block relative mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mt-4 flex flex-wrap items-center gap-5 sm:gap-8">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl md:text-5xl">
                Skills
              </h2>
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 sm:h-12 sm:w-12"
                aria-hidden
              >
                <span className="h-1.5 w-1.5 rounded-[1px] bg-[#A65C34] shadow-[0_0_12px_rgba(166,92,52,0.6)]" />
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">
              Each block pulls from your profile — hover to reveal the scramble.
            </p>
          </div>
          {list.length ? (
            <div className="flex items-baseline gap-2 font-mono text-[10px] tabular-nums tracking-[0.28em] text-white/30">
              <span className="text-[#A65C34]/80">{String(list.length).padStart(2, "0")}</span>
              <span>FOCUS AREAS</span>
            </div>
          ) : null}
        </div>

        {list.length ? (
          <motion.div
            className="mt-16 grid auto-rows-auto gap-4 sm:grid-cols-2 xl:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-12%" }}
          >
            {list.map((skill, i) => {
              const hue = skillHue(skill);
              const isHero = featured && i === 0;
              return (
                <motion.div
                  key={`${skill}-${i}`}
                  variants={item}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#050505] p-8 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow,transform] duration-500 md:p-10 ${
                    isHero ? "xl:col-span-2 xl:min-h-[280px]" : "min-h-[200px] sm:min-h-[220px]"
                  } ${reduced ? "" : "hover:-translate-y-1 hover:border-[#A65C34]/35 hover:shadow-[0_32px_100px_-40px_rgba(166,92,52,0.12)]"}`}
                  whileHover={reduced ? undefined : { y: -4 }}
                >
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                    style={{
                      background: `radial-gradient(circle, hsla(${hue}, 55%, 45%, 0.45) 0%, transparent 70%)`,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(166,92,52,0.08) 0%, transparent 42%, rgba(255,255,255,0.02) 100%)",
                      }}
                    />
                  </div>

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] font-mono text-[10px] font-medium tabular-nums text-white/40 transition-colors duration-300 group-hover:border-[#A65C34]/40 group-hover:text-[#A65C34]/90"
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/20 transition-colors group-hover:text-white/35"
                        aria-hidden
                      >
                        stack
                      </span>
                    </div>

                    <ScrambleText
                      as="h3"
                      className={`mt-auto font-semibold tracking-[-0.02em] text-white transition-colors duration-300 group-hover:text-white ${
                        isHero ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg sm:text-xl md:text-2xl"
                      }`}
                    >
                      {skill}
                    </ScrambleText>

                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-px flex-1 origin-left scale-x-50 bg-gradient-to-r from-[#A65C34]/80 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                      <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.25em] text-white/25 transition-colors group-hover:text-[#A65C34]/70">
                        focus
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="mt-14 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-8 py-16 text-center backdrop-blur-sm">
            <p className="text-sm text-white/45">
              Add capabilities in your resume details to populate this grid.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
