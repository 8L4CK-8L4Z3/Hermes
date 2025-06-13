import { useCurrentUser, useLogin, useLogout } from "@/Stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuth = () => {
  const { data: user, isLoading, isError } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (credentials) => {
    const result = await loginMutation.mutateAsync(credentials);
    // After successful login, fetch user data
    await queryClient.invalidateQueries(["currentUser"]);
    // Navigate to the intended page or dashboard
    const intendedPath = location.state?.from || "/";
    navigate(intendedPath);
    return result;
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Clear user data from cache
      queryClient.setQueryData(["currentUser"], null);
      // Remove all queries from cache
      queryClient.clear();
      // Navigate to login
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear the cache and redirect on error
      queryClient.clear();
      navigate("/");
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const isAuthPage = ["/login", "/register"].includes(location.pathname);
    if (!isLoading && !user && !isAuthPage) {
      // Save the current location to redirect back after login
      navigate("/", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [user, isLoading, location.pathname, navigate]);

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    isError,
    login,
    logout,
  };
};
