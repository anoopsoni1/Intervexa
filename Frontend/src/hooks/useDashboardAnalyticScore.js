import { useCallback, useEffect, useRef, useState } from "react";
import { DASHBOARD_SCORES_REFRESH } from "../constants/dashboardEvents.js";
import { fetchDashboardAnalyticScore } from "../services/dashboardAnalytics.service.js";

/** @typedef {import("../types/dashboardScores").DashboardAnalyticScorePayload} DashboardAnalyticScorePayload */

/**
 * @param {"interview-score" | "coding-score"} path
 */
export function useDashboardAnalyticScore(path) {
  /** @type {[{ data: DashboardAnalyticScorePayload | null; loading: boolean; error: string | null }, function]} */
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const pathRef = useRef(path);
  pathRef.current = path;

  const runFetch = useCallback((signal) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    return fetchDashboardAnalyticScore(pathRef.current, signal)
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
  }, [path, runFetch]);

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
