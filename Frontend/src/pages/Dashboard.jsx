import React, { useState, useEffect } from "react";
import { FiGlobe, FiZap, FiTarget, FiUsers, FiVideo, FiTrash2, FiMap, FiCode, FiAward, FiLock, FiMail } from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";
import { AiOutlineFileText } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { clearUser, setUser } from "../slices/user.slice";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { useToast } from "../context/ToastContext";

import { API_BASE } from "../config";
import { useUsageStatus, formatResetsLabel, isUsageBlocked } from "../hooks/useUsageStatus.js";

function Topbar() {
  return <AppHeader />;
}

function StatCards({ atsScore, optimizeCount, optimizeLimit, user, usageStatus }) {
  const hasAts = atsScore != null && typeof atsScore === "number";
  const atsDisplay = hasAts ? `${atsScore}%` : "—";
  const optimizeDisplay =
    optimizeCount != null && typeof optimizeCount === "number"
      ? optimizeLimit != null && typeof optimizeLimit === "number"
        ? `${optimizeCount} / ${optimizeLimit}`
        : String(optimizeCount)
      : "—";
  const atsColor = hasAts
    ? atsScore >= 70
      ? "text-emerald-400"
      : atsScore >= 50
        ? "text-amber-400"
        : "text-rose-400"
    : "text-slate-400";

  const stats = [
    {
      icon: <FiTarget className="w-5 h-5" />,
      label: "ATS Score",
      value: atsDisplay,
      sub: hasAts ? "Last check" : "Check your score",
      link: "/atsscore",
      valueClass: atsColor,
    },
    {
      icon: <AiOutlineFileText className="w-5 h-5" />,
      label: "Resume Status",
      value: "Optimized",
      sub: "Ready for applications",
      link: "/templates",
      valueClass: "text-emerald-400",
    },
    {
      icon: <FiZap className="w-5 h-5" />,
      label: "AI Optimizes",
      value: optimizeDisplay,
      sub:
        optimizeDisplay !== "—"
          ? optimizeLimit != null && typeof optimizeLimit === "number"
            ? "Used today (UTC) / daily cap"
            : "Times used today"
          : "Not used yet",
      link: "/edit-resume",
      valueClass: "text-white",
    },
  ];

  const actions = [
    {
      icon: <FiTarget className="w-6 h-6" />,
      title: "Check ATS Score",
      desc: "Analyze your resume and get an ATS score with keyword insights.",
      link: "/atsscore",
    },
    {
      icon: <AiOutlineFileText className="w-6 h-6" />,
      title: "Upload & edit resume",
      desc: "Upload a PDF/DOCX, then edit and improve with AI.",
      link: "/upload",
    },
    {
      icon: <AiOutlineFileText className="w-6 h-6" />,
      title: "Choose resume design",
      desc: "Select a resume template design and continue building your resume.",
      link: "/templates",
    },
    {
      icon: <FiTarget className="w-6 h-6" />,
      title: "Add details for resume or project",
      desc: "Build your resume or project by filling in your details.",
      link: "/add-details",
    },
    {
      icon: <MdAutoAwesome className="w-6 h-6" />,
      title: "Edit or optimize resume",
      desc: "Edit your saved text and improve with AI.",
      link: "/edit-resume",
    },
    {
      icon: <FiGlobe className="w-6 h-6" />,
      title: "Choose project design",
      desc: user?.Premium ? "Pick a template and view your project." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/templates/portfoliodesign" : "/price",
      premiumOnly: true,
    },
    {
      icon: <FiMap className="w-6 h-6" />,
      title: "AI Career Roadmap",
      desc: user?.Premium ? "Get a personalized learning roadmap for your career goal." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/career-roadmap" : "/price",
      premiumOnly: true,
      usageKey: "roadmap",
    },
    {
      icon: <FiCode className="w-6 h-6" />,
      title: "Coding Interview",
      desc: user?.Premium ? "Solve coding questions with live editor and AI feedback." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/coding-interview/start" : "/price",
      premiumOnly: true,
      usageKey: "codingInterview",
    },
    {
      icon: <FiVideo className="w-6 h-6" />,
      title: "Video Call Interview",
      desc: user?.Premium ? "Schedule video interviews and review AI call reports." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/dashboard/interviews" : "/price",
      premiumOnly: true,
      usageKey: "liveInterview",
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Leaderboard",
      desc: user?.Premium ? "Top coders by interview score." : "Premium only — upgrade to unlock.",
      link: user?.Premium ? "/leaderboard" : "/price",
      premiumOnly: true,
    },
  ];

  return (
    <div className="mt-6 sm:mt-8 px-3 sm:px-4 max-w-8xl mx-auto w-full">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">
        Your stats
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((item, i) => {
          const Card = item.link ? Link : "div";
          const cardProps = item.link ? { to: item.link } : {};
          return (
            <Card
              key={i}
              {...cardProps}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-amber-500/50 hover:bg-white/8 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-400 group-hover:border-amber-500/30 group-hover:text-amber-400/90 transition-colors">
                  {item.icon}
                </div>
                {item.link && (
                  <span className="text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {item.label}
              </p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${item.valueClass}`}>
                {item.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
            </Card>
          );
        })}
      </div>

      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-8 sm:mt-10 mb-4 px-1">
        Quick actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((item, i) => {
          const slot = item.usageKey ? usageStatus?.[item.usageKey] : null;
          const showPremium = item.premiumOnly && !user?.Premium;
          const limitLocked = item.premiumOnly && user?.Premium && isUsageBlocked(slot);
          const cardClass =
            "group block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 transition-all duration-200 relative";
          const linkHover =
            "hover:border-amber-500/50 hover:bg-white/8 hover:shadow-lg hover:shadow-amber-500/5";
          const inner = (
            <>
              {item.premiumOnly && !user?.Premium && (
                <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  <FiLock className="w-3.5 h-3.5" />
                  Premium
                </span>
              )}
              {limitLocked && (
                <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-xs font-semibold text-rose-300">
                  Daily limit
                </span>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-400 group-hover:border-amber-500/30 group-hover:text-amber-400/90 transition-colors">
                {item.premiumOnly && !user?.Premium ? <FiLock className="w-6 h-6" /> : item.icon}
              </div>
              <h4 className="mt-4 text-base font-semibold text-white group-hover:text-amber-50/90 transition-colors">
                {item.title}
              </h4>
              <p className="mt-2 text-sm text-slate-400 leading-snug">
                {limitLocked
                  ? `You’ve used today’s quota. ${formatResetsLabel(slot?.resetsAt)}`
                  : item.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 group-hover:text-amber-400 group-hover:gap-2.5 transition-all">
                {showPremium ? "Upgrade to unlock" : limitLocked ? "Try later" : "Get Started"}
                <span className="text-lg leading-none">→</span>
              </span>
            </>
          );
          if (limitLocked) {
            return (
              <div
                key={i}
                className={`${cardClass} opacity-75 cursor-not-allowed`}
                aria-disabled="true"
              >
                {inner}
              </div>
            );
          }
          return (
            <Link key={i} to={item.link} className={`${cardClass} ${linkHover}`}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}



export default function Dashboard() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const [authChecking, setAuthChecking] = useState(true);
  const [atsScore, setAtsScore] = useState(null);
  const [optimizeCount, setOptimizeCount] = useState(null);
  const [optimizeLimit, setOptimizeLimit] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [deployNotice, setDeployNotice] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sendingVerify, setSendingVerify] = useState(false);
  const toast = useToast();

  const needsEmailVerification = user && !user.emailVerified && !user.googleId;

  const { status: usageStatus } = useUsageStatus(
    !!user && !!(user.emailVerified || user.googleId)
  );

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Authentication + authorization: validate session with protected endpoint.
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      setAuthChecking(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            dispatch(clearUser());
            if (!cancelled) navigate("/login");
          }
          return;
        }

        const currentUser = data?.user || data?.data?.user;
        if (currentUser) dispatch(setUser(currentUser));
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  // Fetch ATS score for dashboard when user is logged in
  useEffect(() => {
    if (!user) {
      setAtsScore(null);
      return;
    }
    let cancelled = false;
    async function fetchAtsScore() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/get-atsscore`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data != null) {
          const score = json.data?.score;
          setAtsScore(typeof score === "number" ? score : null);
        } else {
          setAtsScore(null);
        }
      } catch {
        if (!cancelled) setAtsScore(null);
      }
    }
    fetchAtsScore();
    return () => { cancelled = true; };
  }, [user]);

  // Fetch optimize count for dashboard when user is logged in
  useEffect(() => {
    if (!user) {
      setOptimizeCount(null);
      setOptimizeLimit(null);
      return;
    }
    let cancelled = false;
    async function fetchOptimize() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/get-optimize`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.data != null && typeof json.data.number === "number") {
          setOptimizeCount(json.data.number);
          setOptimizeLimit(typeof json.data.limit === "number" ? json.data.limit : null);
        } else {
          setOptimizeCount(null);
          setOptimizeLimit(null);
        }
      } catch {
        if (!cancelled) setOptimizeCount(null);
      }
    }
    fetchOptimize();
    return () => { cancelled = true; };
  }, [user]);

  // Fetch deployments (portfolio URLs) for dashboard
  useEffect(() => {
    if (!user) {
      setDeployments([]);
      return;
    }
    let cancelled = false;
    async function fetchDeployments() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/get-deployments`, {
          credentials: "include",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        const list = json?.data;
        if (res.ok && Array.isArray(list)) {
          setDeployments(list);
        } else {
          setDeployments([]);
        }
      } catch {
        if (!cancelled) setDeployments([]);
      }
    }
    fetchDeployments();
    return () => { cancelled = true; };
  }, [user]);

  /** Show banner after portfolio deploy (set from Portfolio design deploy flow). Dismiss clears sessionStorage. */
  useEffect(() => {
    if (!user) {
      setDeployNotice(null);
      return;
    }
    try {
      const raw = sessionStorage.getItem("intervexa:dashboardDeployNotice");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.url && typeof parsed.url === "string") {
        setDeployNotice({ url: parsed.url.trim() });
      }
    } catch {
      sessionStorage.removeItem("intervexa:dashboardDeployNotice");
    }
  }, [user]);

  const dismissDeployNotice = () => {
    setDeployNotice(null);
    try {
      sessionStorage.removeItem("intervexa:dashboardDeployNotice");
    } catch {
      /* ignore */
    }
  };

  const handleResendVerification = async () => {
    setSendingVerify(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/resend-verification-email`, {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data?.message || "Verification email sent. Check your inbox.");
      } else {
        toast.error(data?.message || "Failed to send. Try again later.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to send verification email.");
    } finally {
      setSendingVerify(false);
    }
  };

  const latestDeployment = deployments.length > 0 ? deployments[0] : null;
  const formatDeployDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const handleDeleteDeployment = async (dep) => {
    if (!dep._id) return;
    if (!window.confirm("Remove this project from the list and delete it from Vercel? This cannot be undone.")) return;
    const accessToken = localStorage.getItem("accessToken");
    setDeletingId(dep._id);
    try {
      const res = await fetch(`${API_BASE}/delete-deployment/${dep._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDeployments((prev) => prev.filter((d) => d._id !== dep._id));
        toast.success("Project deleted and removed from Vercel.");
      } else {
        toast.error(data?.message || "Failed to delete project.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white font-semibold">Checking session…</p>
          <p className="mt-1 text-sm text-slate-300">
            Verifying authentication with the server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      {user ? (
        <main className="flex-1 py-6 sm:py-8 pb-10 sm:pb-12">
          <div className="mx-auto px-3 sm:px-4 max-w-8xl w-full">
            {/* Email not verified banner – lock all features until verified (Google users skip) */}
            {deployNotice && !needsEmailVerification && (
              <div className="mb-4 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 backdrop-blur-sm p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <FiGlobe className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-emerald-400">Portfolio deployed</p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-300">
                        Your site is live. Open the link or copy it to share.
                      </p>
                      <a
                        href={deployNotice.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300 break-all underline-offset-2 hover:underline"
                      >
                        {deployNotice.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(deployNotice.url).then(() => {
                          toast.success("Link copied to clipboard.");
                        });
                      }}
                      className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Copy link
                    </button>
                    <a
                      href={deployNotice.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                    >
                      Open site →
                    </a>
                    <button
                      type="button"
                      onClick={dismissDeployNotice}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {needsEmailVerification && (
              <div className="mb-4 rounded-2xl border border-amber-500/50 bg-amber-500/10 backdrop-blur-sm p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                      <FiMail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-400">Email not verified</p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-300">
                        Verify your email to unlock resume, mock interview, and all other features. Check your inbox or click below to resend the verification link.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={sendingVerify}
                    className="shrink-0 inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60 transition-colors"
                  >
                    {sendingVerify ? "Sending…" : "Send verification email"}
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Welcome back,{" "}
                <span className="text-amber-400">
                  {user?.FirstName} {user?.LastName}
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                {needsEmailVerification
                  ? "Verify your email above to access your stats and features."
                  : "Your resume is performing well. Here are your latest stats and quick actions."}
              </p>
            </div>

            {!needsEmailVerification && user?.Premium ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-emerald-500/60 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      Premium active
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                      You have access to all premium features.
                    </p>
                  </div>
                  <Link
                    to="/dashboard/profile"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ) : !needsEmailVerification ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-amber-500/60 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-400">
                      Premium not active
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                      Upgrade to unlock premium templates, AI optimizations, and more.
                    </p>
                  </div>
                  <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
                    <Link
                      to="/price"
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors w-full sm:w-auto"
                    >
                      Upgrade
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Up page link - only for admins (extra tools) */}
            {!needsEmailVerification && user?.isAdmin && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Extra tools</p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                      Templates and more.
                    </p>
                  </div>
                  <Link
                    to="/up"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors w-full sm:w-auto"
                  >
                    Open Up page →
                  </Link>
                </div>
              </div>
            )}

            {/* Lock overlay message when email not verified */}
            {needsEmailVerification && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center">
                <FiLock className="w-12 h-12 mx-auto text-amber-500/70" />
                <p className="mt-3 text-sm font-semibold text-amber-400">All features are locked</p>
                <p className="mt-1 text-xs text-slate-400">
                  Resume, mock interviews, ATS score, and more will unlock after you verify your email.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={sendingVerify}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                >
                  {sendingVerify ? "Sending…" : "Send verification email"}
                </button>
              </div>
            )}

            {/* Deployed project URLs from database – same card style as Admin */}
            {!needsEmailVerification && user?.Premium ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-emerald-500/60 p-4 sm:p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-400">
                        <FiGlobe className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-emerald-400">
                          Live projects
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                          {deployments.length > 0
                            ? `${deployments.length} deployment${deployments.length === 1 ? "" : "s"} · Your live links`
                            : "Deploy from a project template to get a live link."}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/templates/portfoliodesign"
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shrink-0"
                    >
                      {deployments.length > 0 ? "Deploy another" : "Deploy project"}
                    </Link>
                  </div>
                  {deployments.length > 0 ? (
                    <ul className="space-y-3 border-t border-white/10 pt-4 mt-1">
                      {deployments.map((dep, index) => (
                        <li
                          key={dep._id || dep.portfolioUrl || index}
                          className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-4"
                        >
                          <div className="min-w-0 flex-1 flex items-start sm:items-center gap-3">
                            <span className="mt-1.5 sm:mt-0 shrink-0 w-2 h-2 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <a
                                href={dep.portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 break-all transition-colors duration-150"
                                title={dep.portfolioUrl}
                              >
                                {dep.portfolioUrl}
                              </a>
                              {dep.deployedAt && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Deployed {formatDeployDate(dep.deployedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 pl-5 sm:pl-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(dep.portfolioUrl).then(() => {
                                  setCopiedUrl(dep.portfolioUrl);
                                  setTimeout(() => setCopiedUrl(null), 2000);
                                });
                              }}
                              className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 min-w-16 ${
                                copiedUrl === dep.portfolioUrl
                                  ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400"
                                  : "border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/30"
                              }`}
                              title="Copy URL"
                            >
                              {copiedUrl === dep.portfolioUrl ? "Copied" : "Copy"}
                            </button>
                            <a
                              href={dep.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/70 transition-all duration-200"
                            >
                              Open →
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteDeployment(dep)}
                              disabled={deletingId === dep._id}
                              className="inline-flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/60 disabled:opacity-50 transition-all duration-200"
                              title="Delete project and remove from Vercel"
                            >
                              {deletingId === dep._id ? "…" : <FiTrash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Stats and quick actions – hidden when email not verified */}
            {!needsEmailVerification && (
              <StatCards
                atsScore={atsScore}
                optimizeCount={optimizeCount}
                optimizeLimit={optimizeLimit}
                user={user}
                usageStatus={usageStatus}
              />
            )}
            {needsEmailVerification && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-slate-400 text-sm">Stats and quick actions will appear here after you verify your email.</p>
              </div>
            )}

            {/* Admin-only: All Users */}
            {!needsEmailVerification && user?.isAdmin && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm border-l-4 border-l-indigo-500/60 p-4 sm:p-5">
                <p className="text-sm font-semibold text-indigo-400">Admin</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 mb-4">
                  Manage users.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/admin-dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <FiUsers className="w-4 h-4" />
                    All Users
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center px-4 text-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Welcome to Intervexa Dashboard
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-amber-500">
              Please log in to access your dashboard.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      )}
      <AppFooter />
    </div>
  );
}
