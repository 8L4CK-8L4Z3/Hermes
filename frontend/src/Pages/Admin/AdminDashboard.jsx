"use client";

import { useNavigate } from "react-router-dom";
import UserActivityChart from "@/Components/charts/UserActivityChart";
import UserDistributionChart from "@/Components/charts/UserDistributionChart";
import {
  useAdminStats,
  useAdminAnalytics,
  useModerationLogs,
} from "@/Stores/adminStore";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fetch real data using the hooks
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminStats();
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAdminAnalytics(7); // Last 7 days of analytics
  const {
    data: moderationData,
    isLoading: moderationLoading,
    error: moderationError,
  } = useModerationLogs(1, 4); // Fetch first 4 moderation logs for recent activity

  // TODO: Add proper loading states with skeletons
  if (statsLoading || analyticsLoading || moderationLoading) {
    return <div>Loading...</div>;
  }

  // TODO: Add proper error handling UI
  if (statsError || analyticsError || moderationError) {
    return <div>Error loading dashboard data</div>;
  }

  const stats = {
    // User stats with fallbacks that make sense for a new system
    totalUsers: statsData?.data?.users?.total || 0,
    activeUsers: statsData?.data?.users?.active || 0,
    inactiveUsers: statsData?.data?.users?.inactive || 0,
    newUsers: statsData?.data?.users?.new || 0,
    verifiedUsers: statsData?.data?.users?.verified || 0,

    // Content stats
    totalReviews: statsData?.data?.content?.reviews || 0,
    totalPosts: statsData?.data?.content?.posts || 0,
    totalComments: statsData?.data?.content?.comments || 0,

    // Moderation stats
    pendingReports: statsData?.data?.moderation?.pendingReports || 0,
    resolvedReports: statsData?.data?.moderation?.resolvedReports || 0,
  };

  // Calculate percentages for active/inactive users
  const activePercentage =
    stats.totalUsers > 0
      ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
      : 0;

  const inactivePercentage =
    stats.totalUsers > 0
      ? ((stats.inactiveUsers / stats.totalUsers) * 100).toFixed(1)
      : 0;

  // Transform moderation logs into recent activity format
  const recentActivity =
    moderationData?.data?.map((log) => ({
      id: log._id,
      type: log.action,
      user: log.moderator_id?.username || "System",
      action: `${log.action.replace(/_/g, " ")} - ${log.target_type}`,
      timestamp: log.createdAt,
    })) || [];

  // Admin cards data - some data from backend, some are static navigation items
  const adminCards = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: "👥",
      path: "/admin/users",
      stats: `${stats.totalUsers} total users`,
    },
    {
      title: "Content Moderation",
      description: "Review and moderate user-generated content",
      icon: "🛡️",
      path: "/admin/moderation",
      stats: `${stats.pendingReports} pending reports`,
    },
    {
      title: "Destination Management",
      description: "Manage destinations, places, and activities",
      icon: "🌍",
      path: "/admin/destinations",
      stats: `${statsData?.data?.content?.destinations || 0} destinations`,
    },
    {
      title: "Analytics",
      description: "View usage statistics and reports",
      icon: "📊",
      path: "/admin/analytics",
      stats: "Real-time insights",
    },
  ];

  // Transform analytics data for the charts
  const userActivityData =
    analyticsData?.data?.userGrowth?.map((day) => ({
      date: day.date,
      users: day.newUsers,
      trips: day.newTrips,
      reviews: day.newReviews,
    })) || [];

  const StatCard = ({ title, value, change, icon, description }) => (
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
      {description && (
        <div className="text-xs text-gray-500 mt-1">{description}</div>
      )}
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
            change={stats.newUsers}
            icon="👥"
            description={`${stats.verifiedUsers} verified users`}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            change={Number(activePercentage)}
            icon="🟢"
            description="Active in last 30 days"
          />
          <StatCard
            title="Inactive Users"
            value={stats.inactiveUsers}
            change={Number(inactivePercentage)}
            icon="⚪"
            description="No activity in 30+ days"
          />
          <StatCard
            title="Content Reports"
            value={stats.pendingReports}
            change={stats.resolvedReports}
            icon="🚨"
            description={`${stats.resolvedReports} reports resolved`}
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
                  onClick={() => navigate(card.path)}
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
                        activity.type.includes("ban")
                          ? "bg-red-500"
                          : activity.type.includes("unban")
                          ? "bg-green-500"
                          : activity.type.includes("moderate")
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
                onClick={() => navigate("/admin/moderation")}
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
            <button
              onClick={() => navigate("/admin/moderation")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <span className="text-xl">🚨</span>
              <div>
                <div className="font-medium text-gray-900">
                  Review Flagged Content
                </div>
                <div className="text-sm text-gray-600">
                  {stats.pendingReports} items pending
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/moderation")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <span className="text-xl">✅</span>
              <div>
                <div className="font-medium text-gray-900">Approve Reports</div>
                <div className="text-sm text-gray-600">
                  {stats.resolvedReports} reports resolved
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
            >
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
