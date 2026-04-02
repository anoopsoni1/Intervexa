import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { setUser } from "../../slices/user.slice";
import { API_BASE } from "../../config";

/**
 * Must be nested under RequireAuth. Redirects to /price if user is not Premium.
 * Hydrates Redux user from /profile when token exists but user is missing (refresh).
 */
export default function RequirePremium() {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user?.userData);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken")?.trim() || "" : "";

  const [hydrated, setHydrated] = useState(() => !token || !!user);

  useEffect(() => {
    if (user) {
      setHydrated(true);
      return;
    }
    if (!token) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/profile`, {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (cancelled) return;
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
  }, [user, token, dispatch]);

  const from = `${location.pathname}${location.search}`;

  if (!token) {
    return <Navigate to={`/login?from=${encodeURIComponent(from || "/templates")}`} replace />;
  }
  if (!hydrated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 text-sm">
        Loading…
      </div>
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
