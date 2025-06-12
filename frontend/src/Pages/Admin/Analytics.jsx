"use client";

import { useState, useContext } from "react";
import { AuthContext, NavigationContext } from "@/App";
import UserActivityChart from "@/Components/charts/UserActivityChart";
import EngagementChart from "@/Components/charts/EngagementChart";
import PopularDestinationsChart from "@/Components/charts/PopularDestinationsChart";
import UserDistributionChart from "@/Components/charts/UserDistributionChart";
import RatingDistributionChart from "@/Components/charts/RatingDistributionChart";

const Analytics = () => {
  const authContext = useContext(AuthContext);
  const navigationContext = useContext(NavigationContext);
  const [isAdmin] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

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

  const analytics = {
    overview: {
      totalUsers: 12847,
      activeUsers: 8934,
      newUsers: 234,
      totalTrips: 5672,
      newTrips: 89,
      totalReviews: 23891,
      newReviews: 156,
      engagementRate: 68.5,
    },
    popularDestinations: [
      { name: "Rome, Italy", visits: 2341, growth: 12.5 },
      { name: "Tokyo, Japan", visits: 1987, growth: 8.3 },
      { name: "New York, USA", visits: 1654, growth: -2.1 },
      { name: "Paris, France", visits: 1432, growth: 15.7 },
      { name: "Barcelona, Spain", visits: 1298, growth: 6.9 },
    ],
    popularPlaces: [
      { name: "Colosseum", type: "Activity", visits: 1234, rating: 4.8 },
      { name: "Eiffel Tower", type: "Activity", visits: 1098, rating: 4.7 },
      { name: "Central Park", type: "Activity", visits: 987, rating: 4.6 },
      { name: "Sagrada Familia", type: "Activity", visits: 876, rating: 4.9 },
      { name: "Times Square", type: "Activity", visits: 765, rating: 4.3 },
    ],
    userActivity: [
      { date: "2024-01-09", users: 1234, trips: 89, reviews: 156 },
      { date: "2024-01-10", users: 1456, trips: 102, reviews: 178 },
      { date: "2024-01-11", users: 1678, trips: 95, reviews: 134 },
      { date: "2024-01-12", users: 1543, trips: 87, reviews: 145 },
      { date: "2024-01-13", users: 1789, trips: 112, reviews: 189 },
      { date: "2024-01-14", users: 1654, trips: 98, reviews: 167 },
      { date: "2024-01-15", users: 1876, trips: 125, reviews: 203 },
    ],
  };

  const MetricCard = ({ title, value, change, icon, suffix = "" }) => (
    <div className="bg-white rounded-xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${
            change > 0
              ? "bg-green-100 text-green-800"
              : change < 0
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {change > 0 ? "+" : ""}
          {change}%
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {value.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              View usage statistics and platform insights
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={analytics.overview.totalUsers}
            change={12.5}
            icon="👥"
          />
          <MetricCard
            title="Active Users"
            value={analytics.overview.activeUsers}
            change={8.3}
            icon="🟢"
          />
          <MetricCard
            title="Total Trips"
            value={analytics.overview.totalTrips}
            change={15.7}
            icon="✈️"
          />
          <MetricCard
            title="Engagement Rate"
            value={analytics.overview.engagementRate}
            change={4.2}
            icon="📈"
            suffix="%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Activity Chart */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              User Activity Trends
            </h2>
            <UserActivityChart data={analytics.userActivity} />
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Engagement Metrics
            </h2>
            <EngagementChart data={analytics.userActivity} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Popular Destinations Chart */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Popular Destinations
            </h2>
            <PopularDestinationsChart data={analytics.popularDestinations} />
          </div>

          {/* User Distribution Chart */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              User Distribution
            </h2>
            <UserDistributionChart data={analytics.overview} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Places List */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Popular Places
            </h2>
            <div className="space-y-4">
              {analytics.popularPlaces.map((place, index) => (
                <div
                  key={place.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {place.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {place.visits.toLocaleString()} visits • {place.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium">{place.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Distribution Chart */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Rating Distribution
            </h2>
            <RatingDistributionChart places={analytics.popularPlaces} />
          </div>
        </div>

        {/* Detailed Analytics Table */}
        <div className="bg-white rounded-xl p-6 shadow-soft mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Daily Activity Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Reviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.userActivity.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {day.users.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {day.trips}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {day.reviews}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (day.reviews / day.users) * 100 * 10
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {((day.reviews / day.users) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
