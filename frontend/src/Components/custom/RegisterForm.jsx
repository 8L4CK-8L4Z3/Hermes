"use client"

import { useContext } from "react"
import { AuthContext, NavigationContext } from "@/App"

export const RegisterForm = () => {
  const { login } = useContext(AuthContext)
  const { navigate } = useContext(NavigationContext)

  const handleSubmit = (e) => {
    e.preventDefault()
    login() // Simulate registration and login
    navigate("home") // Redirect to home page
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-gray-500">Enter your information to get started</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="first-name" className="text-sm font-medium leading-none">
              First name
            </label>
            <input
              id="first-name"
              type="text"
              placeholder="John"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="last-name" className="text-sm font-medium leading-none">
              Last name
            </label>
            <input
              id="last-name"
              type="text"
              placeholder="Doe"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>
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
          <label htmlFor="password" className="text-sm font-medium leading-none">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <input id="terms" type="checkbox" className="h-4 w-4 rounded border-gray-300" required />
          <label htmlFor="terms" className="text-sm text-gray-500">
            I agree to the{" "}
            <button type="button" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </button>
          </label>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Create Account
        </button>
      </form>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <button onClick={() => navigate("login")} className="text-blue-600 hover:text-blue-500">
          Sign in
        </button>
      </div>
    </div>
  )
}
