"use client";

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/Auth";
import Logo from "@/Components/custom/Logo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdmin] = useState(true); // Mock admin check
  const [unreadCount] = useState(3); // Mock unread notifications count

  // Check if context is available
  if (!authContext) {
    return (
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-5">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Logo />
              <span className="text-xl font-medium text-gray-900">Hermes</span>
            </div>
            <div className="text-sm text-gray-600">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  const { isLoggedIn, login, logout } = authContext;

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
  ];

  // Admin navigation items
  const adminNavItems = [
    { name: "Dashboard", page: "/admin" },
    { name: "Users", page: "/admin-users" },
    { name: "Content", page: "/admin-moderation" },
    { name: "Destinations", page: "/admin-destinations" },
    { name: "Analytics", page: "/admin-analytics" },
  ];

  // Determine which nav items to show
  const navItems =
    isLoggedIn && isAdmin
      ? adminNavItems
      : isLoggedIn
      ? loggedInNavItems
      : basicNavItems;

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
              {isLoggedIn && isAdmin && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Admin
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
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-4">
                  {!isAdmin && (
                    <button
                      onClick={() => navigate("/plan-trip")}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
                    >
                      Plan Trip
                    </button>
                  )}
                  <div className="relative group">
                    <button className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                      {isAdmin ? "A" : "JD"}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 hidden group-hover:block">
                      {!isAdmin && (
                        <button
                          onClick={() => navigate("/profile")}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </button>
                      )}
                      <button
                        onClick={() => navigate("/notifications")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => navigate("/admin")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Admin Dashboard
                          </button>
                          <button
                            onClick={() => navigate("/")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Switch to User View
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 py-1 text-left"
                >
                  {item.name}
                </button>
              ))}
              {isLoggedIn && !isAdmin && (
                <button
                  onClick={() => {
                    navigate("/plan-trip");
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 py-1 text-left"
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
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 py-1 text-left flex items-center"
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              <div className="pt-3 border-t border-gray-50">
                {isLoggedIn ? (
                  <>
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left py-2 text-sm text-gray-700 hover:text-gray-900"
                      >
                        Profile
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate("/");
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left py-2 text-sm text-gray-700 hover:text-gray-900"
                      >
                        Switch to User View
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left py-2 text-sm text-gray-700 hover:text-gray-900"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
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
