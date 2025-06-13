"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  useNotifications,
  useNotificationsByType,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useUnreadCount,
} from "../Stores/notificationStore";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch notifications based on filter
  const {
    data: notificationsData,
    isLoading,
    error,
  } = filter === "all"
    ? useNotifications(page, limit)
    : useNotificationsByType(filter, page, limit);

  // Get unread count
  const { data: unreadCountData } = useUnreadCount();

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.data || [];
  const totalPages = notificationsData?.meta?.pages || 1;
  const unreadCount = unreadCountData?.data?.count || 0;

  const filterOptions = [
    {
      value: "all",
      label: "All Notifications",
      count: notificationsData?.meta?.total || 0,
    },
    { value: "unread", label: "Unread", count: unreadCount },
    { value: "trip", label: "Trips" },
    { value: "social", label: "Social" },
    { value: "booking", label: "Bookings" },
    { value: "system", label: "System" },
  ];

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (id) => {
    deleteNotificationMutation.mutate(id);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Get notification icon and color based on type
  const getNotificationStyle = (type) => {
    const styles = {
      trip: { icon: "✈️", color: "bg-blue-100 text-blue-800" },
      social: { icon: "👤", color: "bg-green-100 text-green-800" },
      review: { icon: "⭐", color: "bg-yellow-100 text-yellow-800" },
      booking: { icon: "🏨", color: "bg-purple-100 text-purple-800" },
      system: { icon: "🔒", color: "bg-gray-100 text-gray-800" },
      default: { icon: "📢", color: "bg-gray-100 text-gray-800" },
    };
    return styles[type] || styles.default;
  };

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading notifications. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <div className="flex gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={markAllAsReadMutation.isLoading}
              >
                Mark all as read
              </button>
              <button
                onClick={() => navigate("profile")}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Settings
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      filter === option.value
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "You're all caught up! No new notifications."
                  : `No ${filter} notifications found.`}
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const style = getNotificationStyle(notification.type);
              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow-sm border p-6 transition-all hover:shadow-md ${
                    !notification.is_read ? "border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-full ${style.color}`}>
                        <span className="text-lg">{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {notification.data.title || notification.type}
                          </h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">
                          {notification.data.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTimestamp(notification.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          disabled={markAsReadMutation.isLoading}
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification._id)
                        }
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        disabled={deleteNotificationMutation.isLoading}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {notifications.length > 0 && totalPages > 1 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load more notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
