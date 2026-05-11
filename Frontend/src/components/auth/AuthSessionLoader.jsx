import { Loader2 } from "lucide-react";

/**
 * Centered spinner while session or route auth is resolved.
 */
export default function AuthSessionLoader({
  className = "min-h-screen w-full flex items-center justify-center bg-black px-4",
  spinnerClassName = "h-10 w-10 text-white/90",
}) {
  return (
    <div className={className} role="status" aria-label="Loading">
      <Loader2 className={`animate-spin ${spinnerClassName}`} aria-hidden />
    </div>
  );
}
