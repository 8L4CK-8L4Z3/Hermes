"use client"

import { useState, useContext } from "react"
import { AuthContext, NavigationContext } from "@/App"

const NotificationsPage = () => {
  const { isLoggedIn } = useContext(AuthContext)
  const { navigate } = useContext(NavigationContext)
  const [filter, setFilter] = useState("all")
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "trip",
      title: "Trip Reminder",
      message: "Your trip to Tokyo starts in 3 days! Don't forget to check your itinerary.",
      timestamp: "2024-01-15T10:30:00Z",
      read: false,
      icon: "✈️",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: 2,
      type: "social",
      title: "New Follower",
      message: "Sarah Johnson started following you.",
      timestamp: "2024-01-15T09:15:00Z",
      read: false,
      icon: "👤",
      color: "bg-green-100 text-green-800",
    },
    {
      id: 3,
      type: "review",
      title: "Review Request",
      message: "How was your stay at Grand Hotel Tokyo? Share your experience!",
      timestamp: "2024-01-14T18:45:00Z",
      read: true,
      icon: "⭐",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 4,
      type: "booking",
      title: "Booking Confirmed",
      message: "Your hotel reservation at Sakura Inn has been confirmed.",
      timestamp: "2024-01-14T14:20:00Z",
      read: true,
      icon: "🏨",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: 5,
      type: "system",
      title: "Account Security",
      message: "Your password was successfully updated.",
      timestamp: "2024-01-13T16:30:00Z",
      read: true,
      icon: "🔒",
      color: "bg-gray-100 text-gray-800",
    },
    {
      id: 6,
      type: "promotion",
      title: "Special Offer",
      message: "Get 20% off your next booking! Limited time offer.",
      timestamp: "2024-01-13T12:00:00Z",
      read: false,
      icon: "🎉",
      color: "bg-red-100 text-red-800",
    },
    {
      id: 7,
      type: "social",
      title: "Photo Liked",
      message: "Mike Chen liked your photo from Kyoto Temple.",
      timestamp: "2024-01-12T20:15:00Z",
      read: true,
      icon: "❤️",
      color: "bg-pink-100 text-pink-800",
    },
    {
      id: 8,
      type: "trip",
      title: "Weather Alert",
      message: "Rain expected in your destination. Pack accordingly!",
      timestamp: "2024-01-12T08:00:00Z",
      read: true,
      icon: "🌧️",
      color: "bg-blue-100 text-blue-800",
    },
  ])

  const filterOptions = [
    { value: "all", label: "All Notifications", count: notifications.length },
    { value: "unread", label: "Unread", count: notifications.filter((n) => !n.read).length },
    { value: "trip", label: "Trips", count: notifications.filter((n) => n.type === "trip").length },
    { value: "social", label: "Social", count: notifications.filter((n) => n.type === "social").length },
    { value: "booking", label: "Bookings", count: notifications.filter((n) => n.type === "booking").length },
    { value: "system", label: "System", count: notifications.filter((n) => n.type === "system").length },
  ]

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    return notification.type === filter
  })

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your notifications.</p>
          <button
            onClick={() => navigate("home")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <div className="flex gap-3">
              <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Mark all as read
              </button>
              <button onClick={() => navigate("profile")} className="text-sm text-gray-600 hover:text-gray-700">
                Settings
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === option.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      filter === option.value ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
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
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === "all" ? "You're all caught up! No new notifications." : `No ${filter} notifications found.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border p-6 transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-full ${notification.color}`}>
                      <span className="text-lg">{notification.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="text-blue-600 hover:text-blue-700 font-medium">Load more notifications</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
