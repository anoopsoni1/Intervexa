import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    highlight: false,
    features: [
      "30 resume downloads per day",
      "Basic ATS score",
      "Only Modern templates",
      "Email support",
      "AI resume optimization",
      "Export to PDF",
    ],
    cta: "Activated Free Plan",
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/month",
    highlight: true,
    tag: "Most Popular",
    features: [

      "Unlimited resume downloads per day",
      "Advanced ATS analysis",
      "AI resume generator",
      "All templates",
      "Priority support",
      "AI resume optimization",
      "AI portfolio generator",
      "Export to PDF",
      "Live interview practice",
      "AI career roadmap",
      "AI coding interview",
      "Email support",
    ],
    cta: "Start Now",
  },
];

function PricingSection() {
  const user = useSelector((state) => state.user.userData);
  const isLoggedIn = Boolean(user);

  const getPlanHref = (plan) => {
    if (user?.Premium && plan.cta === "Start Now") return "/dashboard";
    if (plan.name === "Free") {
      return isLoggedIn ? "/dashboard" : `/login?from=${encodeURIComponent("/dashboard")}`;
    }
    if (plan.cta === "Start Now") {
      return isLoggedIn ? "/payment" : `/login?from=${encodeURIComponent("/payment")}`;
    }
    return "/dashboard";
  };

  const getPlanCtaLabel = (plan) => {
    if (plan.name === "Free") {
      return isLoggedIn ? "Activated Free Plan" : "Free";
    }
    if (user?.Premium && plan.cta === "Start Now") return "Go to Dashboard";
    return plan.cta;
  };

  return (
      <div className="min-h-screen">
        <AppHeader />

        <section className="py-16 md:py-20  relative z-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-sm text-slate-300 md:text-base">
              No hidden fees. Start free and upgrade when ready.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-3xl border bg-black/10 backdrop-blur backdrop-brightness-150 p-6 shadow-xl transition ${
                    plan.highlight
                      ? "border-indigo-500 shadow-indigo-500/30 scale-[1.03]"
                      : "border-slate-700"
                  }`}
                >
                  {plan.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      {plan.tag}
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-white">
                    {plan.name}
                  </h3>

                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-300">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2 text-sm text-slate-200 text-left">
                    {plan.features.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-emerald-400">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={getPlanHref(plan)}
                    className={`mt-6 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      plan.highlight
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                  >
                    {getPlanCtaLabel(plan)}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        <AppFooter />
      </div>
  );
}

export default PricingSection;
