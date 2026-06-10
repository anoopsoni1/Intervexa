import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "../services/notificationService";

/**
 * Async thunks for notification operations
 */

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ limit = 20, skip = 0, unreadOnly = false }, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(
        limit,
        skip,
        unreadOnly
      );
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const deleteNotificationAction = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAll",
  async (unreadOnly = false, { rejectWithValue }) => {
    try {
      await notificationService.deleteAllNotifications(unreadOnly);
      return true;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

/**
 * Initial State
 */
const initialState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  limit: 20,
  skip: 0,
  hasMore: false,
  isLoading: false,
  isMarkingRead: false,
  error: null,
  success: null,
};

/**
 * Redux Slice
 */
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    /**
     * Add a new notification to the list (from Socket.IO)
     */
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.total += 1;
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    /**
     * Update notification in the list (from Socket.IO)
     */
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload._id
      );
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },

    /**
     * Remove notification from the list
     */
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload
      );
      if (index !== -1) {
        state.notifications.splice(index, 1);
        state.total -= 1;
      }
    },

    /**
     * Clear all notifications
     */
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.total = 0;
    },

    /**
     * Clear error and success messages
     */
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },

    /**
     * Increment unread count
     */
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },

    /**
     * Decrement unread count
     */
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },

    /**
     * Set unread count directly
     */
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    /**
     * Fetch Notifications
     */
   builder.addCase(fetchNotifications.fulfilled, (state, action) => {
  state.isLoading = false;

  const {
    notifications,
    total,
    unreadCount,
    limit,
    skip,
    hasMore,
  } = action.payload;

  if (skip === 0) {
    // First load or refresh
    state.notifications = notifications;
  } else {
    // Load more - append without duplicates
    const existingIds = new Set(state.notifications.map((n) => n._id));

    const newNotifications = notifications.filter(
      (n) => !existingIds.has(n._id)
    );

    state.notifications.push(...newNotifications);
  }

  state.total = total;
  state.unreadCount = unreadCount;
  state.limit = limit;
  state.skip = skip;
  state.hasMore = hasMore;
});

    /**
     * Fetch Unread Count
     */
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload.unreadCount;
    });

    /**
     * Mark as Read
     */
    builder.addCase(markNotificationAsRead.pending, (state) => {
      state.isMarkingRead = true;
    });
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      state.isMarkingRead = false;
      const notification = state.notifications.find(
        (n) => n._id === action.payload._id
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });
    builder.addCase(markNotificationAsRead.rejected, (state, action) => {
      state.isMarkingRead = false;
      state.error = action.payload;
    });

    /**
     * Mark All as Read
     */
    builder.addCase(markAllNotificationsAsRead.pending, (state) => {
      state.isMarkingRead = true;
    });
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.isMarkingRead = false;
      state.notifications.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
      state.success = "All notifications marked as read";
    });
    builder.addCase(markAllNotificationsAsRead.rejected, (state, action) => {
      state.isMarkingRead = false;
      state.error = action.payload;
    });

    /**
     * Delete Notification
     */
    builder.addCase(deleteNotificationAction.fulfilled, (state, action) => {
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload
      );
      if (index !== -1) {
        if (!state.notifications[index].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
        state.total = Math.max(0, state.total - 1);
      }
    });
    builder.addCase(deleteNotificationAction.rejected, (state, action) => {
      state.error = action.payload;
    });

    /**
     * Delete All Notifications
     */
    builder.addCase(deleteAllNotifications.fulfilled, (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.total = 0;
      state.success = "All notifications deleted";
    });
    builder.addCase(deleteAllNotifications.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const {
  addNotification,
  updateNotification,
  removeNotification,
  clearNotifications,
  clearMessages,
  incrementUnreadCount,
  decrementUnreadCount,
  setUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
