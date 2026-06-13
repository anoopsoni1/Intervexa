import React, { useState, useEffect } from "react";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Particles from "../components/ui/Lighting.jsx";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

import { API_BASE } from "../config";

const PAYMENT_AMOUNT = 9;

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

function Topbar() {
  return <AppHeader />;
}

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const user = useSelector((state) => state.user.userData);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.Premium) {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.Premium, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initiatePayment = async () => {
    setError("");
    setLoading(true);
    try {
      
      const res = await fetch(`${API_BASE}/payment`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: PAYMENT_AMOUNT,
          name: user ? `${user.FirstName || ""} ${user.LastName || ""}`.trim() : "Guest",
          email: user?.email || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      const { keyId, orderId, amount, currency } = data;
      if (!keyId || !orderId || amount == null) {
        setError("Invalid order from server. Please try again.");
        setLoading(false);
        return;
      }

      await loadRazorpayScript();

      const displayName = user
        ? `${user.FirstName || ""} ${user.LastName || ""}`.trim() || "User"
        : "Guest";

      const options = {
        key: keyId,
        amount,
        currency: currency || "INR",
        name: "Ansoyal AI",
        description: "Premium upgrade",
        order_id: orderId,
        handler(response) {
          sessionStorage.setItem("razorpay_order_id", response.razorpay_order_id);
          sessionStorage.setItem("razorpay_payment_id", response.razorpay_payment_id);
          sessionStorage.setItem("razorpay_signature", response.razorpay_signature);
          navigate("/payment-success");
        },
        prefill: {
          name: displayName,
          email: user?.email || "",
        },
        theme: { color: "#4F46E5" },
        modal: {
          ondismiss() {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(resp.error?.description || "Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
      setLoading(false);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err?.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

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

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />

        <main className="flex-1 flex items-center justify-center py-8 px-4">
          {!user ? (
            <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-8 max-w-md w-full text-center">
              <p className="text-slate-300 mb-4">Please log in to complete payment.</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Go to Login
              </Link>
            </div>
          ) : user.Premium ? (
            <div className="rounded-2xl border border-amber-500/30 bg-black/60 p-8 max-w-md w-full text-center">
              <p className="text-amber-400 font-semibold mb-2">You already have Premium</p>
              <p className="text-slate-400 text-sm mb-4">No need to pay again. Enjoy all premium features.</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-6 sm:p-8 hover:border-amber-500/50 transition">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Secure <span className="text-amber-500">Payment</span>
                  </h1>
                  <p className="text-slate-400 text-sm mb-6">
                    Complete your Premium upgrade using Razorpay&apos;s secure checkout.
                  </p>

                  <div className="w-full rounded-xl border border-slate-500/50 bg-white/5 px-4 py-3 mb-6 text-left">
                    <p className="text-xs text-slate-400">Amount</p>
                    <p className="text-xl font-bold text-white">₹{PAYMENT_AMOUNT}</p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 mb-4 w-full">{error}</p>
                  )}

                  <button
                    onClick={initiatePayment}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" /> Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" /> Pay ₹{PAYMENT_AMOUNT}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Your payment is encrypted and secure.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
