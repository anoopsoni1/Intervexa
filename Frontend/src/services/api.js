import { API_BASE_URL } from "../config";

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
    headers: {
      ...(headers || {}),
    },
    ...rest,
  });
  return res;
}

export async function apiJson(path, options = {}) {
  const res = await apiRequest(path, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}
