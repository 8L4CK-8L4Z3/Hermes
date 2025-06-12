"use client";
import { useState, createContext } from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

// Import pages
import LandingPage from "@/Pages/LandingPage";
import ProfilePage from "@/Pages/ProfilePage";
import TripPlanningPage from "@/Pages/TripPlanningPage";
import DestinationPage from "@/Pages/DestinationPage";
import PlacePage from "@/Pages/PlacePage";
import SearchResultsPage from "@/Pages/SearchResultsPage";
import SocialFeedPage from "@/Pages/SocialFeedPage";
import TripVisualizationPage from "@/Pages/TripVisualizationPage";
import NotificationsPage from "@/Pages/NotificationsPage";
import LoginPage from "@/Pages/LoginPage";
import RegisterPage from "@/Pages/RegisterPage";

// Import admin pages
import AdminDashboard from "@/Pages/Admin/AdminDashboard";
import UserManagement from "@/Pages/Admin/UserManagement";
import ContentModeration from "@/Pages/Admin/ContentModeration";
import DestinationManagement from "@/Pages/Admin/DestinationManagement";
import Analytics from "@/Pages/Admin/Analytics";

// Create auth context with default values
export const AuthContext = createContext({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

// Create navigation context with default values
export const NavigationContext = createContext({
  currentPage: "home",
  navigate: () => {},
  pageParams: {},
});

function App() {
  // Simple auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [pageParams, setPageParams] = useState({});

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  const navigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <LandingPage />;
      case "profile":
        return <ProfilePage />;
      case "plan-trip":
        return <TripPlanningPage />;
      case "destination":
        return <DestinationPage />;
      case "place":
        return <PlacePage />;
      case "search":
        return <SearchResultsPage />;
      case "feed":
        return <SocialFeedPage />;
      case "trip":
        return <TripVisualizationPage />;
      case "notifications":
        return <NotificationsPage />;
      case "login":
        return <LoginPage />;
      case "register":
        return <RegisterPage />;
      case "admin":
        return <AdminDashboard />;
      case "admin-users":
        return <UserManagement />;
      case "admin-moderation":
        return <ContentModeration />;
      case "admin-destinations":
        return <DestinationManagement />;
      case "admin-analytics":
        return <Analytics />;
      default:
        return <LandingPage />;
    }
  };

  // Create context values
  const authContextValue = {
    isLoggedIn,
    login,
    logout,
  };

  const navigationContextValue = {
    currentPage,
    navigate,
    pageParams,
  };

  // Don't show header and footer on login and register pages
  const showHeaderFooter = !["login", "register"].includes(currentPage);

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContext.Provider value={navigationContextValue}>
        <div className="min-h-screen flex flex-col">
          {showHeaderFooter && <Header />}
          <main className="flex-1">{renderCurrentPage()}</main>
          {showHeaderFooter && <Footer />}
        </div>
      </NavigationContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
