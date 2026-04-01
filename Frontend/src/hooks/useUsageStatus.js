import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../config";

/** Human-readable time until next UTC day reset (from API `resetsAt`). */
export function formatResetsLabel(resetsAtIso) {
  if (!resetsAtIso || typeof resetsAtIso !== "string") return "";
  const ms = new Date(resetsAtIso).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "Available now";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 48) return `Resets in ${Math.ceil(ms / 86400000)} day(s) (UTC)`;
  if (h >= 1) return `Resets in ${h}h ${m}m (UTC)`;
  return `Resets in ${m} min (UTC)`;
}

/**
 * Fetches GET /usage-status when `enabled` (e.g. logged-in + email verified).
 * Shape matches backend: resumeDownload, liveInterview, codingInterview, roadmap.
 */
export function useUsageStatus(enabled) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));

  const refresh = useCallback(async () => {
    if (!enabled) {
      setStatus(null);
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/usage-status`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.data) setStatus(json.data);
      else setStatus(null);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, loading, refresh };
}

export function isUsageBlocked(slot) {
  return Boolean(slot && !slot.premiumRequired && !slot.allowed);
}
