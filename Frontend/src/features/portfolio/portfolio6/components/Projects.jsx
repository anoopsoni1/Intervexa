import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ResumeProjectLink from "../../../../components/resume/ResumeProjectLink";
import HorizontalScroll from "./HorizontalScroll.jsx";
import ProjectCardMedia from "./ProjectCardMedia.jsx";
import ScrambleText from "./ScrambleText.jsx";

export default function Projects({ projects }) {
  const reduced = useReducedMotion();
  const hasProjects = projects.length > 0;

  if (!hasProjects) {
    return (
      <section id="p6-work" className="scroll-mt-24 border-t border-white/[0.07] px-5 py-24 sm:px-8 lg:px-12">
        <div className="p6-reveal-block mx-auto max-w-[1600px] overflow-hidden rounded-2xl border border-dashed border-white/12 bg-gradient-to-br from-white/[0.03] to-transparent px-6 py-20 text-center">
          <p className="text-sm text-white/50">Add projects in your resume details to showcase work here.</p>
          <p className="mt-3 text-xs text-white/30">Tip: include a direct .mp4 or .webm link in the project text for video previews.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="p6-work" className="relative z-10 scroll-mt-20 bg-transparent">
      <div className="relative border-t border-white/[0.07] px-5 pb-10 pt-20 sm:px-8 lg:px-12">
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A65C34]/40 to-transparent opacity-80"
          aria-hidden
        />
        <div className="p6-reveal-block mx-auto flex max-w-[1600px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#A65C34]">Projects</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl md:text-5xl">Projects</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">
              Scroll horizontally on desktop. Cards play video when a video URL is present in your project description.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="font-mono text-[10px] tabular-nums tracking-[0.28em] text-white/30">
              <span className="text-[#A65C34]/90">{String(projects.length).padStart(2, "0")}</span> — CASES
            </div>
            <div className="hidden h-8 w-px bg-white/10 md:block" aria-hidden />
            <p className="hidden max-w-[200px] text-[10px] uppercase leading-relaxed tracking-[0.2em] text-white/25 md:block">
              Drag scroll · Pin section
            </p>
          </div>
        </div>
      </div>

      <HorizontalScroll enabled={!reduced}>
        {projects.map((p, i) => (
          <motion.article
            key={`${p.title}-${i}`}
            className="group relative w-full shrink-0 md:w-[min(88vw,540px)] md:pr-8 lg:pr-12"
            initial={reduced ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.05, 0.2) }}
          >
            <div
              className={`overflow-hidden rounded-2xl border border-white/[0.09] bg-[#030303] shadow-[0_40px_120px_-50px_rgba(0,0,0,0.95)] transition-[border-color,box-shadow] duration-500 ease-out ${
                reduced ? "" : "hover:border-[#A65C34]/25 hover:shadow-[0_48px_140px_-48px_rgba(166,92,52,0.18)]"
              }`}
            >
              <div className="relative aspect-[16/10] overflow-hidden md:aspect-[5/3]">
                <ProjectCardMedia
                  title={p.title}
                  description={p.description}
                  videoUrl={p.videoUrl}
                  index={i}
                />
              </div>

              <div className="relative border-t border-white/[0.06] bg-gradient-to-b from-[#060606] to-[#030303] px-6 py-7 sm:px-8 sm:py-8">
                <div className="absolute left-0 top-0 h-px w-0 bg-gradient-to-r from-[#A65C34] to-transparent transition-[width] duration-700 ease-out group-hover:w-full" />

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] tabular-nums text-white/35">{String(i + 1).padStart(2, "0")}</span>
                      {p.videoUrl ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#A65C34]/90">
                          Video
                        </span>
                      ) : null}
                    </div>
                    <ScrambleText
                      as="h3"
                      className="mt-3 block text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl"
                    >
                      {p.title}
                    </ScrambleText>
                    {p.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/48 transition-colors duration-300 group-hover:text-white/60">
                        {p.description}
                      </p>
                    ) : null}
                    {p.link ? (
                      <p className="mt-2 text-sm">
                        <ResumeProjectLink url={p.link} className="text-[#A65C34] underline hover:text-[#c47a4a]" />
                      </p>
                    ) : null}
                  </div>

                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/70 transition-all duration-500 group-hover:border-[#A65C34]/40 group-hover:bg-[#A65C34]/10 group-hover:text-white"
                    aria-hidden
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </HorizontalScroll>
    </section>
  );
}
