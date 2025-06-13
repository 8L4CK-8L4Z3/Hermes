"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      // Navigate to the intended page or dashboard
      const intendedPath = location.state?.from || "/feed";
      navigate(intendedPath, { replace: true });
    }
  }, [isLoggedIn, navigate, location]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(credentials);
      // Check if the response contains user data
      if (response?.data?.user) {
        // Navigate to the intended page or dashboard
        const intendedPath = location.state?.from || "/feed";
        navigate(intendedPath, { replace: true });
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 403) {
        setError("Account is suspended. Please contact support.");
      } else {
        setError(
          err.response?.data?.error?.message ||
            err.response?.data?.message ||
            "Failed to login. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-gray-500">
          Enter your credentials to access your account
        </p>
      </div>
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-600 hover:text-blue-500"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          className="text-blue-600 hover:text-blue-500"
          disabled={isLoading}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};
