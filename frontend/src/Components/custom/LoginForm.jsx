"use client"

import { useContext } from "react"
import { AuthContext, NavigationContext } from "@/App"

export const LoginForm = () => {
  const { login } = useContext(AuthContext)
  const { navigate } = useContext(NavigationContext)

  const handleSubmit = (e) => {
    e.preventDefault()
    login() // Simulate login
    navigate("home") // Redirect to home page
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-gray-500">Enter your credentials to access your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium leading-none">
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
            placeholder="••••••••"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Sign In
        </button>
      </form>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <button onClick={() => navigate("register")} className="text-blue-600 hover:text-blue-500">
          Sign up
        </button>
      </div>
    </div>
  )
}
