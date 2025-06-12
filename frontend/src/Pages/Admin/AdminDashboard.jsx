"use client";

import { useState, useContext } from "react";
import { AuthContext   } from "@/Context/Auth";
import { NavigationContext } from "@/Context/Navigate";
import UserActivityChart from "@/Components/charts/UserActivityChart";
import UserDistributionChart from "@/Components/charts/UserDistributionChart";

const AdminDashboard = () => {
  const authContext = useContext(AuthContext);
  const navigationContext = useContext(NavigationContext);
  const [isAdmin] = useState(true); // Mock admin check

  // Check if contexts are available
  if (!authContext || !navigationContext) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const { isLoggedIn } = authContext;
  const { navigate } = navigationContext;

  // Redirect if not logged in or not admin
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need admin privileges to access this page.
          </p>
          <button
            onClick={() => navigate("home")}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: 12847,
    activeUsers: 8934,
    totalTrips: 5672,
    totalReviews: 23891,
    totalDestinations: 156,
    totalPlaces: 2847,
    pendingReviews: 23,
    flaggedContent: 7,
  };

  const recentActivity = [
    {
      id: 1,
      type: "user_registration",
      user: "Sarah Johnson",
      action: "New user registered",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      type: "review_flagged",
      user: "Marco Rossi",
      action: "Review flagged for inappropriate content",
      timestamp: "2024-01-15T09:45:00Z",
    },
    {
      id: 3,
      type: "destination_added",
      user: "Admin",
      action: "New destination added: Santorini, Greece",
      timestamp: "2024-01-15T08:20:00Z",
    },
    {
      id: 4,
      type: "user_verified",
      user: "Emily Chen",
      action: "User account verified",
      timestamp: "2024-01-15T07:15:00Z",
    },
  ];

  const adminCards = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: "👥",
      page: "admin-users",
      stats: `${stats.totalUsers} total users`,
    },
    {
      title: "Content Moderation",
      description: "Review and moderate user-generated content",
      icon: "🛡️",
      page: "admin-moderation",
      stats: `${stats.pendingReviews} pending reviews`,
    },
    {
      title: "Destination Management",
      description: "Manage destinations, places, and activities",
      icon: "🌍",
      page: "admin-destinations",
      stats: `${stats.totalDestinations} destinations`,
    },
    {
      title: "Analytics",
      description: "View usage statistics and reports",
      icon: "📊",
      page: "admin-analytics",
      stats: "Real-time insights",
    },
  ];

  // Sample data for user activity chart
  const userActivityData = [
    { date: "2024-01-09", users: 1234, trips: 89, reviews: 156 },
    { date: "2024-01-10", users: 1456, trips: 102, reviews: 178 },
    { date: "2024-01-11", users: 1678, trips: 95, reviews: 134 },
    { date: "2024-01-12", users: 1543, trips: 87, reviews: 145 },
    { date: "2024-01-13", users: 1789, trips: 112, reviews: 189 },
    { date: "2024-01-14", users: 1654, trips: 98, reviews: 167 },
    { date: "2024-01-15", users: 1876, trips: 125, reviews: 203 },
  ];

  const StatCard = ({ title, value, change, icon }) => (
    <div className="bg-white rounded-xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${
            change > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {change > 0 ? "+" : ""}
          {change}%
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of platform activity and management tools
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            change={12}
            icon="👥"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            change={8}
            icon="🟢"
          />
          <StatCard
            title="Total Trips"
            value={stats.totalTrips}
            change={15}
            icon="✈️"
          />
          <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            change={-2}
            icon="⭐"
          />
        </div>

        {/* Charts and Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Tools */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Management Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminCards.map((card) => (
                <button
                  key={card.title}
                  onClick={() => navigate(card.page)}
                  className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow duration-200 group text-left"
                >
                  <div className="text-3xl mb-4">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {card.description}
                  </p>
                  <div className="text-xs text-gray-500">{card.stats}</div>
                </button>
              ))}
            </div>

            {/* User Activity Chart */}
            <div className="bg-white rounded-xl p-6 shadow-soft mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                User Activity Trends
              </h2>
              <UserActivityChart data={userActivityData} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "user_registration"
                          ? "bg-green-500"
                          : activity.type === "review_flagged"
                          ? "bg-red-500"
                          : activity.type === "destination_added"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600">
                        by {activity.user}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("admin-activity")}
                className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4 pt-4 border-t border-gray-100 w-full"
              >
                View all activity →
              </button>
            </div>

            {/* User Distribution Chart */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                User Distribution
              </h2>
              <UserDistributionChart
                data={{
                  totalUsers: stats.totalUsers,
                  activeUsers: stats.activeUsers,
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-soft mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
              <span className="text-xl">🚨</span>
              <div>
                <div className="font-medium text-gray-900">
                  Review Flagged Content
                </div>
                <div className="text-sm text-gray-600">
                  {stats.flaggedContent} items pending
                </div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
              <span className="text-xl">✅</span>
              <div>
                <div className="font-medium text-gray-900">Approve Reviews</div>
                <div className="text-sm text-gray-600">
                  {stats.pendingReviews} reviews pending
                </div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
              <span className="text-xl">📧</span>
              <div>
                <div className="font-medium text-gray-900">
                  Send Announcement
                </div>
                <div className="text-sm text-gray-600">Notify all users</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
