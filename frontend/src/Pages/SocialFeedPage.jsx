"use client"

import { useState, useContext } from "react"
import { AuthContext } from "@/Context/Auth"
import { NavigationContext } from "@/Context/Navigate"

const SocialFeedPage = () => {
  const [newPost, setNewPost] = useState("")
  const [showCreatePost, setShowCreatePost] = useState(false)
  const { navigate } = useContext(NavigationContext)
  const { isLoggedIn } = useContext(AuthContext)

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Please sign in to view the social feed</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access this feature.</p>
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

  const posts = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        username: "@sarahj",
        photo: null,
      },
      type: "trip_share",
      content:
        "Just completed my amazing 2-week European adventure! 🇮🇹🇫🇷🇪🇸 Rome → Paris → Barcelona. The food, the culture, the people - everything was incredible!",
      media: ["/images/rome.jpg", "/images/newyork.jpg"],
      location: "Barcelona, Spain",
      tags: ["#Europe", "#Travel", "#Adventure"],
      likes: 127,
      comments: 23,
      createdAt: "2024-01-15T10:30:00Z",
      isLiked: false,
    },
    {
      id: 2,
      user: {
        name: "Marco Rossi",
        username: "@marco_travels",
        photo: null,
      },
      type: "review",
      content:
        "The Colosseum at sunset is absolutely breathtaking! If you're visiting Rome, make sure to book the evening tour. Worth every penny! ⭐⭐⭐⭐⭐",
      media: ["/images/sightseeing.jpg"],
      location: "Rome, Italy",
      tags: ["#Rome", "#Colosseum", "#Review"],
      likes: 89,
      comments: 15,
      createdAt: "2024-01-14T18:45:00Z",
      isLiked: true,
    },
    {
      id: 3,
      user: {
        name: "Emily Chen",
        username: "@emily_adventures",
        photo: null,
      },
      type: "update",
      content:
        "Planning my next adventure to Japan! 🇯🇵 Any recommendations for hidden gems in Tokyo? Looking for authentic local experiences!",
      media: ["/images/japan.jpg"],
      location: null,
      tags: ["#Japan", "#Tokyo", "#Planning"],
      likes: 45,
      comments: 31,
      createdAt: "2024-01-13T14:20:00Z",
      isLiked: false,
    },
  ]

  const handleLike = (postId) => {
    // Handle like functionality
    console.log("Liked post:", postId)
  }

  const handleCreatePost = (e) => {
    e.preventDefault()
    // Handle post creation
    console.log("Creating post:", newPost)
    setNewPost("")
    setShowCreatePost(false)
  }

  const PostCard = ({ post }) => (
    <div className="bg-white rounded-2xl p-6 shadow-soft">
      {/* User Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
          {post.user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
            <span className="text-gray-500 text-sm">{post.user.username}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.location && (
              <>
                <span>•</span>
                <span>📍 {post.location}</span>
              </>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {post.media.length > 0 && (
          <div
            className={`grid gap-2 rounded-xl overflow-hidden ${
              post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {post.media.map((image, index) => (
              <img
                key={index}
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
            onClick={() => handleLike(post.id)}
            className={`flex items-center gap-2 transition-colors duration-200 ${
              post.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={post.isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium">{post.likes}</span>
          </button>

          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">{post.comments}</span>
          </button>

          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Social Feed</h1>
          <p className="text-gray-600">Discover travel experiences from fellow explorers</p>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
              JD
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">Photo</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm">Location</span>
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPost.trim()}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      newPost.trim()
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  )
}

export default SocialFeedPage
