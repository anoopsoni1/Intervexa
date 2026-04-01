/**
 * Base pulse skeleton; use className for width/height/shape.
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      role="presentation"
      className={`animate-pulse rounded-lg bg-white/[0.08] ${className}`.trim()}
      {...props}
    />
  );
}
