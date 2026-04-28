export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // Frontend and backend run on different domains in production.
    // Cross-site auth cookies require SameSite=None and Secure=true.
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export function getClearCookieOptions() {
  const options = getAuthCookieOptions();
  return {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  };
}
