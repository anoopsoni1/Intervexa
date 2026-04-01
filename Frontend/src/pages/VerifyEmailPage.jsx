/**
 * Page reached from the link in the verification email.
 * Calls backend to verify token, then redirects to dashboard.
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../config";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification link. Request a new one from the dashboard.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/verify-email?token=${encodeURIComponent(token)}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) {
          setStatus("success");
          setMessage(data?.message || "Email verified successfully.");
          const returnUrl = "/dashboard";
          setTimeout(() => navigate(returnUrl, { replace: true }), 1500);
        } else {
          setStatus("error");
          setMessage(data?.message || "Invalid or expired link. Request a new one from the dashboard.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err?.message || "Something went wrong. Try again from the dashboard.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 text-center max-w-md w-full">
        {status === "verifying" && (
          <>
            <p className="text-white font-semibold">Verifying your email…</p>
            <p className="mt-1 text-sm text-slate-400">Please wait.</p>
          </>
        )}
        {status === "success" && (
          <>
            <p className="text-emerald-400 font-semibold">Email verified</p>
            <p className="mt-1 text-sm text-slate-300">{message}</p>
            <p className="mt-3 text-xs text-slate-500">Redirecting to dashboard…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-amber-400 font-semibold">Verification failed</p>
            <p className="mt-1 text-sm text-slate-300">{message}</p>
            <button
              type="button"
              onClick={() => navigate("/dashboard", { replace: true })}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
