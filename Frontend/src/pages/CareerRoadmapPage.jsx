import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import CareerRoadmapForm from "./CareerRoadmapForm";
import RoadmapResult from "./RoadmapResult";
import Particles from "../components/ui/Lighting.jsx";

import { API_BASE, JOB_API_BASE } from "../config";
import { useToast } from "../context/ToastContext";
import { useUsageStatus, formatResetsLabel, isUsageBlocked } from "../hooks/useUsageStatus.js";
import { getAuthHeaders, UPGRADE_PREMIUM_MESSAGE } from "../services/api";

function Topbar() {
  return <AppHeader />;
}

function safeReturnPath(path) {
  if (!path || typeof path !== "string") return null;
  const p = path.trim();
  if (p.startsWith("//") || p.startsWith("http")) return null;
  return p.startsWith("/") ? p : `/${p}`;
}

export default function CareerRoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { status: usageStatus, refresh: refreshUsage } = useUsageStatus(authChecked);
  const roadmapBlocked = isUsageBlocked(usageStatus?.roadmap);

  const returnPath = safeReturnPath(location.pathname) || "/career-roadmap";

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      let granted = false;
      try {
        
        const headers = getAuthHeaders();
        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (cancelled) return;
        if (!res.ok && res.status === 401) {
          navigate(`/login?from=${encodeURIComponent(returnPath)}`, { replace: true });
          return;
        }
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const profileUser = data?.user ?? data?.data?.user ?? data;
          if (!profileUser?.Premium) {
            navigate(`/price?from=${encodeURIComponent(returnPath)}`, { replace: true });
            return;
          }
          granted = true;
        }
      } catch {
        if (!cancelled) navigate(`/login?from=${encodeURIComponent(returnPath)}`, { replace: true });
      } finally {
        if (!cancelled && granted) setAuthChecked(true);
      }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, [navigate, returnPath]);

  const handleGenerate = async (payload) => {
    if (roadmapBlocked) {
      setError(
        `Daily roadmap limit reached. ${formatResetsLabel(usageStatus?.roadmap?.resetsAt)}`
      );
      return;
    }
    setLoading(true);
    setError(null);
    setRoadmap(null);
    try {
      
      const headers = getAuthHeaders({
        "Content-Type": "application/json",
      });
      const res = await fetch(`${API_BASE}/generate-roadmap`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok && res.status !== 202) {
        let message =
          res.status === 403
            ? UPGRADE_PREMIUM_MESSAGE
            : 
          res.status === 429
            ? json?.message || json?.error || "Daily roadmap limit reached."
            : json?.message || "Failed to generate roadmap";
        if (res.status === 429 && json?.resetsAt) {
          message = `${message} ${formatResetsLabel(json.resetsAt)}`;
        }
        setError(message);
        if (res.status === 403) toast.error(UPGRADE_PREMIUM_MESSAGE);
        if (res.status === 429) toast.error(message);
        return;
      }

      let data = json?.data ?? json;

      // 202 = job queued (backend uses Redis). Poll for result.
      if (res.status === 202 && data?.jobId) {
        const jobId = data.jobId;
        const maxAttempts = 60;
        const intervalMs = 2000;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((r) => setTimeout(r, intervalMs));
          const jobRes = await fetch(`${JOB_API_BASE}/${jobId}`, {
            credentials: "include",
            headers: {},
          });
          const jobJson = await jobRes.json().catch(() => ({}));
          const jobData = jobJson?.data ?? jobJson;
          if (jobData?.status === "completed" && jobData?.result) {
            data = jobData.result?.data ?? jobData.result;
            break;
          }
          if (jobData?.status === "failed") {
            setError(jobData?.error || "Roadmap generation failed. Please try again.");
            return;
          }
        }
      }

      const hasContent =
        data &&
        ((Array.isArray(data.phases) && data.phases.length > 0) ||
          (Array.isArray(data.projects) && data.projects.length > 0) ||
          (Array.isArray(data.missingSkills) && data.missingSkills.length > 0) ||
          (Array.isArray(data.learningResources) && data.learningResources.length > 0));
      if (!data || !hasContent) {
        setError("No roadmap content was generated. The AI may be temporarily unavailable. Please try again.");
        setRoadmap(null);
        return;
      }
      setRoadmap(data);
      refreshUsage();
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-6 text-center">
          <p className="text-white font-semibold">Checking access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      <div className="absolute inset-0 z-1 bg-black/30" />

      <div className={`relative z-10 flex flex-col ${roadmap ? "fixed inset-0" : "min-h-screen"}`}>
        <Topbar />
        <main className={`flex-1 flex flex-col min-h-0 ${roadmap ? "py-2 sm:py-3 overflow-hidden" : "py-6 sm:py-8 pb-10 sm:pb-12"}`}>
          <div className={`mx-auto w-full flex-1 flex flex-col min-h-0 ${roadmap ? "px-4 sm:px-6 lg:px-8 max-w-[1920px]" : "px-3 sm:px-4 max-w-2xl"}`}>
            {!roadmap && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 md:p-8 mb-6"
                >
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    AI Career Roadmap Generator
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    Enter your goal and current skills to get a personalized learning roadmap.
                    Daily quota resets at midnight UTC.
                  </p>
                </motion.div>

                {roadmapBlocked ? (
                  <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    Daily roadmap limit reached. {formatResetsLabel(usageStatus?.roadmap?.resetsAt)}
                  </p>
                ) : null}

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mb-8"
                >
                  <CareerRoadmapForm
                    onSubmit={handleGenerate}
                    loading={loading}
                    limitDisabled={roadmapBlocked}
                  />
                </motion.div>
              </>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 px-4 py-3 mb-6 border-l-4 border-l-rose-500/60 shrink-0"
              >
                {error}
              </motion.div>
            )}

            {roadmap && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
                  <h2 className="text-xl font-bold text-white tracking-tight antialiased">Your career roadmap</h2>
                  <button
                    type="button"
                    onClick={() => setRoadmap(null)}
                    className="rounded-xl border border-slate-600 bg-slate-800/90 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200 antialiased"
                  >
                    ← New roadmap
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-sm shadow-2xl shadow-black/50">
                  <RoadmapResult data={roadmap} />
                </div>
              </motion.div>
            )}
          </div>
        </main>
        {!roadmap && <AppFooter />}
      </div>
    </div>
  );
}
