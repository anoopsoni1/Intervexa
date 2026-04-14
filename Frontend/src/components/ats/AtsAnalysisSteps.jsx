import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Hexagon } from "lucide-react";

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const STEPS = [
  { id: "experience", label: "Analyzing your experience" },
  { id: "skills", label: "Extracting your skills" },
  { id: "recommendations", label: "Generating recommendations" },
];

function StepIcon({ isActive, isPast }) {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center sm:h-14 sm:w-14">
      <MotionDiv
        className="absolute inset-0 flex items-center justify-center"
        animate={isActive ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isActive ? { repeat: Infinity, duration: 2.8, ease: "linear" } : { duration: 0.25 }
        }
      >
        <Hexagon
          className={`h-11 w-11 sm:h-14 sm:w-14 ${
            isActive
              ? "text-indigo-400 drop-shadow-[0_0_14px_rgba(129,140,248,0.5)]"
              : isPast
                ? "text-emerald-500/75"
                : "text-slate-600"
          }`}
          strokeWidth={1.75}
          aria-hidden
        />
      </MotionDiv>

      <span className="relative z-10 flex h-6 w-6 items-center justify-center sm:h-8 sm:w-8">
        {isPast ? (
          <Check className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" strokeWidth={2.5} aria-hidden />
        ) : isActive ? (
          <MotionSpan
            className="inline-block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.85)]"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
          />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600" aria-hidden />
        )}
      </span>
    </div>
  );
}

/**
 * Horizontal ATS analysis steps with rotating hexagon on the active phase.
 * @param {{ running: boolean }} props
 */
export default function AtsAnalysisSteps({ running }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % STEPS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <div
      className="w-full max-w-3xl px-1"
      role="status"
      aria-live="polite"
      aria-label={`Analysis step ${phase + 1} of ${STEPS.length}: ${STEPS[phase]?.label ?? ""}`}
    >
      <div className="flex w-full flex-row flex-nowrap items-start justify-center gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-between sm:gap-2 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {STEPS.flatMap((step, i) => {
          const isActive = running && phase === i;
          const isPast = running && i < phase;

          const column = (
            <div
              key={step.id}
              className="flex min-w-[6rem] shrink-0 flex-col items-center text-center sm:min-w-0 sm:flex-1"
            >
              <StepIcon isActive={isActive} isPast={isPast} />
              <p
                className={`mt-3 text-xs font-medium leading-snug sm:text-[13px] ${
                  isActive ? "text-white" : isPast ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {step.label}
              </p>
            </div>
          );

          if (i >= STEPS.length - 1) return [column];

          const connector = (
            <div
              key={`${step.id}-connector`}
              className="mt-7 h-px w-4 shrink-0 bg-linear-to-r from-indigo-500/20 via-indigo-500/45 to-indigo-500/20 sm:w-8 md:w-14"
              aria-hidden
            />
          );

          return [column, connector];
        })}
      </div>
    </div>
  );
}
