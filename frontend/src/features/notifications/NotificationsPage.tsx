import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  date: string;
  unread: boolean;
  type: 'model' | 'comment' | 'review' | 'system';
  link?: string;
}

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'model':
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
        </div>
      );
    case 'comment':
      return (
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    case 'review':
      return (
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <BellIcon />
        </div>
      );
  }
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Model Updated', message: 'Project Alpha LBO was updated by John Smith. Changes include revenue projections for Q3 2024.', time: '5 min ago', date: 'Today', unread: true, type: 'model', link: '/models/alpha' },
    { id: 2, title: 'New Comment', message: 'Sarah commented on Tech DCF model: "Can we review the terminal value assumptions?"', time: '1 hour ago', date: 'Today', unread: true, type: 'comment', link: '/valuations' },
    { id: 3, title: 'Review Required', message: 'Omega Merger model needs your approval before submission to the investment committee.', time: '2 hours ago', date: 'Today', unread: false, type: 'review', link: '/deals/lbo' },
    { id: 4, title: 'Model Shared', message: 'Michael shared "Healthcare DCF Analysis" model with you.', time: '5 hours ago', date: 'Today', unread: false, type: 'model', link: '/models' },
    { id: 5, title: 'System Update', message: 'New features available: Enhanced sensitivity analysis and improved export options.', time: 'Yesterday', date: 'Yesterday', unread: false, type: 'system' },
    { id: 6, title: 'Comment Resolved', message: 'Your comment on Retail LBO model was marked as resolved by David.', time: 'Yesterday', date: 'Yesterday', unread: false, type: 'comment', link: '/deals/lbo' },
    { id: 7, title: 'Model Approved', message: 'Energy Sector Analysis model has been approved by the compliance team.', time: '2 days ago', date: 'This Week', unread: false, type: 'review', link: '/models' },
  ]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => n.unread);
    }
    return notifications;
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filteredNotifications.forEach(notif => {
      if (!groups[notif.date]) {
        groups[notif.date] = [];
      }
      groups[notif.date].push(notif);
    });
    return groups;
  }, [filteredNotifications]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <CheckIcon />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filter === 'unread'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications list */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellIcon />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
          <p className="text-sm text-gray-500">
            {filter === 'unread' ? "You've read all your notifications" : "You don't have any notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, notifs]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {notifs.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${notif.unread ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {getTypeIcon(notif.type)}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-sm ${notif.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {notif.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                          </div>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {notif.unread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
