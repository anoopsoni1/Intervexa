/**
 * Handles redirect from backend after Google OAuth.
 * URL: /auth/callback
 * Reads current user from cookie-authenticated /profile, then redirects.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../slices/user.slice";
import { apiJson } from "../services/api";
import { setDashboardFirstWelcomeFlag } from "../utils/dashboardWelcome.js";

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      let authenticated = false;
      const firstLoginHint =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("firstLogin") === "1";
      try {
        const { res, data } = await apiJson("/api/v1/user/profile", { method: "GET" });
        if (!res.ok) {
          return;
        }
        const user = data?.user || data?.data?.user;
        if (user) dispatch(setUser(user));
        if (firstLoginHint && user?._id != null) {
          setDashboardFirstWelcomeFlag(user._id);
        }
        authenticated = true;
      } finally {
        if (!authenticated) {
          navigate("/login", { replace: true });
          return;
        }
        const returnUrl = sessionStorage.getItem("loginReturnUrl");
        if (returnUrl) sessionStorage.removeItem("loginReturnUrl");
        const target =
          returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//") && !returnUrl.startsWith("http")
            ? returnUrl
            : "/dashboard";
        window.history.replaceState({}, "", target);
        navigate(target, { replace: true });
      }
    })();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-6 text-center">
        <p className="text-white font-semibold">Signing you in…</p>
        <p className="mt-1 text-sm text-slate-400">Please wait.</p>
      </div>
    </div>
  );
}
