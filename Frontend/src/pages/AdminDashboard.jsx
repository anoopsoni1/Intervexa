import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../slices/user.slice";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { Users, Sparkles, FileText, TrendingUp, Download, Video, Code2, Map, Globe } from "lucide-react";

import { API_BASE } from "../config";

// Build registration counts by day (last 10 days)
function useRegistrationsByDay(users) {
  return useMemo(() => {
    if (!users?.length) return [];
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = 10;
    const buckets = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      buckets[d.toISOString().slice(0, 10)] = { date: d.toISOString().slice(0, 10), count: 0, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    }
    users.forEach((u) => {
      if (u.createdAt) {
        const key = new Date(u.createdAt).toISOString().slice(0, 10);
        if (buckets[key]) buckets[key].count += 1;
      }
    });
    return Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
  }, [users]);
}

// Top users by AI optimize count (for bar chart)
function useOptimizeChartData(users) {
  return useMemo(() => {
    if (!users?.length) return [];
    return users
      .filter((u) => (u.optimizeCount ?? 0) > 0)
      .map((u) => ({ name: u.FirstName ? `${u.FirstName} ${u.LastName || ""}`.trim() || u.email : u.email, count: u.optimizeCount ?? 0, email: u.email }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [users]);
}

function AdminDashboard() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [platformTotals, setPlatformTotals] = useState({
    totalResumeDetails: 0,
    totalPortfolioDeploys: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const registrationsByDay = useRegistrationsByDay(users);
  const optimizeChartData = useOptimizeChartData(users);
  const totalOptimizes = useMemo(() => users.reduce((s, u) => s + (u.optimizeCount ?? 0), 0), [users]);
  const totalResumes = useMemo(() => users.reduce((s, u) => s + (u.resumeCount ?? 0), 0), [users]);
  const totalDownloads = useMemo(() => users.reduce((s, u) => s + (u.downloadCount ?? u.resumesDownloadedToday ?? 0), 0), [users]);
  const usersWhoUsedAi = useMemo(() => users.filter((u) => (u.optimizeCount ?? 0) > 0).length, [users]);
  const totalLiveInterviewsToday = useMemo(() => users.reduce((s, u) => s + (u.liveInterviewsToday ?? 0), 0), [users]);
  const totalCodingInterviewsToday = useMemo(() => users.reduce((s, u) => s + (u.codingInterviewsToday ?? 0), 0), [users]);
  const totalRoadmapSuggestionsToday = useMemo(() => users.reduce((s, u) => s + (u.roadmapSuggestionsToday ?? 0), 0), [users]);

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
    if (!userData.isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const fetchUsers = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/get-all-users`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message || "Failed to fetch users");
        }
        const raw = json?.data;
        if (Array.isArray(raw)) {
          setUsers(raw);
          setPlatformTotals({ totalResumeDetails: 0, totalPortfolioDeploys: 0 });
        } else if (raw?.users) {
          setUsers(raw.users);
          setPlatformTotals({
            totalResumeDetails: Number(raw.platform?.totalResumeDetails) || 0,
            totalPortfolioDeploys: Number(raw.platform?.totalPortfolioDeploys) || 0,
          });
        } else {
          setUsers([]);
          setPlatformTotals({ totalResumeDetails: 0, totalPortfolioDeploys: 0 });
        }
      } catch (err) {
        setError(err.message || "Failed to load users");
        if (err.message?.toLowerCase().includes("unauthorized") || err.message?.toLowerCase().includes("admin")) {
          dispatch(clearUser());
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userData, navigate, dispatch]);

  if (!userData) return null;
  if (!userData.isAdmin) return null;

  const layout = (
    <div className="flex flex-col min-h-screen text-white">
        <AppHeader />
        <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-8xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              to="/admin-settings"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/35 bg-indigo-500/15 px-3 sm:px-4 py-2.5 text-sm font-medium text-indigo-100 hover:border-indigo-300/60 hover:bg-indigo-500/25 transition-all w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" /> AI Avatar Settings
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 sm:px-4 py-2.5 text-sm font-medium text-white hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all w-full sm:w-auto"
            >
              <span className="text-indigo-400">←</span> Back to Dashboard
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-white px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="rounded-xl border border-violet-500/30 bg-linear-to-br from-violet-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Total Users</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{users.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Registered</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-linear-to-br from-cyan-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">AI Optimizes</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalOptimizes}</p>
                    <p className="text-xs text-slate-500 mt-1">{usersWhoUsedAi} users used AI</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-linear-to-br from-amber-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Total resume profiles</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      {(platformTotals.totalResumeDetails || totalResumes).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">All users (saved detail records)</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-fuchsia-500/30 bg-linear-to-br from-fuchsia-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Total portfolio deploys</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      {platformTotals.totalPortfolioDeploys.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">All users (Vercel deployments)</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Registrations</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{registrationsByDay.slice(-7).reduce((s, d) => s + d.count, 0)}</p>
                    <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-rose-500/30 bg-linear-to-br from-rose-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Resume Downloads</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalDownloads}</p>
                    <p className="text-xs text-slate-500 mt-1">Today</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <Download className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-indigo-500/30 bg-linear-to-br from-indigo-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Live Interviews</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalLiveInterviewsToday}</p>
                    <p className="text-xs text-slate-500 mt-1">Today</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/30 bg-linear-to-br from-sky-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Coding Interviews</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalCodingInterviewsToday}</p>
                    <p className="text-xs text-slate-500 mt-1">Today</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-sky-500/20 flex items-center justify-center">
                    <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-teal-500/30 bg-linear-to-br from-teal-500/10 to-slate-900/80 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm font-medium">Career Suggestions</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalRoadmapSuggestionsToday}</p>
                    <p className="text-xs text-slate-500 mt-1">Today</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <Map className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Registrations over time */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden min-w-0">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-700/50">
                  <h2 className="text-base sm:text-lg font-semibold text-white">Registrations Over Time</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">New user sign-ups (last 10 days)</p>
                </div>
                <div className="p-3 sm:p-5 overflow-x-auto">
                  <div className="flex items-end justify-between gap-0.5 sm:gap-1 min-h-[140px] min-w-[240px]">
                    {registrationsByDay.length ? (
                      registrationsByDay.map((d) => {
                        const max = Math.max(1, ...registrationsByDay.map((x) => x.count));
                        const barHeightPx = max > 0 ? Math.round((d.count / max) * 100) : 0;
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex justify-center items-end" style={{ height: "100px" }}>
                              <div
                                className="w-full max-w-[20px] rounded-t-md bg-linear-to-t from-violet-600 to-violet-400 transition-all hover:from-violet-500 hover:to-violet-300"
                                style={{ height: `${Math.max(barHeightPx, 4)}px` }}
                                title={`${d.label}: ${d.count}`}
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs text-slate-500 truncate max-w-full">{d.label}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-slate-500 text-sm">No registration data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Optimize usage */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden min-w-0">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-700/50">
                  <h2 className="text-base sm:text-lg font-semibold text-white">AI Resume Optimize Usage</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Times each user used AI to optimize resume (top 10)</p>
                </div>
                <div className="p-3 sm:p-5">
                  {optimizeChartData.length ? (
                    <div className="space-y-3">
                      {optimizeChartData.map((u, i) => {
                        const max = Math.max(1, ...optimizeChartData.map((x) => x.count));
                        const w = (u.count / max) * 100;
                        return (
                          <div key={u.email + i} className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <span className="text-slate-300 text-xs sm:text-sm w-16 sm:w-24 min-w-0 truncate shrink-0" title={u.email}>{u.name}</span>
                            <div className="flex-1 min-w-0 h-5 sm:h-6 rounded-full bg-slate-700/50 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-linear-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                                style={{ width: `${w}%`, minWidth: "8px" }}
                              />
                            </div>
                            <span className="text-cyan-400 font-medium text-xs sm:text-sm w-6 sm:w-8 text-right shrink-0">{u.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No AI optimize usage yet</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        </main>
        <AppFooter />
      </div>
  );

  return layout;
}

export default AdminDashboard;
