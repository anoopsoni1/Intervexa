import { Notification } from "../models/Notification.model.js";
import { ApiError } from "./ApiError.js";

let globalIoInstance = null;

/**
 * Set the Socket.IO instance globally for use in utilities
 * Call this from server.js after attachSocketServer()
 */
export function setGlobalIoInstance(io) {
  globalIoInstance = io;
}

/**
 * Get the global Socket.IO instance
 */
export function getGlobalIoInstance() {
  return globalIoInstance;
}

/**
 * Send a notification to a specific user
 * Saves to database and emits real-time event if user is online
 *
 * @param {string} userId - Target user ID (MongoDB ObjectId)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @param {string} options.type - Notification type (info, success, warning, error, admin)
 * @param {string} options.actionUrl - URL to navigate to when notification is clicked
 * @param {Object} options.metadata - Additional metadata to store with notification
 * @param {string} options.senderId - ID of the user sending the notification (for tracking)
 * @returns {Promise<Object>} Created notification document
 */
export async function sendNotification(
  userId,
  title,
  message,
  options = {}
) {
  try {
    if (!userId || !title || !message) {
      throw new ApiError(400, "userId, title, and message are required");
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: options.type || "info",
      actionUrl: options.actionUrl || null,
      metadata: options.metadata || {},
      senderId: options.senderId || null,
    });

    // Emit real-time notification via Socket.IO if user is online
    const io = getGlobalIoInstance();
    if (io) {
      io.to(`user:${userId}`).emit("notification:new", {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error("[Notification Error]", error);
    throw error;
  }
}

/**
 * Send notifications to multiple users
 *
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options (same as sendNotification)
 * @returns {Promise<Array>} Created notification documents
 */
export async function sendNotificationToMultiple(
  userIds,
  title,
  message,
  options = {}
) {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new ApiError(400, "userIds must be a non-empty array");
    }

    const notifications = await Notification.insertMany(
      userIds.map((userId) => ({
        userId,
        title,
        message,
        type: options.type || "info",
        actionUrl: options.actionUrl || null,
        metadata: options.metadata || {},
        senderId: options.senderId || null,
        broadcastId: options.broadcastId || null,
      }))
    );

    // Emit real-time notifications
    const io = getGlobalIoInstance();
    if (io) {
      userIds.forEach((userId) => {
        io.to(`user:${userId}`).emit("notification:new", {
          title,
          message,
          type: options.type || "info",
          actionUrl: options.actionUrl || null,
        });
      });
    }

    return notifications;
  } catch (error) {
    console.error("[Notification Error]", error);
    throw error;
  }
}

/**
 * Broadcast notification to all users (admin only)
 *
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} adminId - Admin user ID sending the broadcast
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Broadcast result statistics
 */
export async function broadcastNotificationToAll(
  title,
  message,
  adminId,
  options = {}
) {
  try {
    if (!title || !message || !adminId) {
      throw new ApiError(400, "title, message, and adminId are required");
    }

    // Get all users
    const { User } = await import("../models/User.model.js");
    const allUsers = await User.find({}, { _id: 1 });
    const userIds = allUsers.map((u) => u._id);

    if (userIds.length === 0) {
      return {
        success: true,
        usersNotified: 0,
        message: "No users to notify",
      };
    }

    const broadcastId = new Date().getTime().toString();

    // Create notifications for all users
    const notifications = await sendNotificationToMultiple(
      userIds,
      title,
      message,
      {
        type: options.type || "admin",
        senderId: adminId,
        broadcastId,
        metadata: options.metadata || {},
        actionUrl: options.actionUrl || null,
      }
    );

    // Emit global broadcast event
    const io = getGlobalIoInstance();
    if (io) {
      io.emit("notification:broadcast", {
        title,
        message,
        type: options.type || "admin",
        broadcastId,
      });
    }

    return {
      success: true,
      usersNotified: notifications.length,
      broadcastId,
    };
  } catch (error) {
    console.error("[Broadcast Error]", error);
    throw error;
  }
}

/**
 * Get notifications for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of notifications to fetch (default: 20)
 * @param {number} options.skip - Number of notifications to skip for pagination (default: 0)
 * @param {boolean} options.unreadOnly - Fetch only unread notifications (default: false)
 * @returns {Promise<Object>} Notifications and metadata
 */
export async function getUserNotifications(userId, options = {}) {
  try {
    const limit = options.limit || 20;
    const skip = options.skip || 0;
    const unreadOnly = options.unreadOnly || false;

    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  } catch (error) {
    console.error("[Get Notifications Error]", error);
    throw error;
  }
}

/**
 * Mark a notification as read
 *
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated notification
 */
export async function markNotificationAsRead(notificationId, userId) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    const io = getGlobalIoInstance();
    if (io) {
      io.to(`user:${userId}`).emit("notification:read", {
        notificationId,
        userId,
        isRead: true,
      });
    }

    return notification;
  } catch (error) {
    console.error("[Mark as Read Error]", error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Update result
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    const io = getGlobalIoInstance();
    if (io) {
      io.to(`user:${userId}`).emit("notification:read-all", {
        userId,
        modifiedCount: result.modifiedCount,
      });
    }

    return {
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged,
    };
  } catch (error) {
    console.error("[Mark All as Read Error]", error);
    throw error;
  }
}

/**
 * Delete a notification
 *
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Deleted notification
 */
export async function deleteNotification(notificationId, userId) {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    return notification;
  } catch (error) {
    console.error("[Delete Notification Error]", error);
    throw error;
  }
}

/**
 * Delete all notifications for a user (optional: unread only)
 *
 * @param {string} userId - User ID
 * @param {boolean} unreadOnly - Delete only unread notifications (default: false)
 * @returns {Promise<Object>} Delete result
 */
export async function deleteAllNotifications(userId, unreadOnly = false) {
  try {
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const result = await Notification.deleteMany(query);

    return {
      deletedCount: result.deletedCount,
      acknowledged: result.acknowledged,
    };
  } catch (error) {
    console.error("[Delete All Notifications Error]", error);
    throw error;
  }
}
