import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import SplitType from "split-type";

export default function Hero({
  labelName,
  roleLine1,
  roleLine2,
  summary,
}) {
  const reduced = useReducedMotion();
  const filterId = useId().replace(/:/g, "");
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (reduced || !line1Ref.current) return undefined;

    const st1 = new SplitType(line1Ref.current, { types: "words" });
    const st2 = line2Ref.current
      ? new SplitType(line2Ref.current, { types: "words" })
      : null;
    const stLabel = labelRef.current ? new SplitType(labelRef.current, { types: "chars" }) : null;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (stLabel?.chars?.length) {
      tl.from(stLabel.chars, { opacity: 0, y: 12, stagger: 0.02, duration: 0.5 }, 0);
    }
    if (st1.words?.length) {
      tl.from(st1.words, { opacity: 0, y: 36, stagger: 0.06, duration: 0.75 }, 0.15);
    }
    if (st2?.words?.length) {
      tl.from(st2.words, { opacity: 0, y: 28, stagger: 0.05, duration: 0.65 }, 0.35);
    }

    return () => {
      st1.revert();
      st2?.revert();
      stLabel?.revert();
    };
  }, [reduced, roleLine1, roleLine2, labelName]);

  const l1 = roleLine1 || "Creative development";
  const l2 = roleLine2 || "";

  return (
    <section
      id="p6-home"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden px-5 pb-16 pt-28 sm:px-8 sm:pb-24 lg:px-12"
    >
      {/* Light local grid (global AmbientBackground carries main grid) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Liquid portrait zone */}
      <div className="pointer-events-none absolute left-1/2 top-[8%] z-0 h-[min(68vh,560px)] w-[min(88vw,420px)] -translate-x-1/2 md:top-[10%]">
        <svg className="absolute h-0 w-0" aria-hidden>
          <defs>
            <filter id={`${filterId}-liquid`} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.08"
                numOctaves="3"
                seed="3"
                result="noise"
              >
                <animate attributeName="baseFrequency" dur="10s" values="0.012 0.08;0.018 0.1;0.012 0.08" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="42" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <div
          className="h-full w-full rounded-[2px] opacity-[0.35] mix-blend-screen"
          style={{
            filter: `url(#${filterId}-liquid) grayscale(1) contrast(1.1) brightness(0.55)`,
            background:
              "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(166,92,52,0.25), transparent 60%), radial-gradient(circle at 50% 35%, rgba(255,255,255,0.12), rgba(0,0,0,0.9))",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <p
          ref={labelRef}
          className="max-w-[min(100%,52rem)] text-[10px] font-semibold uppercase leading-relaxed tracking-[0.45em] text-[#A65C34]"
        >
          {labelName}
        </p>

        <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-baseline md:gap-4 lg:gap-8">
          <h1
            ref={line1Ref}
            className="max-w-[14ch] text-[clamp(2.75rem,11vw,6rem)] font-bold leading-[0.92] tracking-[-0.04em] text-white"
          >
            {l1}
            {l1.trim().endsWith("/") ? "" : ""}
          </h1>
          {l2 ? (
            <h2
              ref={line2Ref}
              className="max-w-[16ch] text-[clamp(2.75rem,11vw,6rem)] font-bold leading-[0.92] tracking-[-0.04em] text-transparent [text-stroke:1px_rgba(255,255,255,0.92)] [-webkit-text-stroke:1px_rgba(255,255,255,0.92)]"
            >
              {l2}
            </h2>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-xl text-sm leading-relaxed text-white/65 sm:text-base"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            {summary}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
