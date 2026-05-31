import axios from "axios";

const API_BASE_URL = "https://intervexa.onrender.com";

const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/admin/notifications`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data;
    const message = responseData?.message || responseData?.error || error.message;
    return Promise.reject(new Error(message || "Notification admin API error"));
  }
);

const adminNotificationService = {
  searchUsers: async (query, limit = 20, skip = 0) => {
    const response = await adminApi.get(
      `/users/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`
    );
    return response.data.data;
  },

  sendToUser: async (payload) => {
    const response = await adminApi.post("/send-user", payload);
    return response.data.data;
  },

  sendToMultiple: async (payload) => {
    const response = await adminApi.post("/send-multiple", payload);
    return response.data.data;
  },

  broadcast: async (payload) => {
    const response = await adminApi.post("/broadcast", payload);
    return response.data.data;
  },

  sendToAudience: async (payload) => {
    const response = await adminApi.post("/send-audience", payload);
    return response.data.data;
  },

  getHistory: async (params) => {
    const query = new URLSearchParams(params).toString();
    const response = await adminApi.get(`/history?${query}`);
    return response.data.data;
  },

  getStats: async () => {
    const response = await adminApi.get("/stats");
    return response.data.data;
  },

  getAudienceCounts: async () => {
    const response = await adminApi.get("/audience-counts");
    return response.data.data;
  },
};

export default adminNotificationService;
