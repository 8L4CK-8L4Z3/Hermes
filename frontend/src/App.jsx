"use client";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/Utils/queryClient";

import Header from "@/Components/custom/Header";
import Footer from "@/Components/custom/Footer";

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

import { useAuth } from "@/hooks/useAuth";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  // const { isLoggedIn, isLoading, user } = useAuth();

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }
  // if (!isLoggedIn || !user?.isAdmin) {
  //   return <Navigate to="/login" />;
  // }
  return children;
};

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Don't show header and footer on login and register pages */}
      <Routes>
        <Route
          path="*"
          element={
            <>
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/:userId"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/plan-trip"
                    element={
                      <ProtectedRoute>
                        <TripPlanningPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/destination/:id"
                    element={<DestinationPage />}
                  />
                  <Route path="/place/:id" element={<PlacePage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route
                    path="/feed"
                    element={
                      <ProtectedRoute>
                        <SocialFeedPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trip/:id"
                    element={
                      <ProtectedRoute>
                        <TripVisualizationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <UserManagement />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/moderation"
                    element={
                      <AdminRoute>
                        <ContentModeration />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/destinations"
                    element={
                      <AdminRoute>
                        <DestinationManagement />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <AdminRoute>
                        <Analytics />
                      </AdminRoute>
                    }
                  />

                  {/* Catch-all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* Auth routes without header/footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
