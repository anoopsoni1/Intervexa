import React, { useState, useRef, useEffect } from "react";
import { useNotification } from "../hooks/useNotification";
import "../styles/NotificationBell.css";

/**
 * NotificationBell Component
 * Displays a bell icon with unread notification count badge
 * Toggles notification dropdown on click
 */
const NotificationBell = ({ onDropdownToggle }) => {
  const { unreadCount, notifications } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const bellRef = useRef(null);

  /**
   * Toggle dropdown visibility
   */
  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    onDropdownToggle?.(!isDropdownOpen);
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        onDropdownToggle?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onDropdownToggle]);

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button
        className="notification-bell"
        onClick={handleBellClick}
        title={`${unreadCount} unread notifications`}
        aria-label="Notifications"
        aria-expanded={isDropdownOpen}
      >
        {/* Bell Icon */}
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

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Status Indicator */}
      {isDropdownOpen && (
        <div className="notification-status">
          {notifications.length === 0 ? (
            <span className="no-notifications">No notifications</span>
          ) : (
            <span className="notification-status-text">
              {unreadCount} new
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
