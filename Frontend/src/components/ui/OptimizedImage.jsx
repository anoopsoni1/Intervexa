import { forwardRef } from "react";

/**
 * Lazy/async decoding by default; set priority for LCP (e.g. header logo).
 */
const OptimizedImage = forwardRef(function OptimizedImage(
  {
    alt = "",
    loading,
    decoding = "async",
    fetchPriority,
    className = "",
    ...props
  },
  ref
) {
  const resolvedLoading = loading ?? (fetchPriority === "high" ? "eager" : "lazy");
  return (
    <img
      ref={ref}
      alt={alt}
      loading={resolvedLoading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      className={className}
      {...props}
    />
  );
});

export default OptimizedImage;
