import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiJson } from "../../services/api";
import AuthSessionLoader from "./AuthSessionLoader.jsx";

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
    return (
      <AuthSessionLoader
        className="min-h-[50vh] w-full flex items-center justify-center bg-transparent px-4"
        spinnerClassName="h-8 w-8 text-zinc-400"
      />
    );
  }

  if (!isAuthed) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from || "/templates")}`} replace />;
  }
  return <Outlet />;
}
