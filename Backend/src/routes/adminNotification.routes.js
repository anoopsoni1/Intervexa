import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import {
  searchUsers,
  sendToUser,
  sendToMultiple,
  broadcastToAll,
  sendToAudience,
  getNotificationHistory,
  getNotificationStats,
  getAudienceCounts,
} from "../controller/adminNotification.controller.js";

const router = Router();

// All routes require authentication and admin privileges
router.use(verifyJWT);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/notifications/users/search
 * Search users by name or email
 * Query params:
 *   - q: search query (required)
 *   - limit: results per page (default: 20)
 *   - skip: pagination offset (default: 0)
 */
router.get("/users/search", searchUsers);

/**
 * POST /api/v1/admin/notifications/send-user
 * Send notification to a single user
 * Body:
 *   - targetUserId: string (required)
 *   - title: string (required)
 *   - message: string (required)
 *   - type: string (info, success, warning, error, admin)
 *   - actionUrl: string (optional)
 *   - metadata: object (optional)
 */
router.post("/send-user", sendToUser);

/**
 * POST /api/v1/admin/notifications/send-multiple
 * Send notification to multiple users
 * Body:
 *   - userIds: array of strings (required)
 *   - title: string (required)
 *   - message: string (required)
 *   - type: string
 *   - actionUrl: string (optional)
 *   - metadata: object (optional)
 */
router.post("/send-multiple", sendToMultiple);

/**
 * POST /api/v1/admin/notifications/broadcast
 * Broadcast notification to all users
 * Body:
 *   - title: string (required)
 *   - message: string (required)
 *   - type: string
 *   - actionUrl: string (optional)
 *   - metadata: object (optional)
 */
router.post("/broadcast", broadcastToAll);

/**
 * POST /api/v1/admin/notifications/send-audience
 * Send notification to users by audience segment
 * Body:
 *   - audience: string (all, premium, free, resume_uploaded, no_resume, interview_completed, no_interview, active_30days, new_users)
 *   - title: string (required)
 *   - message: string (required)
 *   - type: string
 *   - actionUrl: string (optional)
 *   - metadata: object (optional)
 */
router.post("/send-audience", sendToAudience);

/**
 * GET /api/v1/admin/notifications/history
 * Get notification history with filters
 * Query params:
 *   - limit: results per page (default: 20)
 *   - skip: pagination offset (default: 0)
 *   - type: filter by type
 *   - search: search in title/message
 *   - sortBy: createdAt or senderId
 *   - sortOrder: asc or desc
 */
router.get("/history", getNotificationHistory);

/**
 * GET /api/v1/admin/notifications/stats
 * Get notification statistics
 */
router.get("/stats", getNotificationStats);

/**
 * GET /api/v1/admin/notifications/audience-counts
 * Get counts for each audience segment
 */
router.get("/audience-counts", getAudienceCounts);

export default router;
