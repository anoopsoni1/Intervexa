import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { setUser } from "../../slices/user.slice";
import { apiJson } from "../../services/api";
import AuthSessionLoader from "./AuthSessionLoader.jsx";

/**
 * Must be nested under RequireAuth. Redirects to /price if user is not Premium.
 * Hydrates Redux user from /profile when cookie session exists but user is missing (refresh).
 */
export default function RequirePremium() {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user?.userData);
  const [hydrated, setHydrated] = useState(() => !!user);
  const [isAuthed, setIsAuthed] = useState(true);

  useEffect(() => {
    if (user) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    apiJson("/api/v1/user/profile", { method: "GET" })
      .then(({ res, data }) => {
        if (cancelled) return;
        if (!res.ok) {
          setIsAuthed(false);
          return;
        }
        const u = data?.user || data?.data?.user;
        if (u) dispatch(setUser(u));
      })
      .catch(() => {
        /* CORS / offline — still unblock UI */
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, dispatch]);

  const from = `${location.pathname}${location.search}`;

  if (!isAuthed) {
    return <Navigate to={`/login?from=${encodeURIComponent(from || "/templates")}`} replace />;
  }
  if (!hydrated) {
    return (
      <AuthSessionLoader
        className="min-h-[50vh] w-full flex items-center justify-center bg-transparent px-4"
        spinnerClassName="h-8 w-8 text-zinc-400"
      />
    );
  }
  if (!user) {
    return <Navigate to={`/login?from=${encodeURIComponent(from || "/templates")}`} replace />;
  }
  if (!user.Premium) {
    return <Navigate to={`/price?from=${encodeURIComponent(from)}`} replace />;
  }
  return <Outlet />;
}
