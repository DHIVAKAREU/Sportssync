import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import API from '../services/api';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../store/notificationSlice';
import { Bell, CheckCheck, RefreshCw, AlertCircle, Info, Calendar, DollarSign, Package } from 'lucide-react';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tournament': return <Calendar size={18} className="text-purple-500" />;
      case 'equipment': return <Package size={18} className="text-amber-500" />;
      case 'fine': return <DollarSign size={18} className="text-rose-500" />;
      default: return <Bell size={18} className="text-brand-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="text-brand-500" size={26} />
            <span>Notifications Center</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-black bg-rose-500 text-white rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time alerts, borrow reminders, fine notices, and tournament updates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={() => dispatch(fetchNotifications())}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-dark-card rounded-3xl border border-dashed border-slate-200 dark:border-dark-border">
          No notifications yet. Alerts will appear here when tournament or borrow events occur!
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-dark-card ${
                !n.isRead
                  ? 'border-l-4 border-l-brand-500 border-slate-200 dark:border-dark-border bg-brand-50/10 dark:bg-brand-950/10 shadow-sm'
                  : 'border-slate-200 dark:border-dark-border/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{n.title}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 inline-block animate-ping" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
