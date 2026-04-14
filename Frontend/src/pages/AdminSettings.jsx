import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, CheckCircle2, Settings2 } from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import {
  AI_AVATAR_PRESETS,
  getAiAvatarPreset,
  setAiAvatarPreset,
} from "../utils/aiAvatarSettings.js";

function AdminSettings() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [selectedPreset, setSelectedPreset] = useState(getAiAvatarPreset());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate("/login", { replace: true });
      return;
    }
    if (!userData.isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [userData, navigate]);

  useEffect(() => {
    setSaved(false);
  }, [selectedPreset]);

  if (!userData || !userData.isAdmin) return null;

  const handleSave = () => {
    setAiAvatarPreset(selectedPreset);
    setSaved(true);
  };

  return (
    <div className="min-h-screen text-white flex flex-col">
      <AppHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin-dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-indigo-400/35 hover:text-white"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <p className="text-sm text-slate-400">Configure AI interviewer avatar shown in AI call screens.</p>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Settings2 size={18} className="text-indigo-300" />
            AI Interviewer Avatar
          </h2>
          <p className="mb-5 text-sm text-slate-400">
            Select the default avatar for AI video interviews. This applies to all users on this browser profile.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.values(AI_AVATAR_PRESETS).map((preset) => {
              const active = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-indigo-400/55 bg-indigo-500/15 shadow-[0_0_0_1px_rgba(129,140,248,0.35)]"
                      : "border-white/10 bg-black/25 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/15 bg-slate-900">
                      <img src={preset.src} alt={preset.label} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white">{preset.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{preset.description}</p>
                    </div>
                  </div>
                  {active ? (
                    <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-200">
                      <CheckCircle2 size={16} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Save settings
            </button>
            {saved ? <p className="text-sm text-emerald-300">Saved. New AI calls will use this avatar.</p> : null}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}

export default AdminSettings;
