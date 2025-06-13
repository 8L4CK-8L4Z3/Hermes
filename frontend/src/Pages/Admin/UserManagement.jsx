"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAllUsers,
  useUpdateUserRole,
  useBanUser,
  useUnbanUser,
} from "@/Stores/adminStore";
// import { useAuth } from "@/hooks/useAuth";

const UserManagement = () => {
  const navigate = useNavigate();
  // const { isLoggedIn, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: usersData, isLoading, error } = useAllUsers(page, limit);
  const updateUserRole = useUpdateUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  // if (!isLoggedIn || !user?.isAdmin) {
  //   navigate("/");
  //   return null;
  // }

  const handleUserAction = async (userId, action) => {
    if (!userId) {
      alert("Error: User ID is missing");
      return;
    }

    try {
      const id = userId.toString();

      switch (action) {
        case "ban":
          await banUser.mutateAsync(id);
          break;
        case "unban":
          await unbanUser.mutateAsync(id);
          break;
        case "makeAdmin":
          await updateUserRole.mutateAsync({
            userId: id,
            role: {
              isAdmin: true,
              isMod: false,
            },
          });
          break;
        case "makeMod":
          await updateUserRole.mutateAsync({
            userId: id,
            role: {
              isAdmin: false,
              isMod: true,
            },
          });
          break;
        case "removeRole":
          await updateUserRole.mutateAsync({
            userId: id,
            role: {
              isAdmin: false,
              isMod: false,
            },
          });
          break;
      }
    } catch (error) {
      let errorMessage = "An error occurred";

      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Failed to ${action}: ${errorMessage}`);
    }
  };

  const filteredUsers =
    usersData?.data?.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        filterRole === "all" ||
        (filterRole === "admin" && user.isAdmin) ||
        (filterRole === "mod" && user.isMod) ||
        (filterRole === "user" && !user.isAdmin && !user.isMod);

      return matchesSearch && matchesRole;
    }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-red-600">Error loading users: {error.message}</div>
      </div>
    );
  }

  const UserRow = ({ user }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{user.username}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1">
          {user.isAdmin && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              Admin
            </span>
          )}
          {user.isMod && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Mod
            </span>
          )}
          {!user.isAdmin && !user.isMod && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              User
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          {user.isVerified ? (
            <span className="text-green-500">✅</span>
          ) : (
            <span className="text-gray-400">❌</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {new Date(user.lastLogin).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {user.tripCount} trips, {user.reviewCount} reviews
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {!user.isAdmin && !user.isMod && (
            <>
              <button
                onClick={() => handleUserAction(user._id, "makeAdmin")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Make Admin
              </button>
              <button
                onClick={() => handleUserAction(user._id, "makeMod")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Make Mod
              </button>
            </>
          )}
          {(user.isAdmin || user.isMod) && (
            <button
              onClick={() => handleUserAction(user._id, "removeRole")}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Remove {user.isAdmin ? "Admin" : "Mod"}
            </button>
          )}
          {user.status === "active" ? (
            <button
              onClick={() => handleUserAction(user._id, "ban")}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Ban
            </button>
          ) : user.status === "banned" ? (
            <button
              onClick={() => handleUserAction(user._id, "unban")}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Unban
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
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
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
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
                  <UserRow key={user._id} user={user} />
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-4xl">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {usersData?.total || 0} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium ${
                page === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              } transition-colors duration-200`}
            >
              Previous
            </button>
            <button className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
              {page}
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!usersData?.hasNextPage}
              className={`px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium ${
                !usersData?.hasNextPage
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              } transition-colors duration-200`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
