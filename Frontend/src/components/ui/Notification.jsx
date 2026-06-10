import React from 'react'
import { useEffect, useRef , useState } from 'react';
import NotificationBell from '../NotificationBell';
import NotificationDropdown from '../NotificationDropdown';
const Notification = () => {
   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef(null);
    
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (
            notificationRef.current &&
            !notificationRef.current.contains(event.target)
          ) {
            setIsNotificationOpen(false);
          }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
    
        return () => {
          document.removeEventListener(
            "mousedown",
            handleClickOutside
          );
        };
      }, []);
  return (
    <>
         <div
      className="relative"
      ref={notificationRef}
    >
      <NotificationBell
        isOpen={isNotificationOpen}
        onToggle={() =>
          setIsNotificationOpen((prev) => !prev)
        }
      />

      <NotificationDropdown
        isOpen={isNotificationOpen}
        onClose={() =>
          setIsNotificationOpen(false)
        }
      />
    </div>
    </>
  )
}

export default Notification