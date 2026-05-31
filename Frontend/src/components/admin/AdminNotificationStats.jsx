import React from "react";
import { TrendingUp, Users, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";

/**
 * AdminNotificationStats
 * Display statistics about notifications sent
 */
const AdminNotificationStats = ({ stats, audienceCounts }) => {
  if (!stats) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">
        No statistics available
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Sent",
      value: stats.totalSent || 0,
      icon: Send,
      color: "indigo",
    },
    {
      label: "Delivered",
      value: stats.totalDelivered || 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Read",
      value: stats.totalRead || 0,
      icon: TrendingUp,
      color: "cyan",
    },
    {
      label: "Failed",
      value: stats.totalFailed || 0,
      icon: AlertCircle,
      color: "red",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClass = {
            indigo: "bg-indigo-500/20 text-indigo-400",
            green: "bg-green-500/20 text-green-400",
            cyan: "bg-cyan-500/20 text-cyan-400",
            red: "bg-red-500/20 text-red-400",
          }[card.color];

          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-700 bg-slate-900/50 p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {Number(card.value).toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audience Counts */}
      {audienceCounts && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Audience Segments
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(audienceCounts).map(([key, count]) => {
              const labels = {
                all: "All Users",
                premium: "Premium Users",
                free: "Free Users",
                resume_uploaded: "Resume Uploaded",
                no_resume: "No Resume",
                interview_completed: "Interview Done",
                no_interview: "No Interview",
                active_30days: "Active (30 days)",
                new_users: "New Users",
              };

              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <span className="text-slate-300 text-sm">
                    {labels[key] || key}
                  </span>
                  <span className="text-lg font-bold text-indigo-400">
                    {Number(count).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentNotifications && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent Notifications
          </h3>
          <div className="space-y-3">
            {stats.recentNotifications.slice(0, 5).map((notif, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium truncate">{notif.title}</p>
                  <p className="text-slate-400 text-sm">
                    {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                    {notif.recipientCount || 0} recipients
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                    notif.type === "broadcast"
                      ? "bg-purple-500/20 text-purple-400"
                      : notif.type === "admin"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-slate-500/20 text-slate-400"
                  }`}
                >
                  {notif.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationStats;
