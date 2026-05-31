import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import adminNotificationService from "../../services/adminNotificationService";

/**
 * AdminNotificationHistory
 * Display history of sent notifications with filtering and pagination
 */
const AdminNotificationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const LIMIT = 20;

  useEffect(() => {
    loadHistory();
  }, [page, searchQuery, filterType]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminNotificationService.getHistory({
        limit: LIMIT,
        skip: page * LIMIT,
        search: searchQuery || undefined,
        type: filterType || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setHistory(data.notifications || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError(err.message || "Failed to load notification history");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleFilterType = (e) => {
    setFilterType(e.target.value);
    setPage(0);
  };

  const totalPages = Math.ceil(totalCount / LIMIT);
  const canGoNext = page < totalPages - 1;
  const canGoPrev = page > 0;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="relative sm:w-40">
          <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <select
            value={filterType}
            onChange={handleFilterType}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
          >
            <option value="">All Types</option>
            <option value="broadcast">Broadcast</option>
            <option value="admin">Admin</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : history.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No notifications found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700 bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-300">
                      Recipients
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-300">
                      Read
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {history.map((notif) => (
                    <tr
                      key={notif._id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium truncate max-w-xs">
                            {notif.title}
                          </p>
                          {notif.message && (
                            <p className="text-slate-400 text-xs truncate max-w-xs mt-1">
                              {notif.message}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            notif.type === "broadcast"
                              ? "bg-purple-500/20 text-purple-400"
                              : notif.type === "admin"
                              ? "bg-blue-500/20 text-blue-400"
                              : notif.type === "success"
                              ? "bg-green-500/20 text-green-400"
                              : notif.type === "error"
                              ? "bg-red-500/20 text-red-400"
                              : notif.type === "warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {notif.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium">
                        {notif.recipientCount || 0}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">
                        {notif.readCount || 0}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3 bg-slate-800/30">
              <div className="text-sm text-slate-400">
                Showing {page * LIMIT + 1} to{" "}
                {Math.min((page + 1) * LIMIT, totalCount)} of {totalCount}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!canGoPrev}
                  className="p-2 rounded-lg border border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-2 py-1 rounded text-sm font-medium transition-all ${
                          page === pageNum
                            ? "bg-indigo-500 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!canGoNext}
                  className="p-2 rounded-lg border border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationHistory;
