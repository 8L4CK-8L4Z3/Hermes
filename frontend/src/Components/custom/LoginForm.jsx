"use client";

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/Stores/authStore";
import { AuthContext } from "@/Context/Auth";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const loginMutation = useLogin();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/feed");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginMutation.mutateAsync(formData);
      login(); // Update auth context
      navigate("/feed");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to login. Please try again."
      );
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
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
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
              onClick={() => navigate("forgot-password")}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <button
          onClick={() => navigate("register")}
          className="text-blue-600 hover:text-blue-500"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};
