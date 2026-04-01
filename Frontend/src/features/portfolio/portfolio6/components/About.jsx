import { motion, useReducedMotion } from "framer-motion";

export default function About({ summary, experiences, educationText }) {
  const reduced = useReducedMotion();
  const hasExp = experiences.some((e) => e.title);

  return (
    <section
      id="p6-about"
      className="relative z-20 -mt-16 scroll-mt-24 rounded-t-[1.75rem] border-t border-white/[0.07] bg-black/20 px-5 py-24 backdrop-blur-[2px] sm:px-8 md:-mt-24 lg:px-12 lg:py-36"
    >
      <div className="p6-reveal-block mx-auto max-w-[1600px]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#A65C34]">About</p>
        <div className="mt-8 grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:gap-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl md:text-5xl">
             About Me
            </h2>
            <motion.p
              className="mt-8 max-w-xl text-base leading-[1.8] text-white/58 sm:text-[1.05rem]"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.75 }}
            >
              {summary}
            </motion.p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/35">Experience</p>
            <div className="mt-4 h-px w-16 bg-gradient-to-r from-[#A65C34] to-transparent" />
            <div className="mt-10 space-y-10">
              {hasExp ? (
                experiences.map((ex, i) =>
                  ex.title ? (
                    <motion.div
                      key={`p6-ex-${i}`}
                      className="border-b border-white/[0.06] pb-10 last:border-0 last:pb-0"
                      initial={reduced ? false : { opacity: 0, y: 22 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-5%" }}
                      transition={{ delay: Math.min(i * 0.07, 0.35), duration: 0.6 }}
                    >
                      <h3 className="text-base font-medium leading-snug text-white sm:text-lg">{ex.title}</h3>
                      {ex.bullets.length ? (
                        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-white/48">
                          {ex.bullets.map((b, j) => (
                            <li key={j} className="flex gap-3">
                              <span className="mt-2 h-px w-6 shrink-0 bg-[#A65C34]/60" aria-hidden />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </motion.div>
                  ) : null
                )
              ) : (
                <p className="text-sm text-white/40">Add experience entries in your resume details.</p>
              )}
            </div>

            {educationText ? (
              <div className="mt-12 rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">Education</p>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/55">{educationText}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
