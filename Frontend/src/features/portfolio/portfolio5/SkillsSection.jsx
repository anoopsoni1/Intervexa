import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.06 },
  },
};

const card = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function skillHue(label) {
  const s = String(label);
  let h = 200;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 7)) % 360;
  return h;
}

export default function SkillsSection({ skills }) {
  const reduced = useReducedMotion();
  if (!skills?.length) return null;

  return (
    <div className="mt-12 sm:mt-14">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-50 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(120, 160, 255, 0.2) 0%, transparent 65%)",
          }}
          aria-hidden
        />
        <div className="relative rounded-[1.6rem] bg-[#060608]/80 px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-7">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06]">
                <Sparkles className="h-[18px] w-[18px] text-white/55" strokeWidth={1.25} aria-hidden />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/40">Skills</p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">Tools & technologies</h3>
              </div>
            </div>
            <p className="text-[10px] tabular-nums tracking-[0.25em] text-white/30">
              {String(skills.length).padStart(2, "0")} · ITEMS
            </p>
          </div>

          <motion.div
            className="mt-6 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-3 lg:gap-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-6%" }}
          >
            {skills.map((s, i) => {
              const h = skillHue(s);
              return (
                <motion.div
                  key={s}
                  variants={card}
                  className="group relative"
                  whileHover={reduced ? undefined : { y: -2 }}
                  transition={{ duration: 0.22 }}
                >
                  <div
                    className="relative flex min-h-[52px] items-center gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-[border-color,box-shadow] duration-300 hover:border-white/18 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.85)] sm:min-h-0 sm:rounded-2xl sm:py-3.5"
                    style={{
                      boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 12px 40px -22px hsla(${h}, 55%, 48%, 0.45)`,
                    }}
                  >
                    <span
                      className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-white/0 via-white/[0.07] to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      aria-hidden
                    />
                    <span className="font-mono text-[10px] tabular-nums tracking-wider text-white/25">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative text-sm font-medium leading-snug tracking-wide text-white/90">{s}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
