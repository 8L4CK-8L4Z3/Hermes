"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost, useFeed } from "@/Stores/postStore";
import {
  MoreVertical,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Image as ImageIcon,
  MapPin,
  Book,
  X,
} from "lucide-react";

const SocialFeedPage = () => {
  const [newPost, setNewPost] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const createPostMutation = useCreatePost();
  const { data: feedData, isLoading: isFeedLoading } = useFeed();

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await createPostMutation.mutateAsync({
        content: newPost,
        type: "general",
        visibility: "public",
      });
      setNewPost("");
      setShowCreatePost(false);
    } catch (error) {
      setError(error.message || "Failed to create post. Please try again.");
    }
  };

  const posts = feedData?.data || [];

  const handleLike = (postId) => {
    // Handle like functionality
    console.log("Liked post:", postId);
  };

  const PostCard = ({ post }) => (
    <div className="bg-white rounded-2xl p-6 shadow-soft">
      {/* User Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
          {post.user?.name?.charAt(0) || post.user?.username?.charAt(0) || "?"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {post.user?.name || post.user?.username || "Unknown User"}
            </h3>
            <span className="text-gray-500 text-sm">
              @{post.user?.username || "unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span className="hover:text-blue-600 cursor-pointer">
                    {post.location.name}
                    {post.location.address && (
                      <span className="text-gray-400 ml-1">
                        • {post.location.address}
                      </span>
                    )}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => (
              <span
                key={`${post._id}-tag-${index}`}
                className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {post.media?.length > 0 && (
          <div
            className={`grid gap-2 rounded-xl overflow-hidden ${
              post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {post.media.map((image, index) => (
              <img
                key={`${post._id}-media-${index}`}
                src={image || "/placeholder.svg"}
                alt={`Post media ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleLike(post._id)}
            className={`flex items-center gap-2 transition-colors duration-200 ${
              post.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart
              className="w-5 h-5"
              fill={post.isLiked ? "currentColor" : "none"}
            />
            <span className="text-sm font-medium">{post.likes || 0}</span>
          </button>

          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments || 0}</span>
          </button>

          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Social Feed
          </h1>
          <p className="text-gray-600">
            Discover travel experiences from fellow explorers
          </p>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 text-left px-4 py-3 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-200"
            >
              Share your travel experience...
            </button>
          </div>

          {showCreatePost && (
            <form onSubmit={handleCreatePost} className="space-y-4">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="Share your travel experience, tips, or ask for recommendations..."
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Photo</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm">Location</span>
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPost.trim() || createPostMutation.isLoading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      !newPost.trim() || createPostMutation.isLoading
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {createPostMutation.isLoading ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {isFeedLoading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id || post._id} post={post} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No posts yet. Be the first to share!
            </div>
          )}
        </div>

        {/* Load More */}
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeedPage;
