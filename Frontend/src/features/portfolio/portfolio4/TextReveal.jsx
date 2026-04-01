import { motion } from "framer-motion";

/** Word-by-word reveal for headings / paragraphs. */
export function TextRevealWords({ text, className = "", delay = 0, stagger = 0.04 }) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block mr-[0.28em] last:mr-0"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.55, delay: delay + i * stagger, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}
