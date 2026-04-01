import { useId } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Briefcase,
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Zap,
  ListChecks,
} from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { useAtsPageData } from "../hooks/useAtsPageData.js";

function getScoreTier(score) {
  if (score >= 80)
    return {
      label: "Excellent",
      color: "emerald",
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      ring: "ring-emerald-400/50",
    };
  if (score >= 60)
    return { label: "Good", color: "lime", bg: "bg-lime-500/20", text: "text-lime-400", ring: "ring-lime-400/50" };
  if (score >= 40)
    return {
      label: "Fair",
      color: "amber",
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      ring: "ring-amber-400/50",
    };
  return { label: "Needs work", color: "rose", bg: "bg-rose-500/20", text: "text-rose-400", ring: "ring-rose-400/50" };
}

function getScoreGradient(score) {
  if (score >= 80) return "from-emerald-400 to-teal-400";
  if (score >= 60) return "from-lime-400 to-emerald-400";
  if (score >= 40) return "from-amber-400 to-orange-400";
  return "from-rose-400 to-amber-400";
}

function gradientStops(scoreNum) {
  if (scoreNum >= 80) return { a: "#34d399", b: "#2dd4bf" };
  if (scoreNum >= 60) return { a: "#a3e635", b: "#34d399" };
  if (scoreNum >= 40) return { a: "#fbbf24", b: "#f97316" };
  return { a: "#fb7185", b: "#fbbf24" };
}

function AtsScoreResult({ result }) {
  const gradId = useId().replace(/:/g, "");
  const scoreNum = Math.min(100, Math.max(0, Number(result?.score) ?? 0));
  const tier = getScoreTier(scoreNum);
  const matched = result?.matchedKeywords ?? [];
  const missing = result?.missingKeywords ?? [];
  const totalKw = matched.length + missing.length;
  const coverage = totalKw > 0 ? Math.round((matched.length / totalKw) * 100) : null;
  const stops = gradientStops(scoreNum);

  return (
    <div
      className="mt-10 pt-10 border-t border-white/10"
      role="region"
      aria-label="ATS analysis results"
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg className="h-44 w-44 sm:h-52 sm:w-52 -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={339.292}
              strokeDashoffset={339.292 - (339.292 * scoreNum) / 100}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={stops.a} />
                <stop offset="100%" stopColor={stops.b} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-3xl sm:text-4xl font-bold tabular-nums bg-linear-to-br ${getScoreGradient(scoreNum)} bg-clip-text text-transparent`}
            >
              {scoreNum}
            </span>
            <span className="text-lg font-medium text-slate-500">%</span>
            <span className={`mt-1 text-xs font-semibold uppercase tracking-wider ${tier.text}`}>{tier.label}</span>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">ATS keyword match score</p>
        {coverage != null && (
          <p className="mt-1 text-center text-xs text-slate-500 max-w-sm">
            {matched.length} of {totalKw} tracked keywords from the job description appear in your resume ({coverage}%
            coverage).
          </p>
        )}
        <div className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${tier.bg} ${tier.text}`}>
          {tier.label} profile fit
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5 shadow-lg shadow-emerald-500/5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <CheckCircle size={20} className="shrink-0 text-emerald-400" />
            Matched keywords
            <span className="ml-auto rounded-full bg-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
              {matched.length}
            </span>
          </h4>
          <div className="max-h-52 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">
            <ul className="flex flex-wrap gap-2">
              {matched.length > 0 ? (
                matched.map((k, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-emerald-400/25 bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-100"
                  >
                    {k}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">None found — try aligning your wording with the posting.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/8 p-5 shadow-lg shadow-rose-500/5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <XCircle size={20} className="shrink-0 text-rose-400" />
            Missing keywords
            <span className="ml-auto rounded-full bg-rose-500/30 px-2.5 py-0.5 text-xs font-medium text-rose-200">
              {missing.length}
            </span>
          </h4>
          <div className="max-h-52 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">
            <ul className="flex flex-wrap gap-2">
              {missing.length > 0 ? (
                missing.map((k, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-rose-400/25 bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-100"
                  >
                    {k}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">None — strong alignment with this posting.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {result.summary && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 p-5 sm:p-6">
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            AI summary
          </p>
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-slate-300">{result.summary}</p>
        </div>
      )}
    </div>
  );
}

function Topbar() {
  return <AppHeader />;
}

function AtsChecker() {
  const {
    resumeText,
    jobDescription,
    setJobDescription,
    result,
    error,
    loading,
    authChecking,
    handleCheckATS,
    resumeWordCount,
    jdWordCount,
    checkReadiness,
    minResumeWords,
    minJdWords,
  } = useAtsPageData();

  const readyToRun = checkReadiness.resumeOk && checkReadiness.jdOk && !loading;

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-2xl border border-white/15 bg-zinc-900/80 p-8 text-center shadow-xl backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
          </div>
          <p className="font-semibold text-white">Checking session…</p>
          <p className="mt-1 text-sm text-slate-400">Verifying authentication.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Topbar />

        <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto w-full max-w-8xl">
            <header className="mb-10 text-center sm:mb-12">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-200 shadow-lg shadow-amber-500/10">
                <TrendingUp className="h-4 w-4 shrink-0" aria-hidden />
                ATS analysis
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                ATS resume{" "}
                <span className="bg-linear-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                  score checker
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
                We match your resume text against the job description, surface keyword gaps, and estimate how well you
                align with what ATS parsers and recruiters typically scan for.
              </p>
            </header>

            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-left">
                <div className="mb-2 flex items-center gap-2 text-amber-200">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/25 text-sm font-bold">
                    1
                  </span>
                  <p className="font-semibold text-amber-50">Resume loaded</p>
                </div>
                <p className="text-xs leading-relaxed text-amber-200/80">
                  Text comes from your latest upload or saved profile. Edit via Optimize with AI if needed.
                </p>
              </div>
              <div className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-4 text-left">
                <div className="mb-2 flex items-center gap-2 text-indigo-200">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/25 text-sm font-bold">
                    2
                  </span>
                  <p className="font-semibold text-indigo-50">Paste full JD</p>
                </div>
                <p className="text-xs leading-relaxed text-indigo-200/80">
                  Include responsibilities, must-have skills, and tools — longer postings produce better keyword lists.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-left">
                <div className="mb-2 flex items-center gap-2 text-emerald-200">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/25 text-sm font-bold">
                    3
                  </span>
                  <p className="font-semibold text-emerald-50">Iterate</p>
                </div>
                <p className="text-xs leading-relaxed text-emerald-200/80">
                  Use matched vs missing lists to tweak bullets, then run the check again.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-zinc-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
                <div className="flex min-w-0 flex-col">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/20">
                        <FileText className="h-5 w-5 text-amber-400" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <label className="text-sm font-semibold text-white">Resume text</label>
                        <p className="text-xs text-slate-500">From your last upload or profile</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${
                        checkReadiness.resumeOk
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                          : "border-white/15 bg-white/5 text-slate-300"
                      }`}
                    >
                      {resumeWordCount} words
                      {!checkReadiness.resumeOk && (
                        <span className="text-slate-500"> · min {minResumeWords}</span>
                      )}
                    </span>
                  </div>
                  <textarea
                    value={resumeText}
                    readOnly
                    aria-readonly="true"
                    placeholder="Resume text appears here after upload"
                    className="min-h-[280px] w-full resize-y cursor-not-allowed rounded-2xl border border-white/15 bg-black/35 p-4 text-sm leading-relaxed text-slate-200 shadow-inner shadow-black/20"
                  />
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    Read-only here — update your resume in{" "}
                    <Link to="/edit-resume" state={{ extractedText: resumeText }} className="text-amber-400/90 underline-offset-2 hover:underline">
                      Optimize with AI
                    </Link>{" "}
                    or re-upload.
                  </p>
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/20">
                        <Briefcase className="h-5 w-5 text-indigo-400" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <label htmlFor="ats-job-description" className="text-sm font-semibold text-white">
                          Job description
                        </label>
                        <p className="text-xs text-slate-500">Paste the full posting</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${
                        checkReadiness.jdOk
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                          : "border-amber-500/25 bg-amber-500/10 text-amber-200/90"
                      }`}
                    >
                      {jdWordCount} words
                      {!checkReadiness.jdOk && <span className="text-amber-200/70"> · aim {minJdWords}+</span>}
                    </span>
                  </div>
                  <textarea
                    id="ats-job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste title, summary, responsibilities, and requirements…"
                    className="min-h-[280px] w-full resize-y rounded-2xl border border-white/15 bg-black/35 p-4 text-sm leading-relaxed text-slate-200 placeholder-slate-500 shadow-inner shadow-black/20 transition focus:border-indigo-500/45 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    autoComplete="off"
                  />
                  <p className="mt-2 flex items-start gap-2 text-xs text-slate-500">
                    <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400/80" aria-hidden />
                    More JD text → more reliable keyword extraction. Bullet lists and &quot;Requirements&quot; sections
                    help most.
                  </p>
                </div>
              </div>

              {error ? (
                <div
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                  role="alert"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20">
                    <XCircle className="h-4 w-4" aria-hidden />
                  </div>
                  <span>{error}</span>
                </div>
              ) : null}

              {loading ? (
                <div
                  className="mt-8 flex flex-col items-center rounded-2xl border border-white/10 bg-white/4 px-6 py-8 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="h-10 w-10 animate-spin text-amber-400" aria-hidden />
                  <p className="mt-4 font-semibold text-white">Analyzing match…</p>
                  <p className="mt-2 max-w-md text-sm text-slate-400">
                    Comparing resume and job description. This usually takes 15–60 seconds; we poll the server so you
                    don&apos;t have to refresh.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Zap className="h-3.5 w-3.5 text-amber-400/80" aria-hidden />
                    Tip: keep this tab open until results appear.
                  </div>
                </div>
              ) : null}

              {result && !loading ? <AtsScoreResult result={result} /> : null}

              <div className="mt-8 grid grid-cols-1 gap-3 sm:mx-auto sm:mt-10 sm:max-w-2xl sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCheckATS}
                  disabled={!readyToRun}
                  aria-busy={loading}
                  title={
                    !checkReadiness.resumeOk || !checkReadiness.jdOk
                      ? "Meet minimum word counts on resume and job description to run a check"
                      : undefined
                  }
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-6 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none sm:px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" aria-hidden />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Target size={20} aria-hidden />
                      Check ATS score
                    </>
                  )}
                </button>

                {resumeText.trim() ? (
                  <Link
                    to="/edit-resume"
                    state={{ extractedText: resumeText }}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-6 font-semibold text-slate-200 transition hover:border-indigo-500 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] sm:px-8"
                  >
                    <Sparkles size={20} aria-hidden />
                    Optimize with AI
                  </Link>
                ) : (
                  <span className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 font-semibold text-slate-500 sm:px-8">
                    <Sparkles size={20} aria-hidden />
                    Optimize with AI
                  </span>
                )}
              </div>
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    </>
  );
}

export default AtsChecker;
