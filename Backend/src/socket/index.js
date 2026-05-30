/**
 * Socket.IO + WebRTC signaling server + Real-time Notifications
 * - Peers join rooms; signaling (offer, answer, ice-candidate) is relayed within the room.
 * - Notifications are delivered to users in real-time via Socket.IO
 * - User authentication via JWT token
 */
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const SOCKET_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://intervexa.co-vid.in",
  "https://www.intervexa.co-vid.in",
  "https://resume-ai-frontend-mj2p.vercel.app",
];

/**
 * Middleware to authenticate socket connections via JWT
 */
function socketAuthMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Unauthorized: No token provided"));
    }

    const secret =
      process.env.JWT_SECRET ||
      process.env.ACCESS_TOKEN ||
      process.env.ACCESS_TOKEN_SECRET;

    const decoded = jwt.verify(token, secret);
    const userId = decoded?.userId || decoded?._id || decoded?.user;

    if (!userId) {
      return next(new Error("Unauthorized: Invalid token"));
    }

    socket.userId = userId;
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error(`Authentication failed: ${error.message}`));
  }
}

/**
 * Attach Socket.IO to the HTTP server and set up WebRTC signaling + Notifications
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server}
 */
export function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: SOCKET_CORS_ORIGINS,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  // Store online users
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log("[Socket] User connected:", userId, "socket:", socket.id);

    // Track user as online
    onlineUsers.set(userId, socket.id);

    // Join user-specific room for notifications
    socket.join(`user:${userId}`);
    console.log(`[Socket] User ${userId} joined notification room: user:${userId}`);

    /**
     * WebRTC Signaling Events
     */

    socket.on("join-room", (roomId, userMeta = {}) => {
      if (!roomId || typeof roomId !== "string") {
        socket.emit("error", { message: "Invalid room id" });
        return;
      }
      const room = roomId.trim();
      socket.join(room);
      socket.roomId = room;
      socket.userMeta = userMeta;
      socket.to(room).emit("user-joined", { socketId: socket.id, userMeta });
      console.log("[Socket] User joined room:", room, "socket:", socket.id);
    });

    socket.on("offer", ({ to, offer }) => {
      if (to && offer) io.to(to).emit("offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ to, answer }) => {
      if (to && answer) io.to(to).emit("answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      if (to && candidate)
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    socket.on("leave-room", () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit("user-left", { socketId: socket.id });
        socket.leave(socket.roomId);
        socket.roomId = null;
      }
    });

    /**
     * Notification Events
     */

    /**
     * Mark notification as read (optional real-time sync)
     */
    socket.on("notification:mark-read", (notificationId) => {
      console.log(
        `[Socket] User ${userId} marked notification ${notificationId} as read`
      );
      // This can trigger a database update on the backend if needed
      socket.broadcast.emit("notification:status-update", {
        notificationId,
        userId,
        isRead: true,
      });
    });

    /**
     * Acknowledge notification received
     */
    socket.on("notification:acknowledged", (notificationId) => {
      console.log(
        `[Socket] User ${userId} acknowledged notification ${notificationId}`
      );
      socket.emit("notification:ack-confirmed", { notificationId });
    });

    /**
     * Handle disconnection
     */
    socket.on("disconnect", (reason) => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit("user-left", { socketId: socket.id });
      }

      // Remove user from online tracking
      onlineUsers.delete(userId);
      console.log(
        "[Socket] User disconnected:",
        userId,
        "socket:",
        socket.id,
        "reason:",
        reason
      );
    });

    /**
     * Error handling
     */
    socket.on("error", (error) => {
      console.error("[Socket] Error from client:", error);
    });
  });

  /**
   * Attach global utility to send notifications
   * This is used by the notification service to emit events
   */
  io.sendUserNotification = (userId, notificationData) => {
    io.to(`user:${userId}`).emit("notification:new", notificationData);
  };

  io.broadcastNotification = (notificationData) => {
    io.emit("notification:broadcast", notificationData);
  };

  return io;
}

