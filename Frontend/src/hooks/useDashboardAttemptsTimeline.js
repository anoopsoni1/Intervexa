import { useCallback, useEffect, useState } from "react";
import { DASHBOARD_SCORES_REFRESH } from "../constants/dashboardEvents.js";
import { fetchDashboardAttemptsTimeline } from "../services/dashboardAnalytics.service.js";

/** @typedef {import("../types/dashboardScores").DashboardAttemptsTimelinePayload} DashboardAttemptsTimelinePayload */

export function useDashboardAttemptsTimeline() {
  /** @type {[{ data: DashboardAttemptsTimelinePayload | null; loading: boolean; error: string | null }, function]} */
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const runFetch = useCallback((signal) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    return fetchDashboardAttemptsTimeline(signal)
      .then((data) => {
        setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setState({ data: null, loading: false, error: err?.message || "Failed to load" });
      });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    runFetch(ac.signal);
    return () => ac.abort();
  }, [runFetch]);

  useEffect(() => {
    const onRefresh = () => {
      const ac = new AbortController();
      runFetch(ac.signal);
    };
    window.addEventListener(DASHBOARD_SCORES_REFRESH, onRefresh);
    const onVis = () => {
      if (document.visibilityState === "visible") onRefresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener(DASHBOARD_SCORES_REFRESH, onRefresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [runFetch]);

  const refresh = useCallback(() => {
    const ac = new AbortController();
    runFetch(ac.signal);
  }, [runFetch]);

  return { ...state, refresh };
}
