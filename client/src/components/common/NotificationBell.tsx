import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X, Circle } from 'lucide-react';
import { INotification, NotificationType } from '../../../../shared/types';
import { notificationApi } from '../../services/api';

const TYPE_STYLES: Record<NotificationType, { dot: string; badge: string }> = {
  NEW_OFFER:            { dot: 'bg-amber-400',  badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  OFFER_ACCEPTED:       { dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  OFFER_REJECTED:       { dot: 'bg-rose-400',    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  LOT_SOLD:             { dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  TRANSACTION_UPDATED:  { dot: 'bg-cyan-400',    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  PRICE_ALERT:          { dot: 'bg-purple-400',  badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  TRANSPORT_BOOKING_REQUESTED: { dot: 'bg-teal-400', badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  TRANSPORT_STATUS_UPDATED:    { dot: 'bg-blue-400', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' }
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Poll unread count every 30 seconds
  useEffect(() => {
    const pollUnread = async () => {
      try {
        const { count } = await notificationApi.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // Silent — user may not be logged in yet
      }
    };
    pollUnread();
    const intervalId = setInterval(pollUnread, 30_000);
    return () => clearInterval(intervalId);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openFeed = async () => {
    if (isOpen) { setIsOpen(false); return; }
    setIsOpen(true);
    setIsLoading(true);
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkOne = async (notif: INotification) => {
    if (!notif.isRead) {
      await notificationApi.markOneRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const handleMarkAll = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={openFeed}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown feed */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-full border border-rose-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feed */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-sm text-slate-400">No notifications yet.</p>
                <p className="text-xs text-slate-600">Activity will appear here as you use FarmSetu.</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notif) => {
                  const styles = TYPE_STYLES[notif.type] || TYPE_STYLES.TRANSACTION_UPDATED;
                  return (
                    <li key={notif._id}>
                      <button
                        onClick={() => handleMarkOne(notif)}
                        className={`w-full text-left px-4 py-3 flex items-start space-x-3 hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 ${
                          !notif.isRead ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        {/* Unread dot */}
                        <div className="flex-shrink-0 mt-1.5">
                          {notif.isRead ? (
                            <Circle className="w-2 h-2 text-slate-700" />
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-bold ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-500 flex-shrink-0">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          {notif.link && (
                            <span className="text-[10px] text-emerald-400 mt-1 block">
                              View →
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-600">
                Showing last {notifications.length} notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
