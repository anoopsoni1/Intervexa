import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "https://intervexa.onrender.com";
const adminApi = axios.create({
  baseURL: `${API_BASE}/api/v1/admin/notifications`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const searchUsers = createAsyncThunk("adminNotifications/searchUsers", async ({ q, limit = 20 }) => {
  const res = await adminApi.get(`/users/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  return res.data.data;
});

export const sendToUser = createAsyncThunk("adminNotifications/sendToUser", async (payload) => {
  const res = await adminApi.post("/send-user", payload);
  return res.data.data;
});

export const sendToMultiple = createAsyncThunk("adminNotifications/sendToMultiple", async (payload) => {
  const res = await adminApi.post("/send-multiple", payload);
  return res.data.data;
});

export const broadcast = createAsyncThunk("adminNotifications/broadcast", async (payload) => {
  const res = await adminApi.post("/broadcast", payload);
  return res.data.data;
});

export const sendToAudience = createAsyncThunk("adminNotifications/sendToAudience", async (payload) => {
  const res = await adminApi.post("/send-audience", payload);
  return res.data.data;
});

export const getHistory = createAsyncThunk("adminNotifications/getHistory", async (params) => {
  const qs = new URLSearchParams(params).toString();
  const res = await adminApi.get(`/history?${qs}`);
  return res.data.data;
});

export const getStats = createAsyncThunk("adminNotifications/getStats", async () => {
  const res = await adminApi.get("/stats");
  return res.data.data;
});

export const getAudienceCounts = createAsyncThunk("adminNotifications/getAudienceCounts", async () => {
  const res = await adminApi.get("/audience-counts");
  return res.data.data;
});

const adminNotificationSlice = createSlice({
  name: "adminNotifications",
  initialState: {
    users: [],
    history: [],
    stats: null,
    audienceCounts: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getHistory.fulfilled, (state, action) => {
        state.history = action.payload.notifications || [];
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getAudienceCounts.fulfilled, (state, action) => {
        state.audienceCounts = action.payload;
      });
  },
});

export default adminNotificationSlice.reducer;
