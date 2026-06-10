import React, {  useCallback } from "react";
import { useNotification } from "../hooks/useNotification";
import "../styles/NotificationDropdown.css";

/**
 * NotificationDropdown Component
 * Displays list of notifications with options to mark as read and delete
 */
const NotificationDropdown = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    isMarkingRead,
    markAsRead,
    hasMore ,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
  } = useNotification();

  const limit = 10;

  /**
   * Handle mark as read
   */
  const handleMarkAsRead = useCallback(
    (notificationId, event) => {
      event.preventDefault();
      event.stopPropagation();
      markAsRead(notificationId);
    },
    [markAsRead]
  );

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  /**
   * Handle delete notification
   */
  const handleDelete = useCallback(
    (notificationId, event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteNotification(notificationId);
    },
    [deleteNotification]
  );

  /**
   * Handle notification click (navigate to action URL if available)
   */
  const handleNotificationClick = useCallback(
    (notification) => {
      if (!notification.isRead) {
        markAsRead(notification._id);
      }
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    },
    [markAsRead]
  );


const handleLoadMore = useCallback(() => {
  if (isLoading || !hasMore) return;

  const nextSkip = notifications.length;

  loadNotifications(limit, nextSkip);
}, [isLoading, hasMore, notifications.length, limit, loadNotifications]);

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown">
      {/* Header */}
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        <div className="notification-header-actions">
          {unreadCount > 0 && (
            <button
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead}
              title="Mark all as read"
            >
              Mark all as read
            </button>
          )}
          <button
            className="close-btn"
            onClick={onClose}
            title="Close notifications"
            aria-label="Close notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="notification-dropdown-content">
        {isLoading && notifications.length === 0 ? (
          <div className="loading-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${
                  notification.isRead ? "read" : "unread"
                } notification-${notification.type}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="unread-indicator"></div>
                )}

                {/* Notification Content */}
                <div className="notification-content">
                  <h4 className="notification-title">
                    {notification.title}
                  </h4>
                  <p className="notification-message">
                    {notification.message}
                  </p>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="action-btn read-btn"
                      onClick={(e) =>
                        handleMarkAsRead(notification._id, e)
                      }
                      disabled={isMarkingRead}
                      title="Mark as read"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) =>
                      handleDelete(notification._id, e)
                    }
                    title="Delete notification"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6h16zM10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
    {hasMore && (
  <div className="notification-dropdown-footer">
    <button
      className="load-more-btn"
      onClick={handleLoadMore}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Load More"}
    </button>
  </div>
)}
    </div>
  );
};

export default NotificationDropdown;
