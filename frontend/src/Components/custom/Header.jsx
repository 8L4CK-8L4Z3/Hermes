"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/Stores/notificationStore";
import { getImageUrl } from "@/Utils/imageUpload";
import Logo from "@/Components/custom/Logo";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { data: unreadCountData } = useUnreadCount();

  // Extract actual data from the response format
  const userData = user?.data;
  const unreadCount = unreadCountData?.data;

  // Get user's display name for the avatar
  const getDisplayInitial = () => {
    if (userData?.username) return userData.username[0].toUpperCase();
    if (userData?.email) return userData.email[0].toUpperCase();
    return "U";
  };

  // Get user's display name
  const getDisplayName = () => {
    if (userData?.username) return userData.username;
    if (userData?.email) return userData.email;
    return "User";
  };

  // Get user's role display
  const getUserRole = () => {
    if (userData?.isAdmin) return "Admin";
    if (userData?.isMod) return "Moderator";
    return null;
  };

  // Get user's profile image URL
  const getProfileImage = () => {
    if (userData?.image) {
      return getImageUrl(userData.image);
    }
    return null;
  };

  // Basic navigation items that are always visible
  const basicNavItems = [
    { name: "Destinations", page: "/", section: "destinations" },
    { name: "Activities", page: "/", section: "activities" },
    { name: "Plan Trip", page: "/", section: "plan" },
  ];

  // Navigation items for logged-in users
  const loggedInNavItems = [
    { name: "Explore", page: "/search" },
    { name: "My Trips", page: "/profile" },
    { name: "Feed", page: "/feed" },
    { name: "Plan Trip", page: "/plan-trip" },
  ];

  // Admin navigation items
  const adminNavItems = [
    { name: "Dashboard", page: "/admin" },
    { name: "Users", page: "/admin/users" },
    { name: "Content", page: "/admin/moderation" },
    { name: "Destinations", page: "/admin/destinations" },
    { name: "Analytics", page: "/admin/analytics" },
  ];

  // Determine which nav items to show based on user role
  const getNavItems = () => {
    if (!isLoggedIn) return basicNavItems;

    if (userData?.isAdmin) {
      return [...loggedInNavItems, ...adminNavItems];
    }

    return [...loggedInNavItems];
  };

  const navItems = getNavItems();

  // Helper function to handle navigation
  const handleNavigation = (item) => {
    setIsMenuOpen(false);

    if (item.section && item.page === "/") {
      // Navigate to home first, then scroll to section
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(item.section);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      navigate(item.page);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Don't show the full header if user is banned
  if (userData?.isBanned) {
    return (
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-5">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Logo />
            </div>
            <div className="text-sm text-red-600">
              Account Suspended
              {userData?.banReason ? `: ${userData.banReason}` : ""}
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-3"
            >
              <Logo />
              {isLoggedIn && getUserRole() && (
                <span
                  className={`px-2 py-1 ${
                    userData?.isAdmin
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  } rounded-full text-xs font-medium`}
                >
                  {getUserRole()}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Notifications Button */}
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v6m0 0l3-3m-3 3l-3-3"
                    />
                  </svg>
                  {unreadCount?.count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount.count}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-4">
                  {!userData?.isAdmin && (
                    <button
                      onClick={() => navigate("/plan-trip")}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
                    >
                      Plan Trip
                    </button>
                  )}
                  <div className="relative group">
                    <button
                      className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center text-gray-700 font-semibold border border-gray-100"
                      title={getDisplayName()}
                    >
                      {getProfileImage() ? (
                        <img
                          src={getProfileImage()}
                          alt={getDisplayName()}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{getDisplayInitial()}</span>
                      )}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 hidden group-hover:block">
                      <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                        {getDisplayName()}
                        {userData?.isVerified && (
                          <span
                            className="ml-1 text-blue-500"
                            title="Verified Account"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      {!userData?.isAdmin && (
                        <>
                          <button
                            onClick={() => navigate("/profile")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => navigate("/settings/profile")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Settings
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate("/notifications")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Notifications
                        {unreadCount?.count > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadCount.count}
                          </span>
                        )}
                      </button>
                      {userData?.isAdmin && (
                        <>
                          <button
                            onClick={() => navigate("/admin")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Admin Dashboard
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
                        Stats
                      </div>
                      <div className="px-4 py-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
                        <div>
                          <div className="font-medium">
                            {userData?.stats?.tripsCount || 0}
                          </div>
                          <div>Trips</div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {userData?.stats?.reviewsCount || 0}
                          </div>
                          <div>Reviews</div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 mt-2 border-t border-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 px-3 py-1"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-50">
            <nav className="flex flex-col space-y-3">
              <div className="px-4 py-2 flex items-center space-x-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center text-gray-700 font-semibold border border-gray-100">
                  {getProfileImage() ? (
                    <img
                      src={getProfileImage()}
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getDisplayInitial()}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {getDisplayName()}
                    {userData?.isVerified && (
                      <span
                        className="ml-1 text-blue-500"
                        title="Verified Account"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  {getUserRole() && (
                    <div className="text-xs text-gray-500">{getUserRole()}</div>
                  )}
                </div>
              </div>
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 py-1 text-left px-4"
                >
                  {item.name}
                </button>
              ))}
              {isLoggedIn && !userData?.isAdmin && (
                <button
                  onClick={() => {
                    navigate("/plan-trip");
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 py-1 text-left px-4"
                >
                  Plan Trip
                </button>
              )}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    navigate("/notifications");
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 py-1 text-left px-4 flex items-center"
                >
                  Notifications
                  {unreadCount?.count > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount.count}
                    </span>
                  )}
                </button>
              )}
              {isLoggedIn && (
                <div className="px-4 py-2 text-xs text-gray-500 grid grid-cols-2 gap-2 border-t border-gray-100">
                  <div>
                    <div className="font-medium">
                      {userData?.stats?.tripsCount || 0}
                    </div>
                    <div>Trips</div>
                  </div>
                  <div>
                    <div className="font-medium">
                      {userData?.stats?.reviewsCount || 0}
                    </div>
                    <div>Reviews</div>
                  </div>
                </div>
              )}
              <div className="pt-3 border-t border-gray-50">
                {isLoggedIn ? (
                  <>
                    {!userData?.isAdmin && (
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left py-2 text-sm text-gray-700 hover:text-gray-900 px-4"
                      >
                        Profile
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-2 text-sm text-gray-700 hover:text-gray-900 px-4"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left py-2 text-sm text-gray-700 hover:text-gray-900"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        navigate("/register");
                        setIsMenuOpen(false);
                      }}
                      className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium w-full"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
