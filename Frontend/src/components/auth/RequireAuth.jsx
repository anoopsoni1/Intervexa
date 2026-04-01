import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Redirects to login when no access token. Preserves return path in ?from=
 */
export default function RequireAuth() {
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken")?.trim() || "" : "";
  if (!token) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from || "/templates")}`} replace />;
  }
  return <Outlet />;
}
