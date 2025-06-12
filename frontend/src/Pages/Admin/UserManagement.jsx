"use client"

import { useState, useContext } from "react"
import { AuthContext, NavigationContext } from "@/App"

const UserManagement = () => {
  const { navigate } = useContext(NavigationContext)
  const { isLoggedIn } = useContext(AuthContext)
  const [isAdmin] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState([])

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={() => navigate("home")}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  const users = [
    {
      id: 1,
      username: "sarah_johnson",
      email: "sarah@example.com",
      isAdmin: false,
      isMod: false,
      isVerified: true,
      lastLogin: "2024-01-15T10:30:00Z",
      created_at: "2023-03-15T08:00:00Z",
      status: "active",
      tripCount: 12,
      reviewCount: 45,
      photo: null,
    },
    {
      id: 2,
      username: "marco_travels",
      email: "marco@example.com",
      isAdmin: false,
      isMod: true,
      isVerified: true,
      lastLogin: "2024-01-14T18:45:00Z",
      created_at: "2023-01-20T12:00:00Z",
      status: "active",
      tripCount: 8,
      reviewCount: 67,
      photo: null,
    },
    {
      id: 3,
      username: "emily_adventures",
      email: "emily@example.com",
      isAdmin: false,
      isMod: false,
      isVerified: false,
      lastLogin: "2024-01-13T14:20:00Z",
      created_at: "2023-12-01T09:30:00Z",
      status: "pending",
      tripCount: 3,
      reviewCount: 12,
      photo: null,
    },
    {
      id: 4,
      username: "john_explorer",
      email: "john@example.com",
      isAdmin: false,
      isMod: false,
      isVerified: true,
      lastLogin: "2024-01-10T16:15:00Z",
      created_at: "2023-06-10T14:00:00Z",
      status: "banned",
      tripCount: 5,
      reviewCount: 23,
      photo: null,
    },
  ]

  const handleUserAction = (userId, action) => {
    console.log(`${action} user ${userId}`)
    // Handle user actions (ban, unban, verify, etc.)
  }

  const handleBulkAction = (action) => {
    console.log(`${action} users:`, selectedUsers)
    setSelectedUsers([])
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && user.isAdmin) ||
      (filterRole === "mod" && user.isMod) ||
      (filterRole === "user" && !user.isAdmin && !user.isMod)
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const UserRow = ({ user }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user.id])
            } else {
              setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
            }
          }}
          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.username}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1">
          {user.isAdmin && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Admin</span>
          )}
          {user.isMod && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Mod</span>
          )}
          {!user.isAdmin && !user.isMod && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">User</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : user.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          {user.isVerified ? <span className="text-green-500">✅</span> : <span className="text-gray-400">❌</span>}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.lastLogin).toLocaleDateString()}</td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {user.tripCount} trips, {user.reviewCount} reviews
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleUserAction(user.id, "edit")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          {user.status === "active" ? (
            <button
              onClick={() => handleUserAction(user.id, "ban")}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Ban
            </button>
          ) : user.status === "banned" ? (
            <button
              onClick={() => handleUserAction(user.id, "unban")}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Unban
            </button>
          ) : null}
          {!user.isVerified && (
            <button
              onClick={() => handleUserAction(user.id, "verify")}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Verify
            </button>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by username or email..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="mod">Moderator</option>
              <option value="user">User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">{selectedUsers.length} users selected</span>
              <button
                onClick={() => handleBulkAction("verify")}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors duration-200"
              >
                Verify Selected
              </button>
              <button
                onClick={() => handleBulkAction("ban")}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200"
              >
                Ban Selected
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map((user) => user.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-4xl">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              Previous
            </button>
            <button className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">1</button>
            <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              2
            </button>
            <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
