import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../config";

function normalizeUserPayload(raw) {
  if (!raw) return null;
  if (raw?.data?.user) return raw.data.user;
  if (raw?.data && typeof raw.data === "object" && !Array.isArray(raw.data)) return raw.data;
  if (raw?.user) return raw.user;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  return null;
}

async function fetchUserData() {
  if (!API_BASE || String(API_BASE).includes("undefined")) {
    throw new Error("API is not configured. Set VITE_API_BASE_URL in .env");
  }
  const accessToken = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE}/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json?.message || "").toString();
    if (res.status === 401 || /unauthorized/i.test(msg)) {
      throw new Error("Unauthorized");
    }
    throw new Error(msg || "Failed to fetch user data");
  }

  const normalized = normalizeUserPayload(json);
  if (!normalized) {
    throw new Error("Invalid user payload");
  }
  return normalized;
}

export function useUserData(options = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ["user"],
    queryFn: fetchUserData,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetchUser: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
