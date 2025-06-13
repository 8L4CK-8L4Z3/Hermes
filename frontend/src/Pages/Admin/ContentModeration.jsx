"use client";

import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  useReportedContent,
  useModerateReportedContent,
} from "@/Stores/adminStore";
// import { useAuth } from "@/hooks/useAuth";

const ContentModeration = () => {
  // const navigate = useNavigate();
  // const { isLoggedIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState("reviews");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [moderationReason, setModerationReason] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const [error, setError] = useState("");
  const limit = 10;

  const { data: reportedContent, isLoading } = useReportedContent(
    page,
    limit,
    filterStatus
  );
  const moderateContentMutation = useModerateReportedContent();

  // if (!isLoggedIn || !user?.isAdmin) {
  //   navigate("/");
  //   return null;
  // }

  // TODO: Photos moderation is not yet implemented in the backend
  const tabs = [
    {
      id: "reviews",
      label: "Reviews",
      count:
        reportedContent?.data?.filter(
          (item) => item.type === "review" && item.status === "pending"
        )?.length || 0,
    },
    {
      id: "posts",
      label: "Posts",
      count:
        reportedContent?.data?.filter(
          (item) => item.type === "post" && item.status === "pending"
        )?.length || 0,
    },
    { id: "photos", label: "Photos", count: 0 },
  ];

  const validateReason = (reason) => {
    if (!reason.trim()) {
      return "Reason is required";
    }
    if (reason.length > 500) {
      return "Reason must be less than 500 characters";
    }
    return null;
  };

  const handleContentAction = async (contentId, action) => {
    // Reset any previous errors
    setError("");

    // Validate reason
    const validationError = validateReason(moderationReason);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const reason = moderationReason.trim();
      await moderateContentMutation.mutateAsync({
        contentId,
        action,
        reason,
      });
      setModerationReason("");
      setSelectedContent(null);
    } catch (error) {
      console.error("Error moderating content:", error);
      if (error.response?.data?.error?.errors) {
        // Handle validation errors from backend
        const errors = error.response.data.error.errors;
        setError(errors.map((err) => err.msg).join(", "));
      } else if (error.response?.data?.message) {
        // Handle general error message from backend
        setError(error.response.data.message);
      } else {
        // Handle unexpected errors
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const ModerationDialog = ({ content, onClose }) => {
    if (!content) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
          <h3 className="text-lg font-medium mb-4">Moderate Content</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for moderation
              <span className="text-red-500 ml-1">*</span>
              <span className="text-gray-500 text-xs ml-2">
                (Max 500 characters)
              </span>
            </label>
            <textarea
              value={moderationReason}
              onChange={(e) => {
                setModerationReason(e.target.value);
                setError(""); // Clear error when user starts typing
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              rows="3"
              placeholder="Enter the reason for this moderation action..."
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <p className="mt-1 text-sm text-gray-500">
              {moderationReason.length}/500 characters
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => handleContentAction(content._id, "ignore")}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
              disabled={moderateContentMutation.isLoading}
            >
              {moderateContentMutation.isLoading
                ? "Processing..."
                : "Ignore Report"}
            </button>
            <button
              onClick={() => handleContentAction(content._id, "remove")}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
              disabled={moderateContentMutation.isLoading}
            >
              {moderateContentMutation.isLoading
                ? "Processing..."
                : "Remove Content"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getFilteredContent = () => {
    if (!reportedContent?.data) return [];

    return reportedContent.data.filter((content) => {
      // Then filter by content type
      return activeTab === content.target_type.toLowerCase() + "s";
    });
  };

  const ContentCard = ({ content }) => {
    const targetContent = content.target_content;
    const type = content.target_type.toLowerCase();

    if (!targetContent || content.target_content_status === "deleted") {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <div className="text-center py-4">
            <p className="text-gray-600">This content has been deleted</p>
          </div>
        </div>
      );
    }

    if (content.target_content_status === "error") {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <div className="text-center py-4">
            <p className="text-red-600">
              Error loading content: {content.error}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
              {targetContent.user_id?.username?.charAt(0)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {targetContent.user_id?.username}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                content.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : content.status === "flagged"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {content.status}
            </span>
          </div>
        </div>

        {type === "review" && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900">
                Place: {targetContent.place_id?.name}
              </span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < targetContent.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-gray-800 mb-4">
          {type === "review" ? targetContent.comment : targetContent.content}
        </p>

        {targetContent.media && targetContent.media.length > 0 && (
          <div className="mb-4">
            <img
              src={targetContent.media[0] || "/placeholder.svg"}
              alt="Content media"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {content.reason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Report Reason:</strong> {content.reason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {new Date(content.createdAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            {content.status === "pending" && (
              <button
                onClick={() => setSelectedContent(content)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
              >
                Take Action
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Content Moderation
          </h1>
          <p className="text-gray-600">
            Review and moderate user-generated content
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
          <div className="border-b border-gray-100">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Filter by status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div>
          {(activeTab === "reviews" || activeTab === "posts") && (
            <div>
              {getFilteredContent().map((content) => (
                <ContentCard key={content._id} content={content} />
              ))}
            </div>
          )}

          {activeTab === "photos" && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-4xl">📸</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Photo Moderation
              </h3>
              <p className="text-gray-600">
                TODO: Photo moderation feature is not yet implemented in the
                backend
              </p>
            </div>
          )}

          {getFilteredContent().length === 0 && activeTab !== "photos" && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-4xl">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No content found
              </h3>
              <p className="text-gray-600">
                No {activeTab} match the current filter criteria
              </p>
            </div>
          )}

          {reportedContent?.meta?.pagination && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg mr-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {reportedContent.meta.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === reportedContent.meta.pagination.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg ml-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <ModerationDialog
        content={selectedContent}
        onClose={() => {
          setSelectedContent(null);
          setModerationReason("");
        }}
      />
    </div>
  );
};

export default ContentModeration;
