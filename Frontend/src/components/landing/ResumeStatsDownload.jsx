// here the code is for the resume stats download
import { useState } from "react";   
import { API_BASE } from "../../config";
import { useEffect } from "react";


// take the resume stats from the backend
const getResumeStats = async () => {
    const response = await fetch(`${API_BASE}/get-resume-stats`);
    const data = await response.json();
    return data;
}
export default function ResumeStatsDownload() {
    const [resumeStats, setResumeStats] = useState(null);
    useEffect(() => {
        getResumeStats().then(data => setResumeStats(data));
    }, []);
    if (!resumeStats) return null;
    return (
            <div className="relative flex min-h-[148px] overflow-hidden rounded-2xl border border-white/15 bg-white/6 px-4 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:min-h-[156px] sm:px-5">
            <div className="relative flex w-full flex-1 flex-row items-center place-items-center">
                <div className="min-w-0 flex-1 text-left">
                    <p className="text-center text-sm font-medium text-slate-400">Resume Stats Download</p>
                    <p className="mt-1.5 text-center text-2xl font-bold tracking-tight text-indigo-200 tabular-nums sm:text-3xl">{resumeStats.resumesGeneratedToday} / {resumeStats.resumeGenerateLimit}</p>
                    <p className="mt-2 text-xs text-slate-400 sm:text-sm text-center">{resumeStats.resumesDownloadedToday} PDF download(s) today</p>
                </div>
            </div>
        </div>
    )
}