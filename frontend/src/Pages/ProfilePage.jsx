"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  useFollowers,
  useFollowing,
  useFollowUser,
  useUnfollowUser,
} from "@/Stores/followStore";
import { useAuth } from "@/hooks/useAuth";
import { useUserTrips } from "@/Stores/tripStore";
import { getImageUrl } from "@/Utils/imageUpload";
import Pagination from "@/Components/Pagination";
import { useDestination } from "@/Stores/destinationStore";

const TripCard = ({ trip }) => {
  const navigate = useNavigate();
  const startDate = new Date(trip.start_date).toLocaleDateString();
  const endDate = new Date(trip.end_date).toLocaleDateString();
  const duration = Math.ceil(
    (new Date(trip.end_date) - new Date(trip.start_date)) /
      (1000 * 60 * 60 * 24)
  );

  // Get all destinations' details using our hook
  const destinations = trip.destinations
    .map((destId) => {
      const { data: destinationData } = useDestination(destId);
      return destinationData?.data;
    })
    .filter(Boolean);

  const handleTripClick = (e) => {
    e.preventDefault();
    navigate(`/trips/visualization/${trip._id}`);
  };

  // Get all destination images
  const destinationImages = destinations
    .map((dest) => dest?.images?.[0]?.url)
    .filter(Boolean)
    .map((url) => getImageUrl(url));

  return (
    <div
      onClick={handleTripClick}
      className="block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-soft cursor-pointer"
    >
      <div className="aspect-[16/9] w-full bg-gray-100 relative">
        {destinationImages.length > 0 ? (
          <div className="w-full h-full grid grid-cols-2 gap-0.5">
            {destinationImages.slice(0, 4).map((imageUrl, index) => (
              <div
                key={index}
                className={`relative bg-gray-100 ${
                  destinationImages.length === 1
                    ? "col-span-2 row-span-2"
                    : destinationImages.length === 2
                    ? "col-span-1 row-span-2"
                    : destinationImages.length === 3 && index === 0
                    ? "col-span-2"
                    : ""
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`Destination ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && destinationImages.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium">
                    +{destinationImages.length - 4} more
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              trip.status === "completed"
                ? "bg-green-100 text-green-700"
                : trip.status === "ongoing"
                ? "bg-blue-100 text-blue-700"
                : trip.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{trip.title}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>🗓️</span>
            <span>
              {startDate} - {endDate}
            </span>
            <span className="text-gray-400">•</span>
            <span>{duration} days</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{destinations.map((dest) => dest.name).join(", ")}</span>
          </div>
          {trip.budget?.amount && (
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span>
                {trip.budget.amount} {trip.budget.currency}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserCard = ({ user, isFollowing, onFollow, onUnfollow }) => {
  const profileImage = user.image ? getImageUrl(user.image) : null;

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
      <Link to={`/profile/${user._id}`} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center text-gray-700 font-semibold border border-gray-100">
          {profileImage ? (
            <img
              src={profileImage}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{user.username}</h3>
          <p className="text-sm text-gray-600">{user.bio || "No bio"}</p>
        </div>
      </Link>
      {onFollow && onUnfollow && (
        <button
          onClick={() =>
            isFollowing ? onUnfollow(user._id) : onFollow(user._id)
          }
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isFollowing
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("trips");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const navigate = useNavigate();
  const { mutate: followUser } = useFollowUser();
  const { mutate: unfollowUser } = useUnfollowUser();
  const { user, isLoading } = useAuth();

  // Reset pagination when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch followers/following data with pagination
  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    error: followersError,
  } = useFollowers(user?.data?._id, currentPage, ITEMS_PER_PAGE, {
    enabled: !!user?.data?._id && activeTab === "followers",
    retry: false,
  });

  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    error: followingError,
  } = useFollowing(user?.data?._id, currentPage, ITEMS_PER_PAGE, {
    enabled: !!user?.data?._id && activeTab === "following",
    retry: false,
  });

  // Fetch user's trips
  const {
    data: tripsData,
    isLoading: isLoadingTrips,
    error: tripsError,
  } = useUserTrips(user?.data?._id, currentPage, ITEMS_PER_PAGE, {
    enabled: !!user?.data?._id && activeTab === "trips",
    retry: false,
  });

  // Add debug logging
  useEffect(() => {
    if (tripsData) {
      console.log("Trips data received:", tripsData);
      console.log("User ID:", user?.data?._id);
      console.log("Current page:", currentPage);
    }
  }, [tripsData, user?.data?._id, currentPage]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Return null if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const userData = user.data;

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
    } catch (error) {
      console.error("Failed to follow user:", error);
      // You could add a toast notification here
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      // You could add a toast notification here
    }
  };

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

  const renderTabContent = () => {
    if (activeTab === "trips") {
      if (isLoadingTrips) {
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        );
      }

      if (tripsError) {
        return (
          <div className="text-center py-8 text-red-600">
            Failed to load trips. Please try again.
          </div>
        );
      }

      return (
        <>
          <div className="space-y-4">
            {tripsData?.data?.length > 0 ? (
              tripsData.data.map((trip) => (
                <TripCard key={trip._id} trip={trip} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">✈️</div>
                <p className="text-gray-600">No trips yet</p>
              </div>
            )}
          </div>
          {tripsData?.meta?.pagination?.total_pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={tripsData.meta.pagination.total_pages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      );
    }

    if (activeTab === "followers") {
      if (isLoadingFollowers) {
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        );
      }

      if (followersError) {
        return (
          <div className="text-center py-8 text-red-600">
            Failed to load followers. Please try again.
          </div>
        );
      }

      return (
        <>
          <div className="space-y-4">
            {followersData?.data?.length > 0 ? (
              followersData.data.map((follower) => (
                <UserCard
                  key={follower._id}
                  user={follower}
                  isFollowing={follower.is_following}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">👥</div>
                <p className="text-gray-600">No followers yet</p>
              </div>
            )}
          </div>
          {followersData?.meta?.pagination?.total_pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={followersData.meta.pagination.total_pages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      );
    }

    if (activeTab === "following") {
      if (isLoadingFollowing) {
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        );
      }

      if (followingError) {
        return (
          <div className="text-center py-8 text-red-600">
            Failed to load following. Please try again.
          </div>
        );
      }

      return (
        <>
          <div className="space-y-4">
            {followingData?.data?.length > 0 ? (
              followingData.data.map((following) => (
                <UserCard
                  key={following._id}
                  user={following}
                  isFollowing={true}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">👥</div>
                <p className="text-gray-600">Not following anyone yet</p>
              </div>
            )}
          </div>
          {followingData?.meta?.pagination?.total_pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={followingData.meta.pagination.total_pages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      );
    }

    if (activeTab === "reviews") {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">⭐</div>
          <p className="text-gray-600">Reviews feature coming soon!</p>
        </div>
      );
    }
  };

  const renderProfileImage = () => {
    const profileImage = userData.image ? getImageUrl(userData.image) : null;

    return (
      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-white flex items-center justify-center text-gray-700 font-semibold border border-gray-100">
        {profileImage ? (
          <img
            src={profileImage}
            alt={userData.username || "Profile"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl lg:text-3xl">
            {(userData.username || "U").charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 lg:px-5 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {renderProfileImage()}

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
                <Link
                  to="/settings/profile"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </Link>
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

          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
