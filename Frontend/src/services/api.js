import { API_BASE_URL } from "../config";

/** Shown when the API returns 403 with premium enforcement (message often "Premium required"). */
export const UPGRADE_PREMIUM_MESSAGE = "Upgrade to Premium";

/**
 * Parse JSON from a fetch Response. If the body is HTML (SPA fallback / misconfigured proxy), throw a clear Error.
 */
export async function parseResponseJson(res) {
  const text = await res.text();
  if (!text?.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    const start = text.trimStart().slice(0, 80);
    if (start.startsWith("<!") || start.toLowerCase().startsWith("<html")) {
      throw new Error(
        "The server returned a web page instead of API data. Use a valid API URL (VITE_API_BASE_URL), or proxy /api on your host (see vercel.json / public/_redirects) if you use same-origin API."
      );
    }
    throw new Error("Invalid JSON from server.");
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("accessToken") ||
    window.sessionStorage.getItem("accessToken") ||
    ""
  );
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

function buildUrl(path) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}

export async function apiRequest(path, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(buildUrl(path), {
    credentials: "include",
    headers: getAuthHeaders(headers || {}),
    ...rest,
  });
  return res;
}

export async function apiJson(path, options = {}) {
  const res = await apiRequest(path, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

/** Non-null when status is 403 from a premium-protected route (backend message e.g. "Premium required"). */
export function messageForPremiumForbidden(status) {
  if (status !== 403) return null;
  return UPGRADE_PREMIUM_MESSAGE;
}
