import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, Send, Users, Globe, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";
import NotificationComposer from "../components/admin/NotificationComposer";
import AdminNotificationStats from "../components/admin/AdminNotificationStats";
import AdminNotificationHistory from "../components/admin/AdminNotificationHistory";
import adminNotificationService from "../services/adminNotificationService";

const TABS = {
  SEND: "send",
  HISTORY: "history",
  STATS: "stats",
};

function AdminNotificationPage() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.SEND);
  const [stats, setStats] = useState(null);
  const [audienceCounts, setAudienceCounts] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
    if (!userData.isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [userData, navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, countsData] = await Promise.all([
        adminNotificationService.getStats(),
        adminNotificationService.getAudienceCounts(),
      ]);
      setStats(statsData);
      setAudienceCounts(countsData);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === TABS.STATS) {
      loadStats();
    }
  }, [activeTab]);

  if (!userData?.isAdmin) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <Bell className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notification Management</h1>
              <p className="text-slate-400 mt-1">Send and manage user notifications</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-slate-700 mb-8 overflow-x-auto pb-4">
          {Object.values(TABS).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === TABS.SEND && "Send Notification"}
              {tab === TABS.HISTORY && "History"}
              {tab === TABS.STATS && "Statistics"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === TABS.SEND && (
            <div>
              <NotificationComposer onSuccess={() => setActiveTab(TABS.HISTORY)} />
            </div>
          )}

          {activeTab === TABS.HISTORY && (
            <div>
              <AdminNotificationHistory />
            </div>
          )}

          {activeTab === TABS.STATS && (
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
              ) : (
                <>
                  <AdminNotificationStats stats={stats} audienceCounts={audienceCounts} />
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default AdminNotificationPage;
