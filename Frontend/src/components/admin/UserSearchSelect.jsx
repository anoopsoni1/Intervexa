import React, { useState, useEffect, useRef } from "react";
import adminNotificationService from "../../services/adminNotificationService";

function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

/**
 * UserSearchSelect
 * - Search users by name/email using backend admin endpoint
 * - Supports single or multiple select
 */
const UserSearchSelect = ({ multiple = false, onChange, value = [] }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useRef(null);

  useEffect(() => {
    debouncedSearch.current = debounce(async (q) => {
      if (!q || q.trim().length === 0) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await adminNotificationService.searchUsers(q, 10, 0);
        setResults(data.users || []);
      } catch (err) {
        console.error("User search error", err);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  useEffect(() => {
    debouncedSearch.current?.(query);
  }, [query]);

  const toggleSelect = (user) => {
    if (multiple) {
      const exists = value.find((u) => u._id === user._id);
      if (exists) onChange(value.filter((u) => u._id !== user._id));
      else onChange([...value, user]);
    } else {
      onChange([user]);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search users by name or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200"
      />

      <div className="bg-white rounded-md border border-gray-100 shadow-sm max-h-48 overflow-auto">
        {loading ? (
          <div className="p-2 text-sm">Searching...</div>
        ) : results.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">No results</div>
        ) : (
          results.map((user) => (
            <div
              key={user._id}
              className={`p-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                value.find((v) => v._id === user._id) ? "bg-indigo-50" : ""
              }`}
              onClick={() => toggleSelect(user)}
            >
              <div>
                <div className="font-medium text-sm">{user.FirstName} {user.LastName}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <div className="text-xs text-gray-400">{user.isPremium ? "Premium" : "Free"}</div>
            </div>
          ))
        )}
      </div>

      {/* Selected users */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((u) => (
            <div key={u._id} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs flex items-center gap-2">
              <span>{u.FirstName} {u.LastName}</span>
              <button onClick={() => toggleSelect(u)} className="text-indigo-400">x</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearchSelect;
