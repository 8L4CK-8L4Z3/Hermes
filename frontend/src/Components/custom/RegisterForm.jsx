"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRegister } from "@/Stores/authStore";
import userRegistrationSchema from "@/Schemas/userRegistrationSchema";

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const register = useRegister();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear errors when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }));
    }
  };

  const validateForm = () => {
    try {
      userRegistrationSchema.parse(formData);
      return true;
    } catch (err) {
      const formattedErrors = {};
      err.errors.forEach((error) => {
        formattedErrors[error.path[0]] = error.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // First register the user
      const registerResponse = await register.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // If registration is successful, attempt to log in
      if (registerResponse?.data?.user) {
        const loginResponse = await login({
          email: formData.email,
          password: formData.password,
        });

        if (loginResponse?.data?.user) {
          navigate("/dashboard", { replace: true });
        } else {
          // If login fails after registration, redirect to login page
          navigate("/login", {
            state: { message: "Registration successful! Please log in." },
          });
        }
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response?.status === 409) {
        setErrors({ email: "Email or username already exists" });
      } else if (err.response?.status === 422) {
        setErrors({ form: "Invalid input. Please check your information." });
      } else {
        setErrors({
          form:
            err.response?.data?.error?.message ||
            err.response?.data?.message ||
            "Registration failed. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-gray-500">Enter your information to get started</p>
      </div>
      {errors.form && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {errors.form}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-medium leading-none"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="johndoe"
            className={`w-full rounded-md border ${
              errors.username ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm`}
            required
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username}</p>
          )}
        </div>
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
            className={`w-full rounded-md border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm`}
            required
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full rounded-md border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm`}
            required
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium leading-none"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full rounded-md border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm`}
            required
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            required
            disabled={isLoading}
          />
          <label htmlFor="terms" className="text-sm text-gray-500">
            I agree to the{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500"
              disabled={isLoading}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500"
              disabled={isLoading}
            >
              Privacy Policy
            </button>
          </label>
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
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-blue-600 hover:text-blue-500"
          disabled={isLoading}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
