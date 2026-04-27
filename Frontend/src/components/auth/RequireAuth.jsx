import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiJson } from "../../services/api";

/**
 * Redirects to login when no auth cookie/session. Preserves return path in ?from=
 */
export default function RequireAuth() {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { res } = await apiJson("/api/v1/user/profile", { method: "GET" });
        if (!cancelled) setIsAuthed(res.ok);
      } catch {
        if (!cancelled) setIsAuthed(false);
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isChecking) {
    return <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 text-sm">Loading…</div>;
  }

  if (!isAuthed) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from || "/templates")}`} replace />;
  }
  return <Outlet />;
}
