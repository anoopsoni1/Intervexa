import { useEffect, useState } from "react";
import { apiJson } from "../services/api";

export function useProfileAuthCheck({ onUnauthorized, onUserLoaded }) {
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      setAuthChecking(true);
      try {
        const { res, data } = await apiJson("/api/v1/user/profile", { method: "GET" });
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
  }, [onUnauthorized, onUserLoaded]);

  return { authChecking };
}
