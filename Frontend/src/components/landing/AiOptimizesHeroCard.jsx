import { Sparkles } from "lucide-react";

/**
 * Hero metric card: lifetime AI resume optimizations — same glass shell as adjacent stat cards.
 */
export default function AiOptimizesHeroCard({ totalOptimizes = 0, usersUsedAi = 0 }) {
  const showUsersLine = usersUsedAi > 0;

  return (
    <div
      className="relative flex min-h-[148px] overflow-hidden rounded-2xl border border-white/15 bg-white/6 px-4 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:min-h-[156px] sm:px-5"
     
    >
    
      <div className="relative flex w-full flex-1 flex-row items-center place-items-center">
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium text-slate-400 text-center">AI Optimizes</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-indigo-200 tabular-nums sm:text-3xl text-center">
            {totalOptimizes}
          </p>
          {showUsersLine ? (
            <p className="mt-2 text-xs text-slate-400 sm:text-sm text-center">
              {usersUsedAi} {usersUsedAi === 1 ? "user" : "users"} used AI
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500 sm:text-sm text-center">Across all Ansoyal AI resumes</p>
          )}
        </div>
      </div>
    </div>
  );
}
