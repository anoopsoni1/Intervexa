import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

/**
 * Smooth count-up/down when `value` changes (0–100).
 * @param {{ value: number; className?: string; showPercent?: boolean }} props
 */
export function AnimatedPercentText({ value, className = "", showPercent = true }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const target =
      typeof value === "number" && !Number.isNaN(value) ? Math.min(100, Math.max(0, value)) : 0;
    const start = fromRef.current;
    const controls = animate(start, target, {
      duration: 0.88,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => {
        fromRef.current = target;
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className={`tabular-nums ${className}`.trim()}>
      {display}
      {showPercent ? "%" : null}
    </span>
  );
}
