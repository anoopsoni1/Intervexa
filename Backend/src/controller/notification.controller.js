import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendNotification,
  broadcastNotificationToAll,
} from "../utils/notificationService.js";

/**
 * Get all notifications for the logged-in user
 * Supports pagination and filtering
 */
export const getNotifications = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 20, skip = 0, unreadOnly = false } = req.query;

  const result = await getUserNotifications(userId, {
    limit: parseInt(limit),
    skip: parseInt(skip),
    unreadOnly: unreadOnly === "true",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

/**
 * Get unread notification count
 */
export const getUnreadCount = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { notifications, unreadCount } = await getUserNotifications(userId, {
    unreadOnly: true,
    limit: 1,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { unreadCount },
      "Unread count fetched successfully"
    )
  );
});

/**
 * Mark a single notification as read
 */
export const markAsRead = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  const notification = await markNotificationAsRead(notificationId, userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notification,
        "Notification marked as read successfully"
      )
    );
});

/**
 * Mark all notifications as read for the user
 */
export const markAllAsRead = Asynchandler(async (req, res) => {
  const userId = req.user._id;

  const result = await markAllNotificationsAsRead(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "All notifications marked as read successfully"
      )
    );
});

/**
 * Delete a single notification
 */
export const deleteNotificationEndpoint = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  const notification = await deleteNotification(notificationId, userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notification,
        "Notification deleted successfully"
      )
    );
});

/**
 * Delete all notifications (admin only)
 */
export const deleteAllNotificationsEndpoint = Asynchandler(
  async (req, res) => {
    const userId = req.user._id;
    const { unreadOnly = false } = req.query;

    const result = await deleteAllNotifications(userId, unreadOnly === "true");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Notifications deleted successfully"
        )
      );
  }
);

/**
 * Admin: Send notification to a specific user
 * Requires admin privileges
 */
export const sendNotificationAdmin = Asynchandler(async (req, res) => {
  const adminId = req.user._id;
  const { targetUserId, title, message, type, actionUrl, metadata } = req.body;

  // Verify admin status
  if (!req.user.isAdmin) {
    throw new ApiError(403, "Only admins can send notifications");
  }

  // Verify target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, "Target user not found");
  }

  const notification = await sendNotification(
    targetUserId,
    title,
    message,
    {
      type: type || "info",
      actionUrl: actionUrl || null,
      metadata: metadata || {},
      senderId: adminId,
    }
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        notification,
        "Notification sent successfully"
      )
    );
});

/**
 * Admin: Broadcast notification to all users
 * Requires admin privileges
 */
export const broadcastNotification = Asynchandler(async (req, res) => {
  const adminId = req.user._id;
  const { title, message, type, actionUrl, metadata } = req.body;

  // Verify admin status
  if (!req.user.isAdmin) {
    throw new ApiError(403, "Only admins can broadcast notifications");
  }

  if (!title || !message) {
    throw new ApiError(400, "Title and message are required");
  }

  const result = await broadcastNotificationToAll(
    title,
    message,
    adminId,
    {
      type: type || "admin",
      actionUrl: actionUrl || null,
      metadata: metadata || {},
    }
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        result,
        "Broadcast notification sent successfully"
      )
    );
});

/**
 * Admin: Send notification to multiple users
 * Requires admin privileges
 */
export const sendNotificationToMultipleUsers = Asynchandler(
  async (req, res) => {
    const adminId = req.user._id;
    const { userIds, title, message, type, actionUrl, metadata } = req.body;

    // Verify admin status
    if (!req.user.isAdmin) {
      throw new ApiError(403, "Only admins can send notifications");
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new ApiError(400, "userIds must be a non-empty array");
    }

    if (!title || !message) {
      throw new ApiError(400, "Title and message are required");
    }

    // Verify users exist
    const existingUsers = await User.find({ _id: { $in: userIds } });
    if (existingUsers.length !== userIds.length) {
      throw new ApiError(400, "Some target users not found");
    }

    const { sendNotificationToMultiple } = await import(
      "../utils/notificationService.js"
    );

    const notifications = await sendNotificationToMultiple(
      userIds,
      title,
      message,
      {
        type: type || "info",
        actionUrl: actionUrl || null,
        metadata: metadata || {},
        senderId: adminId,
      }
    );

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { count: notifications.length },
          "Notifications sent successfully"
        )
      );
  }
);
