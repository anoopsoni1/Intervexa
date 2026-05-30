import mongoose from "mongoose";

/**
 * Notification Schema
 * Stores real-time notifications for users with persistence across sessions.
 * Supports marking as read, deletion, and efficient querying.
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "admin"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    broadcastId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 },
      { userId: 1, isRead: 1 },
      { userId: 1, isRead: 1, createdAt: -1 },
    ],
  }
);

/**
 * Compound index for efficient querying of unread notifications for a user
 * ordered by most recent first
 */
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

/**
 * Auto-delete notifications older than 90 days to manage storage
 */
notificationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 90 * 24 * 60 * 60,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
