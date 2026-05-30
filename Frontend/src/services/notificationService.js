import axios from "axios";

const API_BASE_URL = "https://intervexa.onrender.com" ;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/notifications`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Notification API Error:",
      error.response?.data || error.message
    );

    return Promise.reject(
      error.response?.data || error
    );
  }
);

const notificationService = {
  // Get notifications
  getNotifications: async (
    limit = 20,
    skip = 0,
    unreadOnly = false
  ) => {
    const response = await api.get("/", {
      params: {
        limit,
        skip,
        unreadOnly,
      },
    });

    return response.data.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get("/unread-count");
    return response.data.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(
      `/${notificationId}/read`
    );

    return response.data.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch("/read-all");
    return response.data.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(
      `/${notificationId}`
    );

    return response.data.data;
  },

  // Delete all notifications
  deleteAllNotifications: async (
    unreadOnly = false
  ) => {
    const response = await api.delete("/", {
      params: { unreadOnly },
    });

    return response.data.data;
  },

  // Admin: Send notification to one user
  sendNotificationToUser: async (
    targetUserId,
    title,
    message,
    options = {}
  ) => {
    const response = await api.post(
      "/admin/send-to-user",
      {
        targetUserId,
        title,
        message,
        ...options,
      }
    );

    return response.data.data;
  },

  // Admin: Send notification to multiple users
  sendNotificationToMultiple: async (
    userIds,
    title,
    message,
    options = {}
  ) => {
    const response = await api.post(
      "/admin/send-to-multiple",
      {
        userIds,
        title,
        message,
        ...options,
      }
    );

    return response.data.data;
  },

  // Admin: Broadcast notification
  broadcastNotification: async (
    title,
    message,
    options = {}
  ) => {
    const response = await api.post(
      "/admin/broadcast",
      {
        title,
        message,
        ...options,
      }
    );

    return response.data.data;
  },
};

export default notificationService;

