import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotificationEndpoint,
  deleteAllNotificationsEndpoint,
  sendNotificationAdmin,
  broadcastNotification,
  sendNotificationToMultipleUsers,
} from "../controller/notification.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * User notification routes (all require authentication)
 */

/**
 * GET /api/v1/notifications
 * Get all notifications for the logged-in user
 * Query params:
 *   - limit: number of notifications to fetch (default: 20)
 *   - skip: number of notifications to skip for pagination (default: 0)
 *   - unreadOnly: boolean to fetch only unread notifications (default: false)
 */
router.get("/", verifyJWT, getNotifications);

/**
 * GET /api/v1/notifications/unread-count
 * Get count of unread notifications
 */
router.get("/unread-count", verifyJWT, getUnreadCount);

/**
 * PATCH /api/v1/notifications/:notificationId/read
 * Mark a specific notification as read
 */
router.patch("/:notificationId/read", verifyJWT, markAsRead);

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.patch("/read-all", verifyJWT, markAllAsRead);

/**
 * DELETE /api/v1/notifications/:notificationId
 * Delete a specific notification
 */
router.delete("/:notificationId", verifyJWT, deleteNotificationEndpoint);

/**
 * DELETE /api/v1/notifications
 * Delete all notifications
 * Query params:
 *   - unreadOnly: boolean to delete only unread notifications (default: false)
 */
router.delete("/", verifyJWT, deleteAllNotificationsEndpoint);

/**
 * Admin routes
 */

/**
 * POST /api/v1/notifications/admin/send-to-user
 * Send notification to a specific user
 * Body:
 *   - targetUserId: string (MongoDB ObjectId)
 *   - title: string
 *   - message: string
 *   - type: string (optional, enum: info, success, warning, error, admin)
 *   - actionUrl: string (optional)
 *   - metadata: object (optional)
 */
router.post(
  "/admin/send-to-user",
  verifyJWT,
  sendNotificationAdmin
);

/**
 * POST /api/v1/notifications/admin/send-to-multiple
 * Send notification to multiple users
 * Body:
 *   - userIds: array of strings (MongoDB ObjectIds)
 *   - title: string
 *   - message: string
 *   - type: string (optional)
 *   - actionUrl: string (optional)
 *   - metadata: object (optional)
 */
router.post(
  "/admin/send-to-multiple",
  verifyJWT,
  sendNotificationToMultipleUsers
);

/**
 * POST /api/v1/notifications/admin/broadcast
 * Send notification to all users
 * Body:
 *   - title: string
 *   - message: string
 *   - type: string (optional)
 *   - actionUrl: string (optional)
 *   - metadata: object (optional)
 */
router.post(
  "/admin/broadcast",
  verifyJWT,
  broadcastNotification
);

export default router;
