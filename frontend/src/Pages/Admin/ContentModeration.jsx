"use client"

import { useState, useContext } from "react"
import { AuthContext } from "@/Context/Auth"
import { NavigationContext } from "@/Context/Navigate"

const ContentModeration = () => {
  const { navigate } = useContext(NavigationContext)
  const { isLoggedIn } = useContext(AuthContext)
  const [isAdmin] = useState(true)
  const [activeTab, setActiveTab] = useState("reviews")
  const [filterStatus, setFilterStatus] = useState("pending")

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

  const reviews = [
    {
      id: 1,
      user: { name: "Sarah Johnson", username: "@sarahj" },
      place: "Colosseum",
      rating: 5,
      comment:
        "Absolutely incredible! The history and architecture are breathtaking. Definitely worth the visit and the skip-the-line tickets are a must!",
      photos: ["/images/sightseeing.jpg"],
      status: "pending",
      flagReason: null,
      created_at: "2024-01-15T10:30:00Z",
      reportCount: 0,
    },
    {
      id: 2,
      user: { name: "Marco Rossi", username: "@marco_travels" },
      place: "Central Park",
      rating: 1,
      comment:
        "This place is terrible! Worst experience ever. Don't waste your money here. The staff was rude and unprofessional.",
      photos: [],
      status: "flagged",
      flagReason: "Inappropriate language",
      created_at: "2024-01-14T18:45:00Z",
      reportCount: 3,
    },
    {
      id: 3,
      user: { name: "Emily Chen", username: "@emily_adventures" },
      place: "Eiffel Tower",
      rating: 4,
      comment:
        "Beautiful landmark! Great views from the top. Can get crowded during peak hours but still worth visiting.",
      photos: ["/images/newyork.jpg"],
      status: "approved",
      flagReason: null,
      created_at: "2024-01-13T14:20:00Z",
      reportCount: 0,
    },
  ]

  const posts = [
    {
      id: 1,
      user: { name: "John Doe", username: "@johndoe" },
      content:
        "Just had an amazing trip to Rome! The food was incredible and the people were so friendly. Can't wait to go back!",
      media: ["/images/rome.jpg"],
      status: "pending",
      flagReason: null,
      created_at: "2024-01-15T12:00:00Z",
      reportCount: 0,
    },
    {
      id: 2,
      user: { name: "Jane Smith", username: "@janesmith" },
      content:
        "This is spam content with inappropriate links and promotional material that violates our community guidelines.",
      media: [],
      status: "flagged",
      flagReason: "Spam content",
      created_at: "2024-01-14T16:30:00Z",
      reportCount: 5,
    },
  ]

  const handleContentAction = (contentId, action, type) => {
    console.log(`${action} ${type} ${contentId}`)
    // Handle content moderation actions
  }

  const tabs = [
    { id: "reviews", label: "Reviews", count: reviews.filter((r) => r.status === "pending").length },
    { id: "posts", label: "Posts", count: posts.filter((p) => p.status === "pending").length },
    { id: "photos", label: "Photos", count: 3 },
  ]

  const ContentCard = ({ content, type }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
            {content.user.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{content.user.name}</h4>
            <p className="text-sm text-gray-600">{content.user.username}</p>
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
          {content.reportCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              {content.reportCount} reports
            </span>
          )}
        </div>
      </div>

      {type === "review" && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">Place: {content.place}</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < content.rating ? "text-yellow-400" : "text-gray-300"}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-800 mb-4">{content.comment || content.content}</p>

      {content.photos && content.photos.length > 0 && (
        <div className="mb-4">
          <img
            src={content.photos[0] || "/placeholder.svg"}
            alt="Content"
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {content.media && content.media.length > 0 && (
        <div className="mb-4">
          <img
            src={content.media[0] || "/placeholder.svg"}
            alt="Post media"
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {content.flagReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Flag Reason:</strong> {content.flagReason}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{new Date(content.created_at).toLocaleString()}</div>
        <div className="flex items-center gap-2">
          {content.status === "pending" && (
            <>
              <button
                onClick={() => handleContentAction(content.id, "approve", type)}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors duration-200"
              >
                Approve
              </button>
              <button
                onClick={() => handleContentAction(content.id, "reject", type)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200"
              >
                Reject
              </button>
            </>
          )}
          {content.status === "flagged" && (
            <>
              <button
                onClick={() => handleContentAction(content.id, "approve", type)}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors duration-200"
              >
                Approve
              </button>
              <button
                onClick={() => handleContentAction(content.id, "delete", type)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200"
              >
                Delete
              </button>
            </>
          )}
          <button
            onClick={() => handleContentAction(content.id, "view", type)}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )

  const getFilteredContent = () => {
    if (activeTab === "reviews") {
      return reviews.filter((review) => filterStatus === "all" || review.status === filterStatus)
    } else if (activeTab === "posts") {
      return posts.filter((post) => filterStatus === "all" || post.status === filterStatus)
    }
    return []
  }

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Content Moderation</h1>
          <p className="text-gray-600">Review and moderate user-generated content</p>
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
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div>
          {activeTab === "reviews" && (
            <div>
              {getFilteredContent().map((review) => (
                <ContentCard key={review.id} content={review} type="review" />
              ))}
            </div>
          )}

          {activeTab === "posts" && (
            <div>
              {getFilteredContent().map((post) => (
                <ContentCard key={post.id} content={post} type="post" />
              ))}
            </div>
          )}

          {activeTab === "photos" && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-4xl">📸</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Photo Moderation</h3>
              <p className="text-gray-600">Photo moderation interface would be implemented here</p>
            </div>
          )}

          {getFilteredContent().length === 0 && activeTab !== "photos" && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-4xl">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">No {activeTab} match the current filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContentModeration
