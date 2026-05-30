import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationAction,
  addNotification,
//   removeNotification,
//   setUnreadCount,
} from "../slices/notification.slice";

/**
 * Custom Hook for managing notifications
 * Provides access to notification state and actions
 */
export const useNotification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications);
  const socketRef = useRef(null);

  /**
   * Initialize notifications on component mount
   */
  useEffect(() => {
    // Fetch initial notifications and unread count
    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications({ limit: 20, skip: 0 }));
  }, [dispatch]);

  /**
   * Set up Socket.IO connection for real-time notifications
   */
  useEffect(() => {
    if (socketRef.current) {
      return; // Socket already connected
    }

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

      if (!token) {
        console.warn("[Notification] No token found for Socket.IO connection");
        return;
      }

      const socketUrl = "http://localhost:5001";

      const socket = io(socketUrl, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      /**
       * Handle incoming notifications
       */
      socket.on("notification:new", (notification) => {
        console.log("[Notification] New notification received:", notification);
        dispatch(addNotification(notification));
        dispatch(
          fetchUnreadCount()
        ); // Update unread count
      });

      /**
       * Handle broadcast notifications
       */
      socket.on("notification:broadcast", (notification) => {
        console.log("[Notification] Broadcast received:", notification);
        dispatch(addNotification(notification));
        dispatch(fetchUnreadCount());
      });

      /**
       * Handle connection events
       */
      socket.on("connect", () => {
        console.log("[Socket] Connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("[Socket] Disconnected");
      });

      socket.on("error", (error) => {
        console.error("[Socket] Error:", error);
      });

      return () => {
        // Cleanup on unmount
        if (socket) {
          socket.disconnect();
          socketRef.current = null;
        }
      };
    } catch (error) {
      console.error("[Notification] Socket.IO not available:", error);
    }
  }, [dispatch]);

  /**
   * Fetch all notifications with pagination
   */
  const loadNotifications = useCallback(
    (limit = 20, skip = 0, unreadOnly = false) => {
      dispatch(
        fetchNotifications({
          limit,
          skip,
          unreadOnly,
        })
      );
    },
    [dispatch]
  );

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(
    (notificationId) => {
      dispatch(markNotificationAsRead(notificationId));
    },
    [dispatch]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    (notificationId) => {
      dispatch(deleteNotificationAction(notificationId));
    },
    [dispatch]
  );

  /**
   * Get notification by ID
   */
  const getNotificationById = useCallback(
    (notificationId) => {
      return notifications.notifications.find((n) => n._id === notificationId);
    },
    [notifications]
  );

  /**
   * Get unread notifications
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.notifications.filter((n) => !n.isRead);
  }, [notifications]);

  return {
    // State
    notifications: notifications.notifications,
    unreadCount: notifications.unreadCount,
    total: notifications.total,
    isLoading: notifications.isLoading,
    isMarkingRead: notifications.isMarkingRead,
    error: notifications.error,
    success: notifications.success,

    // Actions
    loadNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationById,
    getUnreadNotifications,
  };
};

export default useNotification;
