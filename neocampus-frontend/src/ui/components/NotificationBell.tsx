import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '@/application/useCases/useNotification';
import NotificationPopover from './NotificationPopover';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { useUnreadCount, useLatestUnread } = useNotification();

  // Poll unread count & latest 5 unread notifications
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: latestNotifications = [] } = useLatestUnread(5);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={bellRef} className="relative">
      
      {/* Bell button with badge count */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl hover:bg-neutral-100/80 flex items-center justify-center border border-neutral-200/50 bg-white transition relative cursor-pointer outline-hidden"
      >
        <Bell className={`h-4.5 w-4.5 text-neutral-600 ${isOpen ? 'text-black' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black border border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover list */}
      {isOpen && (
        <NotificationPopover
          notifications={latestNotifications}
          onClose={() => setIsOpen(false)}
        />
      )}

    </div>
  );
};

export default NotificationBell;
