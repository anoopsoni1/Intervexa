
import React from "react";
import { useNotification } from "../hooks/useNotification";
import "../styles/NotificationBell.css";

const NotificationBell = ({ isOpen, onToggle }) => {
  const { unreadCount } = useNotification();

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell"
        onClick={onToggle}
        title={`${unreadCount} unread notifications`}
        aria-label="Notifications"
        aria-expanded={isOpen}
        type="button"
      >
        <svg
          className="bell-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;

