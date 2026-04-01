/** Static ambient wash above WebGL (no scroll-driven motion). */
export default function AmbientScrollBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-screen opacity-[0.42]"
      style={{
        background: `
          radial-gradient(ellipse 130% 90% at 50% 35%, rgba(232, 91, 37, 0.12), transparent 52%),
          radial-gradient(ellipse 80% 55% at 82% 28%, rgba(120, 140, 255, 0.05), transparent 48%),
          radial-gradient(ellipse 70% 50% at 18% 72%, rgba(255, 255, 255, 0.03), transparent 45%),
          linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.18) 34%, rgba(0, 0, 0, 0.22) 68%, rgba(0, 0, 0, 0.78) 100%)
        `,
      }}
    />
  );
}
