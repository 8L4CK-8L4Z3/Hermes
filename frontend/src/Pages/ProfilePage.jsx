"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFollowers, useFollowing } from "@/Stores/followStore";
import { checkAuth } from "@/Stores/authStore";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("trips");
  const [authState, setAuthState] = useState({ isLoading: true, user: null });
  const navigate = useNavigate();

  // Check auth and get user data on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { isAuthenticated, user } = await checkAuth();
        setAuthState({ isLoading: false, user });

        if (!isAuthenticated) {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthState({ isLoading: false, user: null });
        navigate("/login");
      }
    };

    initAuth();
  }, [navigate]);

  // Fetch followers/following data with pagination only when we have user data
  const { data: followersData } = useFollowers(
    authState.user?.data?._id,
    1,
    10,
    {
      enabled: !!authState.user?.data?._id,
      retry: false,
    }
  );

  const { data: followingData } = useFollowing(
    authState.user?.data?._id,
    1,
    10,
    {
      enabled: !!authState.user?.data?._id,
      retry: false,
    }
  );

  // Show loading state while checking auth
  if (authState.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        Loading...
      </div>
    );
  }

  // Return null if not authenticated (will redirect)
  if (!authState.user) {
    return null;
  }

  const userData = authState.user.data;

  const tabs = [
    { id: "trips", label: "Trips", count: userData.stats?.tripsCount || 0 },
    {
      id: "reviews",
      label: "Reviews",
      count: userData.stats?.reviewsCount || 0,
    },
    {
      id: "followers",
      label: "Followers",
      count: userData.stats?.followersCount || 0,
    },
    {
      id: "following",
      label: "Following",
      count: userData.stats?.followingCount || 0,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 lg:px-5 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden">
              {userData.image && userData.image !== "default.jpg" ? (
                <img
                  src={userData.image}
                  alt={userData.username || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-semibold">
                  {(userData.username || "U")?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                    {userData.username || "Loading..."}
                  </h1>
                  <p className="text-gray-600 mb-3">
                    {userData.bio || "No bio yet"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      📅 Joined{" "}
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                    {userData.isVerified && <span>✅ Verified</span>}
                    {userData.isAdmin && <span>👑 Admin</span>}
                    {userData.isMod && <span>🛡️ Moderator</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="bg-white rounded-xl p-4 text-center shadow-soft"
            >
              <div className="text-2xl font-bold text-gray-900">
                {tab.count}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {tab.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "followers" && (
              <div className="space-y-4">
                {followersData?.data?.map((follower) => (
                  <div
                    key={follower._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {follower.image && follower.image !== "default.jpg" ? (
                          <img
                            src={follower.image}
                            alt={follower.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                            {follower.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {follower.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {follower.bio || "No bio"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "following" && (
              <div className="space-y-4">
                {followingData?.data?.map((following) => (
                  <div
                    key={following._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {following.image &&
                        following.image !== "default.jpg" ? (
                          <img
                            src={following.image}
                            alt={following.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                            {following.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {following.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {following.bio || "No bio"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">Following</span>
                  </div>
                ))}
              </div>
            )}

            {(activeTab === "trips" || activeTab === "reviews") && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {activeTab === "trips" ? "✈️" : "⭐"}
                </div>
                <p className="text-gray-600">
                  {activeTab === "trips" ? "Trips" : "Reviews"} will be
                  implemented when we have the corresponding stores
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
