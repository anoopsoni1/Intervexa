import { createElement } from "react";

/** Site-wide footer line; year updates at runtime. suppressHydrationWarning avoids SSG/client year mismatch (React #418). */
export function intervexaCopyrightLine() {
  return createElement(
    "span",
    { suppressHydrationWarning: true },
    `© ${new Date().getFullYear()} Ansoyal AI. All rights reserved.`,
  );
}
