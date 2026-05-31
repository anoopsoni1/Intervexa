import React from "react";

const AUDIENCES = [
  { value: "all", label: "All Users", description: "Send to everyone" },
  { value: "premium", label: "Premium Users", description: "Only premium members" },
  { value: "free", label: "Free Users", description: "Only free tier members" },
  { value: "resume_uploaded", label: "Users With Resume", description: "Users who uploaded resumes" },
  { value: "no_resume", label: "Users Without Resume", description: "Users who haven't uploaded resumes" },
  { value: "interview_completed", label: "Interview Completed", description: "Users who completed interviews" },
  { value: "no_interview", label: "No Interview", description: "Users without completed interviews" },
  { value: "active_30days", label: "Active (30 days)", description: "Active in the last 30 days" },
  { value: "new_users", label: "New Users", description: "Registered in the last 7 days" },
];

const AudienceSelector = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {AUDIENCES.map((a) => (
        <button
          key={a.value}
          type="button"
          onClick={() => onChange(a.value)}
          className={`p-3 rounded-lg text-left transition-all border-2 ${
            value === a.value
              ? "border-indigo-500 bg-indigo-500/20 ring-1 ring-indigo-500/50"
              : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
          }`}
        >
          <p className="font-medium text-white">{a.label}</p>
          <p className="text-xs text-slate-400 mt-1">{a.description}</p>
        </button>
      ))}
    </div>
  );
};

export default AudienceSelector;
