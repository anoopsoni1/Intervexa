import { motion, useReducedMotion } from "framer-motion";
import SkillsSection from "./SkillsSection.jsx";

export default function About({ summary, skills, experiences, educationText }) {
  const reduced = useReducedMotion();
  const hasExp = experiences.some((e) => e.title);

  return (
    <section
      id="p5-about"
      className="scroll-mt-24 border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
    >
      <div className="p5-reveal-block mx-auto max-w-8xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">About</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">Story & focus</h2>
            <motion.p
              className="mt-8 max-w-xl text-base leading-[1.75] text-white/60 sm:text-[1.05rem]"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.7 }}
            >
              {summary}
            </motion.p>

            <SkillsSection skills={skills} />

            {educationText ? (
              <div className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">Education</p>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/55">{educationText}</p>
              </div>
            ) : null}
          </div>

          <div className="lg:pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">Experience</p>
            <div className="mt-4 h-px w-20 bg-gradient-to-r from-white/50 to-transparent" />
            <div className="mt-10 space-y-10">
              {hasExp ? (
                experiences.map((ex, i) =>
                  ex.title ? (
                    <motion.div
                      key={`ex-${i}`}
                      className="border-b border-white/[0.06] pb-10 last:border-0 last:pb-0"
                      initial={reduced ? false : { opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-5%" }}
                      transition={{ delay: Math.min(i * 0.06, 0.3), duration: 0.6 }}
                    >
                      <h3 className="text-base font-medium leading-snug text-white sm:text-lg">{ex.title}</h3>
                      {ex.bullets.length ? (
                        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-white/50">
                          {ex.bullets.map((b, j) => (
                            <li key={j} className="flex gap-3">
                              <span className="mt-2 h-px w-8 shrink-0 bg-white/20" aria-hidden />
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
          </div>
        </div>
      </div>
    </section>
  );
}
