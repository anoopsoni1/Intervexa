import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";
import {
  sendNotification,
  sendNotificationToMultiple,
  broadcastNotificationToAll,
} from "../utils/notificationService.js";

/**
 * ADMIN: Search users by name or email
 * GET /api/v1/admin/notifications/users/search?q=john&limit=10
 */
export const searchUsers = Asynchandler(async (req, res) => {
  const { q = "", limit = 20, skip = 0 } = req.query;

  if (!q || q.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  const searchQuery = {
    $or: [
      { FirstName: { $regex: q, $options: "i" } },
      { LastName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  };

  const [users, total] = await Promise.all([
    User.find(searchQuery)
      .select("_id FirstName LastName email isPremium isAdmin")
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean(),
    User.countDocuments(searchQuery),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + parseInt(limit) < total,
      },
      "Users fetched successfully"
    )
  );
});

/**
 * ADMIN: Send notification to single user
 * POST /api/v1/admin/notifications/send-user
 */
export const sendToUser = Asynchandler(async (req, res) => {
  const adminId = req.user._id;
  const { targetUserId, title, message, type, actionUrl, metadata } = req.body;

  // Validation
  if (!targetUserId) throw new ApiError(400, "targetUserId is required");
  if (!title) throw new ApiError(400, "title is required");
  if (!message) throw new ApiError(400, "message is required");

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

  return res.status(201).json(
    new ApiResponse(201, notification, "Notification sent successfully")
  );
});

/**
 * ADMIN: Send notification to multiple users
 * POST /api/v1/admin/notifications/send-multiple
 */
export const sendToMultiple = Asynchandler(async (req, res) => {
  const adminId = req.user._id;
  const { userIds, title, message, type, actionUrl, metadata } = req.body;

  // Validation
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, "userIds must be a non-empty array");
  }
  if (!title) throw new ApiError(400, "title is required");
  if (!message) throw new ApiError(400, "message is required");

  // Verify users exist
  const existingUsers = await User.find(
    { _id: { $in: userIds } },
    { _id: 1 }
  );
  if (existingUsers.length !== userIds.length) {
    throw new ApiError(400, "Some target users not found");
  }

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

  return res.status(201).json(
    new ApiResponse(
      201,
      { count: notifications.length, notifications },
      "Notifications sent successfully"
    )
  );
});

/**
 * ADMIN: Broadcast notification to all users
 * POST /api/v1/admin/notifications/broadcast
 */
export const broadcastToAll = Asynchandler(async (req, res) => {
  const adminId = req.user._id;
  const { title, message, type, actionUrl, metadata } = req.body;

  // Validation
  if (!title) throw new ApiError(400, "title is required");
  if (!message) throw new ApiError(400, "message is required");

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

  return res.status(201).json(
    new ApiResponse(
      201,
      result,
      "Broadcast notification sent successfully"
    )
  );
});

/**
 * ADMIN: Send notification to users by audience
 * POST /api/v1/admin/notifications/send-audience
 *
 * Audience types:
 * - all: All users
 * - premium: Premium users only
 * - free: Free users only
 * - resume_uploaded: Users who uploaded resume
 * - no_resume: Users who haven't uploaded resume
 * - interview_completed: Users who completed interview
 * - no_interview: Users who haven't completed interview
 * - active_30days: Active users (last 30 days)
 * - new_users: Users created in last 7 days
 */
export const sendToAudience = Asynchandler(async (req, res) => {
  const adminId = req.user._id;
  const { audience, title, message, type, actionUrl, metadata } = req.body;

  // Validation
  if (!audience) throw new ApiError(400, "audience is required");
  if (!title) throw new ApiError(400, "title is required");
  if (!message) throw new ApiError(400, "message is required");

  let query = {};
  let audienceLabel = audience;

  // Build query based on audience type
  switch (audience) {
    case "all":
      query = {};
      break;

    case "premium":
      query = { isPremium: true };
      break;

    case "free":
      query = { isPremium: false };
      break;

    case "resume_uploaded":
      query = { "metadata.resumeUploaded": true };
      break;

    case "no_resume":
      query = { $or: [{ "metadata.resumeUploaded": false }, { "metadata.resumeUploaded": { $exists: false } }] };
      break;

    case "interview_completed":
      query = { "metadata.interviewCompleted": true };
      break;

    case "no_interview":
      query = { $or: [{ "metadata.interviewCompleted": false }, { "metadata.interviewCompleted": { $exists: false } }] };
      break;

    case "active_30days":
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query = { lastLoginAt: { $gte: thirtyDaysAgo } };
      break;

    case "new_users":
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query = { createdAt: { $gte: sevenDaysAgo } };
      break;

    default:
      throw new ApiError(400, "Invalid audience type");
  }

  // Get users matching criteria
  const targetUsers = await User.find(query, { _id: 1 });
  if (targetUsers.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { count: 0 },
        `No users found for audience: ${audienceLabel}`
      )
    );
  }

  const userIds = targetUsers.map((u) => u._id);

  // Send notifications
  const notifications = await sendNotificationToMultiple(
    userIds,
    title,
    message,
    {
      type: type || "info",
      actionUrl: actionUrl || null,
      metadata: { ...metadata, audience },
      senderId: adminId,
    }
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { count: notifications.length, audience: audienceLabel },
      `Notification sent to ${notifications.length} users`
    )
  );
});

/**
 * ADMIN: Get notification history
 * GET /api/v1/admin/notifications/history
 * Query params:
 *   - limit: number per page (default: 20)
 *   - skip: pagination offset (default: 0)
 *   - type: filter by notification type
 *   - search: search in title and message
 *   - sortBy: createdAt or senderId (default: createdAt)
 *   - sortOrder: asc or desc (default: desc)
 */
export const getNotificationHistory = Asynchandler(async (req, res) => {
  const {
    limit = 20,
    skip = 0,
    type,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  let query = {};

  // Filter by type
  if (type) {
    query.type = type;
  }

  // Search in title and message
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  const sortObj = {};
  const validSortFields = ["createdAt", "senderId", "type"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

  // Get notifications with sender details
  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate("senderId", "FirstName LastName email isAdmin")
      .populate("userId", "FirstName LastName email")
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean(),
    Notification.countDocuments(query),
  ]);

  // Enhance response with recipient count and delivery status
  const enhancedNotifications = await Promise.all(
    notifications.map(async (notif) => {
      // Count unique recipients for broadcast
      const recipientCount = notif.broadcastId
        ? await Notification.countDocuments({ broadcastId: notif.broadcastId })
        : 1;

      return {
        ...notif,
        recipientCount,
        deliveryStatus: notif.isRead ? "read" : "unread",
        senderName: notif.senderId
          ? `${notif.senderId.FirstName} ${notif.senderId.LastName}`
          : "System",
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications: enhancedNotifications,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + parseInt(limit) < total,
      },
      "Notification history fetched successfully"
    )
  );
});

/**
 * ADMIN: Get notification statistics
 * GET /api/v1/admin/notifications/stats
 */
export const getNotificationStats = Asynchandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalSent,
    totalDelivered,
    totalUnread,
    totalRead,
    sentToday,
    sentThisMonth,
    totalUsers,
    premiumUsers,
  ] = await Promise.all([
    Notification.countDocuments({}),
    Notification.countDocuments({ isRead: { $in: [true, false] } }),
    Notification.countDocuments({ isRead: false }),
    Notification.countDocuments({ isRead: true }),
    Notification.countDocuments({ createdAt: { $gte: today } }),
    Notification.countDocuments({ createdAt: { $gte: thisMonth } }),
    User.countDocuments({}),
    User.countDocuments({ isPremium: true }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSent,
        totalDelivered,
        totalUnread,
        totalRead,
        sentToday,
        sentThisMonth,
        userMetrics: {
          totalUsers,
          premiumUsers,
          freeUsers: totalUsers - premiumUsers,
        },
        readRate: totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(2) + "%" : "0%",
      },
      "Notification statistics fetched successfully"
    )
  );
});

/**
 * ADMIN: Get audience counts
 * GET /api/v1/admin/notifications/audience-counts
 */
export const getAudienceCounts = Asynchandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    allUsers,
    premiumUsers,
    freeUsers,
    resumeUploaded,
    noResume,
    interviewCompleted,
    noInterview,
    active30Days,
    newUsers,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isPremium: true }),
    User.countDocuments({ isPremium: false }),
    User.countDocuments({ "metadata.resumeUploaded": true }),
    User.countDocuments({
      $or: [
        { "metadata.resumeUploaded": false },
        { "metadata.resumeUploaded": { $exists: false } },
      ],
    }),
    User.countDocuments({ "metadata.interviewCompleted": true }),
    User.countDocuments({
      $or: [
        { "metadata.interviewCompleted": false },
        { "metadata.interviewCompleted": { $exists: false } },
      ],
    }),
    User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        all: allUsers,
        premium: premiumUsers,
        free: freeUsers,
        resumeUploaded,
        noResume,
        interviewCompleted,
        noInterview,
        active30Days,
        newUsers,
      },
      "Audience counts fetched successfully"
    )
  );
});
