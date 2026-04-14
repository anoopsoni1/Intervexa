import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search, Target } from "lucide-react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { jobDescriptions, jobRoleCards, jobRoleCategories } from "../../data/atsJobDescriptions.js";
import "swiper/css";
import "swiper/css/pagination";

const MotionButton = motion.button;
const MotionDiv = motion.div;

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {{
 *   selectedRoleId: string | null;
 *   onSelectRole: (roleId: keyof typeof jobDescriptions) => void;
 *   selectedJdPreview: string;
 *   includeAdvancedJd: boolean;
 *   onIncludeAdvancedJdChange: (value: boolean) => void;
 *   onCheckAtsScore: () => void;
 *   checkDisabled: boolean;
 *   analyzing: boolean;
 * }} props
 */
export default function JobRoleSwiperSection({
  selectedRoleId,
  onSelectRole,
  selectedJdPreview,
  includeAdvancedJd,
  onIncludeAdvancedJdChange,
  onCheckAtsScore,
  checkDisabled,
  analyzing,
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCards = useMemo(() => {
    const q = normalize(query);
    return jobRoleCards.filter((c) => {
      if (selectedCategory !== "all" && c.categoryId !== selectedCategory) return false;
      if (!q) return true;
      const hay = normalize(`${c.title} ${c.subtitle} ${c.id.replace(/_/g, " ")}`);
      return hay.includes(q);
    });
  }, [query, selectedCategory]);

  return (
    <section className="space-y-5" aria-labelledby="select-job-role-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="select-job-role-heading" className="text-lg font-semibold tracking-tight text-white">
            Select Job Role
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pick a role — we load a student-friendly sample JD. Turn on advanced keywords below only if your resume
            lists senior tools.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter roles…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none ring-0 transition focus:border-indigo-500/40 focus:bg-white/7 focus:ring-2 focus:ring-indigo-500/20"
            autoComplete="off"
            aria-label="Filter job roles"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {jobRoleCategories.map((category) => {
          const active = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={[
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200",
              ].join(" ")}
              aria-pressed={active}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="relative w-full min-w-0 overflow-x-clip py-1">
        <Swiper
          key={filteredCards.map((c) => c.id).join("-")}
          modules={[Autoplay, Pagination]}
          slidesPerView="auto"
          centeredSlides
          centerInsufficientSlides
          spaceBetween={16}
          breakpoints={{
            640: { spaceBetween: 20 },
          }}
          grabCursor
          autoplay={{
            delay: 4200,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="ats-role-swiper pb-12 [--swiper-pagination-bottom:0.25rem]"
        >
          {filteredCards.map((card) => {
            const active = selectedRoleId === card.id;
            const Icon = card.Icon;
            return (
              <SwiperSlide
                key={card.id}
                className="box-border"
                style={{ width: "min(300px, calc(100vw - 2rem))" }}
              >
                <MotionButton
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  onClick={() => onSelectRole(card.id)}
                  aria-pressed={active}
                  className={[
                    "group relative w-full rounded-2xl border p-5 text-left shadow-xl backdrop-blur-xl transition-[box-shadow,transform,border-color] duration-300",
                    "bg-white/6 hover:bg-white/9",
                    active
                      ? "border-indigo-400/50 shadow-[0_0_0_1px_rgba(129,140,248,0.35),0_18px_50px_-24px_rgba(99,102,241,0.55)] ring-2 ring-indigo-400/35"
                      : "border-white/10 hover:border-white/20 hover:shadow-black/20",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                        active
                          ? "border-indigo-400/35 bg-indigo-500/20 text-indigo-200"
                          : "border-white/10 bg-white/5 text-slate-300 group-hover:border-white/20",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{card.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{card.subtitle}</p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-slate-400">
                    {jobDescriptions[card.id].slice(0, 160)}…
                  </p>
                </MotionButton>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {filteredCards.length === 0 ? (
        <p className="text-center text-sm text-slate-500">No roles match your search.</p>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/4 p-5 shadow-inner shadow-black/20 backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Selected job description</p>
        <AnimatePresence mode="wait">
          <MotionDiv
            key={selectedRoleId || "none"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="mt-3 max-h-48 overflow-y-auto overscroll-contain rounded-xl border border-white/5 bg-black/25 p-4 text-sm leading-relaxed text-slate-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-live="polite"
          >
            {selectedJdPreview ? (
              <p className="whitespace-pre-wrap">{selectedJdPreview}</p>
            ) : (
              <p className="text-slate-500">Select a role card above to preview the full sample posting.</p>
            )}
          </MotionDiv>
        </AnimatePresence>

        {selectedRoleId ? (
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/8 p-4 transition hover:border-indigo-400/35">
            <input
              type="checkbox"
              checked={includeAdvancedJd}
              onChange={(e) => onIncludeAdvancedJdChange(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-indigo-500/40"
            />
            <span>
              <span className="text-sm font-medium text-white">Include advanced / senior keyword block</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                Off by default so your score reflects learnable skills (HTML, Git, coursework, projects). Turn this on
                if you already list tools like Kubernetes, Terraform, or production ML — we append an extra keyword
                paragraph for a fairer match.
              </span>
            </span>
          </label>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Tap <span className="text-slate-400">Check ATS score</span> when you are happy with the JD text above.
          </p>
          <MotionButton
            type="button"
            whileHover={{ scale: checkDisabled || analyzing ? 1 : 1.02 }}
            whileTap={{ scale: checkDisabled || analyzing ? 1 : 0.98 }}
            onClick={onCheckAtsScore}
            disabled={checkDisabled || analyzing}
            aria-busy={analyzing}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Analyzing…
              </>
            ) : (
              <>
                <Target className="h-4 w-4" aria-hidden />
                Check ATS score
              </>
            )}
          </MotionButton>
        </div>
      </div>

      <style>{`
        .ats-role-swiper .swiper-pagination-bullet {
          background: rgba(148, 163, 184, 0.45);
          opacity: 1;
        }
        .ats-role-swiper .swiper-pagination-bullet-active {
          background: rgb(129, 140, 248);
          box-shadow: 0 0 12px rgba(129, 140, 248, 0.55);
        }
      `}</style>
    </section>
  );
}
