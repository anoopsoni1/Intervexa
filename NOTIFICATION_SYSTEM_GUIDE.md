# Real-Time Notification System - Complete Integration Guide

## Overview

This is a complete production-grade real-time notification system for the ResumeAI application. It includes:

- **Real-time delivery** via Socket.IO
- **Persistent storage** in MongoDB
- **Offline support** - notifications stored and shown when user logs in
- **Admin broadcast** - send notifications to all users at once
- **Read/Unread tracking** - users can mark notifications as read
- **JWT authentication** - secure Socket.IO connections
- **Production architecture** - follows best practices and scalable design

---

## Backend Implementation

### 1. Database Schema

**File:** `Backend/src/models/Notification.model.js`

- Stores notifications with userId, title, message, type, timestamps
- Includes auto-expiration after 90 days
- Compound indexes for efficient queries
- Supports metadata storage

### 2. Utility Service

**File:** `Backend/src/utils/notificationService.js`

Core functions available:

```javascript
// Send to single user
sendNotification(userId, title, message, options)

// Send to multiple users
sendNotificationToMultiple(userIds, title, message, options)

// Broadcast to all users (admin only)
broadcastNotificationToAll(title, message, adminId, options)

// Retrieve notifications
getUserNotifications(userId, options)

// Mark as read
markNotificationAsRead(notificationId, userId)
markAllNotificationsAsRead(userId)

// Delete notifications
deleteNotification(notificationId, userId)
deleteAllNotifications(userId, unreadOnly)
```

### 3. Controller

**File:** `Backend/src/controller/notification.controller.js`

Handles:
- Getting notifications with pagination
- Getting unread count
- Marking notifications as read
- Deleting notifications
- Admin operations (send to user, send to multiple, broadcast)

### 4. Routes

**File:** `Backend/src/routes/notification.routes.js`

API Endpoints:

```
GET    /api/v1/notifications                    - Get all notifications
GET    /api/v1/notifications/unread-count       - Get unread count
PATCH  /api/v1/notifications/:id/read           - Mark as read
PATCH  /api/v1/notifications/read-all           - Mark all as read
DELETE /api/v1/notifications/:id                - Delete notification
DELETE /api/v1/notifications                    - Delete all notifications

POST   /api/v1/notifications/admin/send-to-user      - Send to user (admin)
POST   /api/v1/notifications/admin/send-to-multiple  - Send to multiple (admin)
POST   /api/v1/notifications/admin/broadcast         - Broadcast to all (admin)
```

### 5. Socket.IO Setup

**File:** `Backend/src/socket/index.js`

Features:
- JWT authentication middleware for Socket.IO
- Real-time notification delivery
- User-specific rooms (`user:{userId}`)
- Events: `notification:new`, `notification:broadcast`, `notification:mark-read`
- Automatic cleanup on disconnect

### 6. Integration in App

**File:** `Backend/src/app.js` - Added notification routes
**File:** `Backend/src/server.js` - Registered global Socket.IO instance

---

## Usage Examples - Backend

### Example 1: Send Notification to User

```javascript
import { sendNotification } from "./utils/notificationService.js";

// In a controller or service
await sendNotification(
  userId,
  "Resume Processed",
  "Your resume has been successfully processed",
  {
    type: "success",
    actionUrl: "/dashboard/resumes",
    metadata: { resumeId: "123" }
  }
);
```

### Example 2: Broadcast to All Users (Admin)

```javascript
import { broadcastNotificationToAll } from "./utils/notificationService.js";

// In an admin controller
await broadcastNotificationToAll(
  "System Maintenance",
  "System will be under maintenance on Sunday from 2-4 AM",
  adminUserId,
  {
    type: "warning",
    metadata: { maintenanceWindow: "2-4 AM" }
  }
);
```

### Example 3: Integrate in AI Interview Controller

```javascript
import { sendNotification } from "../utils/notificationService.js";

export const startAiInterview = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  
  // ... start interview logic ...
  
  // Notify user when interview starts
  await sendNotification(
    userId,
    "AI Interview Started",
    "Your AI interview session has started",
    {
      type: "info",
      actionUrl: "/interview",
      metadata: { interviewId: interview._id }
    }
  );
  
  res.json(new Apiresponse(200, interview, "Interview started"));
});
```

---

## Frontend Implementation

### 1. Redux Slice

**File:** `Frontend/src/slices/notification.slice.jsx`

Manages:
- notifications array
- unreadCount
- loading states
- error handling

Includes async thunks for all API operations

### 2. Store Configuration

**File:** `Frontend/src/store/index.js`

Updated to include notification reducer

### 3. Notification Service

**File:** `Frontend/src/services/notificationService.js`

API client for all notification endpoints:
- Get notifications
- Get unread count
- Mark as read/all as read
- Delete notifications
- Admin: send, send to multiple, broadcast

### 4. Custom Hook

**File:** `Frontend/src/hooks/useNotification.js`

Features:
- Initializes Socket.IO connection
- Listens to real-time events
- Provides notification state and actions
- Auto-cleanup on unmount

```javascript
const {
  notifications,
  unreadCount,
  isLoading,
  isMarkingRead,
  error,
  success,
  loadNotifications,
  refreshUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationById,
  getUnreadNotifications,
} = useNotification();
```

### 5. Notification Bell Component

**File:** `Frontend/src/components/NotificationBell.jsx`

Features:
- Bell icon with SVG
- Unread badge showing count
- Click to toggle dropdown
- Animated bell ring on hover
- Close on outside click

Usage:
```jsx
import NotificationBell from "./components/NotificationBell";

<NotificationBell onDropdownToggle={(isOpen) => console.log(isOpen)} />
```

### 6. Notification Dropdown Component

**File:** `Frontend/src/components/NotificationDropdown.jsx`

Features:
- Scrollable list of notifications
- Mark single/all as read
- Delete notifications
- Click notification to open action URL
- Load more pagination
- Type-based styling (info, success, warning, error, admin)
- Relative time formatting
- Empty and loading states

Usage:
```jsx
import NotificationDropdown from "./components/NotificationDropdown";

<NotificationDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
```

### 7. CSS Styles

**Files:**
- `Frontend/src/styles/NotificationBell.css` - Bell styling and animations
- `Frontend/src/styles/NotificationDropdown.css` - Dropdown styling and responsive design

---

## Usage Examples - Frontend

### Example 1: Add to Navbar

```jsx
import { useState } from "react";
import NotificationBell from "./components/NotificationBell";
import NotificationDropdown from "./components/NotificationDropdown";

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-right">
        <div className="notification-widget">
          <NotificationBell 
            onDropdownToggle={(isOpen) => setIsDropdownOpen(isOpen)}
          />
          <NotificationDropdown 
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
}
```

### Example 2: Use Hook in Custom Component

```jsx
import { useNotification } from "./hooks/useNotification";

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  return (
    <div className="notification-center">
      <h2>Notifications ({unreadCount} unread)</h2>
      <button onClick={markAllAsRead}>Mark All as Read</button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        notifications.map((notif) => (
          <div key={notif._id} className="notification-card">
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
            {!notif.isRead && (
              <button onClick={() => markAsRead(notif._id)}>
                Mark as Read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
```

### Example 3: Display Toast on New Notification

```jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export function NotificationToast() {
  const { notifications } = useSelector((state) => state.notifications);
  const lastNotification = notifications[0];

  useEffect(() => {
    if (lastNotification && !lastNotification.isRead) {
      toast.success(`${lastNotification.title}: ${lastNotification.message}`, {
        duration: 4000,
      });
    }
  }, [lastNotification?._id]);

  return null;
}
```

---

## Environment Variables

### Backend (.env)

```
# JWT Authentication (already configured)
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret

# Database (already configured)
MONGODB_URI=your_mongodb_uri

# Socket.IO CORS origins (update as needed)
# Automatic from app.js SOCKET_CORS_ORIGINS array
```

### Frontend (.env or .env.local)

```
# API URL (optional, defaults to localhost:5000)
VITE_API_URL=http://localhost:5000

# Socket.IO URL (optional, defaults to window.location.origin)
VITE_SOCKET_URL=http://localhost:5000
```

---

## Security Considerations

1. **JWT Authentication**
   - Socket.IO connections verified with JWT tokens
   - Only authenticated users can receive notifications
   - Tokens validated on connection

2. **User Isolation**
   - Users only see their own notifications
   - Notifications room-based on userId
   - Backend verifies userId matches authenticated user

3. **Admin Operations**
   - Broadcast and send operations require `isAdmin` flag
   - Verified in controller before execution
   - Actions logged for audit trail

4. **Rate Limiting**
   - Global API rate limit applied (60 req/min per IP)
   - Applied to notification routes
   - Prevents notification spam

---

## Deployment Considerations

### Horizontal Scaling with Redis

For multi-server deployments, use Socket.IO Redis adapter:

```javascript
// In server.js
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

### Database Optimization

1. Create indexes (already in schema):
   ```javascript
   db.notifications.createIndex({ userId: 1, createdAt: -1 })
   db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })
   ```

2. Implement data archiving for old notifications (90 days TTL)

3. Consider sharding by userId for very high volumes

### Monitoring

1. Track notification delivery success/failure
2. Monitor Socket.IO connection count
3. Alert on high unread notification counts
4. Log admin broadcast operations

---

## Testing

### Backend Testing Example

```javascript
// Test notification creation
import { sendNotification } from "./utils/notificationService.js";

const userId = "507f1f77bcf86cd799439011"; // Example MongoDB ObjectId
const notification = await sendNotification(
  userId,
  "Test Title",
  "Test Message",
  { type: "info" }
);

console.log("Notification created:", notification);
```

### Frontend Testing Example

```javascript
// In your test file
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { useNotification } from "./hooks/useNotification";
import { store } from "./store";

test("useNotification hook loads notifications", () => {
  const { result } = renderHook(() => useNotification(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  // Assert initial state
  expect(result.current.notifications).toBeDefined();
  expect(result.current.unreadCount).toBe(0);
});
```

---

## Troubleshooting

### Issue: Notifications not delivering

**Checks:**
1. Verify JWT_SECRET is same in backend and frontend token generation
2. Check Socket.IO connection in browser DevTools
3. Verify user is authenticated before sending notification
4. Check MongoDB connection and Notification collection

### Issue: Unread count not updating

**Checks:**
1. Verify markNotificationAsRead API call succeeds
2. Check Redux reducer receives action correctly
3. Verify database update is saved

### Issue: Dropdown not appearing

**Checks:**
1. Verify NotificationBell click handler fires
2. Check z-index doesn't conflict with other elements
3. Verify CSS imports are correct
4. Check browser console for errors

---

## File Structure Summary

```
Backend/
├── src/
│   ├── models/
│   │   └── Notification.model.js          [NEW]
│   ├── controller/
│   │   └── notification.controller.js     [NEW]
│   ├── routes/
│   │   └── notification.routes.js         [NEW]
│   ├── utils/
│   │   └── notificationService.js         [NEW]
│   ├── socket/
│   │   └── index.js                       [UPDATED]
│   ├── app.js                             [UPDATED]
│   └── server.js                          [UPDATED]

Frontend/
├── src/
│   ├── slices/
│   │   └── notification.slice.jsx         [NEW]
│   ├── services/
│   │   └── notificationService.js         [NEW]
│   ├── hooks/
│   │   └── useNotification.js             [NEW]
│   ├── components/
│   │   ├── NotificationBell.jsx           [NEW]
│   │   └── NotificationDropdown.jsx       [NEW]
│   ├── styles/
│   │   ├── NotificationBell.css           [NEW]
│   │   └── NotificationDropdown.css       [NEW]
│   └── store/
│       └── index.js                       [UPDATED]
```

---

## Next Steps

1. **Install Socket.IO client** (if not already installed):
   ```bash
   npm install socket.io-client
   ```

2. **Update Environment Variables** as per requirements

3. **Run Backend Server** to activate Socket.IO

4. **Add NotificationBell to Navbar** in your layout

5. **Test** by sending test notifications via admin API

6. **Monitor** real-time delivery and user interactions

---

## Support & Maintenance

- **Real-time Updates**: Notifications are instant via Socket.IO
- **Offline Support**: Checked on login, fetched from MongoDB
- **Auto Cleanup**: Notifications auto-delete after 90 days
- **Scalability**: Ready for horizontal scaling with Redis adapter
- **Security**: JWT-based, user-isolated, rate-limited

---

**System Status**: ✅ Production Ready
**Last Updated**: May 2026
