import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUser, FiMail } from "react-icons/fi";
import { clearUser, setUser } from "../slices/user.slice";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import { useNavigate, Link } from "react-router-dom";
import { useUserData } from "../hooks/useUserData.js";

import { API_BASE } from "../config";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.user?.userData);
  const { user, isPending, isError, error, refetchUser, isFetching } = useUserData();
  const effectiveUser = user ?? reduxUser ?? null;

  // Update account form
  const [editFirstName, setEditFirstName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

  const getAuthHeaders = () => {
    
    return {};
  };

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
      setEditFirstName(user.FirstName || "");
      setEditEmail(user.email || "");
    } else if (reduxUser && !user) {
      setEditFirstName(reduxUser.FirstName || "");
      setEditEmail(reduxUser.email || "");
    }
  }, [dispatch, user, reduxUser]);

  useEffect(() => {
    if (!isError) return;
    const message = (error?.message || "").toLowerCase();
    if (message.includes("unauthorized") || message.includes("401")) {
      dispatch(clearUser());
      navigate("/login");
    }
  }, [dispatch, error, isError, navigate]);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setUpdateMessage({ type: "", text: "" });
    if (!editFirstName?.trim() || !editEmail?.trim()) {
      setUpdateMessage({ type: "error", text: "First name and email are required." });
      return;
    }
    setUpdateLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ FirstName: editFirstName.trim(), email: editEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUpdateMessage({ type: "error", text: data?.message || "Update failed." });
        return;
      }
      const updatedUser = data?.data || data?.user;
      if (updatedUser) {
        dispatch(setUser(updatedUser));
        await refetchUser();
      }
      setUpdateMessage({ type: "success", text: "Account updated successfully." });
    } catch (err) {
      setUpdateMessage({ type: "error", text: err?.message || "Update failed." });
    } finally {
      setUpdateLoading(false);
    }
  };

  const waitingForFirstFetch = isPending && !effectiveUser;

  if (waitingForFirstFetch) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-sm">
          <p className="text-white font-semibold">Loading profile…</p>
          <p className="mt-1 text-sm text-slate-300">Fetching your account from the server.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
        <AppHeader />
        <main className="flex-1 py-6 sm:py-8 px-4">
          <div className="mx-auto max-w-2xl">
            <Link
              to="/dashboard"
              className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all"
            >
              <span className="text-indigo-400">←</span> Back to Dashboard
            </Link>

            <div className="rounded-2xl border border-slate-200/50 bg-black/60 p-6 sm:p-8 space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Profile</h1>
                <p className="text-slate-400 text-sm sm:text-base">Manage your account.</p>
              </div>

              {isError && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200 space-y-3">
                  <p className="font-medium text-red-100">Could not load profile</p>
                  <p className="text-red-200/90">{error?.message || "Something went wrong."}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => refetchUser()}
                      className="rounded-lg bg-red-600/80 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500"
                    >
                      Try again
                    </button>
                    <Link
                      to="/login"
                      className="rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              )}

              {!effectiveUser && !isError ? (
                <div className="space-y-3 text-slate-400 text-sm">
                  <p>No profile data yet. Sign in to load your account.</p>
                  <Link
                    to="/login"
                    className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Go to sign in
                  </Link>
                </div>
              ) : effectiveUser ? (
                <>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => refetchUser()}
                      disabled={isFetching}
                      className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50"
                    >
                      {isFetching ? "Refreshing..." : "Refresh user data"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                          <FiUser className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400 uppercase tracking-wider">Name</p>
                          <p className="font-semibold text-white text-sm sm:text-base truncate">
                            {effectiveUser.FirstName} {effectiveUser.LastName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                          <FiMail className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                          <p className="font-medium text-white text-sm sm:text-base truncate">
                            {effectiveUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Update account details */}
                  <div className="pt-4 border-t border-slate-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Update account details</h2>
                    <form onSubmit={handleUpdateAccount} className="space-y-4">
                      <div>
                        <label htmlFor="profile-firstName" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                          First name
                        </label>
                        <input
                          id="profile-firstName"
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label htmlFor="profile-email" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                          Email
                        </label>
                        <input
                          id="profile-email"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Email"
                        />
                      </div>
                      {updateMessage.text && (
                        <p className={`text-sm ${updateMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                          {updateMessage.text}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="w-full sm:w-auto rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {updateLoading ? "Saving…" : "Save changes"}
                      </button>
                    </form>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </main>
        <AppFooter />
    </div>
  );
}

export default Profile;
