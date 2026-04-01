import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export function useProfileAuthCheck({ accessToken, hasToken, onUnauthorized, onUserLoaded }) {
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      setAuthChecking(true);
      try {
        const headers = hasToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401 && typeof onUnauthorized === "function") {
            onUnauthorized();
          }
          return;
        }

        const currentUser = data?.user || data?.data?.user;
        if (currentUser && typeof onUserLoaded === "function") {
          onUserLoaded(currentUser);
        }
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [accessToken, hasToken, onUnauthorized, onUserLoaded]);

  return { authChecking };
}
