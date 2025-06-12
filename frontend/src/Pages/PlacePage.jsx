"use client"

import { useState } from "react"

const PlacePage = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })

  const place = {
    id: 1,
    name: "Colosseum",
    type: "Activity",
    description:
      "The Colosseum is an oval amphitheatre in the centre of the city of Rome, Italy, just east of the Roman Forum. It is the largest amphitheatre ever built, measuring approximately 189 meters long, 156 meters wide and 50 meters high.",
    photos: ["/images/sightseeing.jpg", "/images/rome.jpg"],
    averageRating: 4.8,
    totalReviews: 12847,
    priceRange: "$$",
    openingHours: "8:30 AM - 7:00 PM",
    address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
    phone: "+39 06 3996 7700",
    website: "https://colosseum.com",
    features: ["Skip-the-line tickets", "Audio guide", "Wheelchair accessible", "Gift shop"],
  }

  const reviews = [
    {
      id: 1,
      user: { name: "Sarah Johnson", photo: null },
      rating: 5,
      comment:
        "Absolutely incredible! The history and architecture are breathtaking. Definitely worth the visit and the skip-the-line tickets are a must!",
      visitDate: "2024-05-15",
      photos: ["/images/sightseeing.jpg"],
      helpfulVotes: 23,
      categories: ["Architecture", "History"],
    },
    {
      id: 2,
      user: { name: "Marco Rossi", photo: null },
      rating: 4,
      comment:
        "Amazing historical site. Can get very crowded, so I recommend visiting early in the morning. The underground tour is fantastic!",
      visitDate: "2024-04-20",
      photos: [],
      helpfulVotes: 15,
      categories: ["History", "Tours"],
    },
  ]

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "reviews", label: `Reviews (${place.totalReviews})` },
    { id: "photos", label: "Photos" },
  ]

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    // Handle review submission
    console.log("Review submitted:", newReview)
    setShowReviewForm(false)
    setNewReview({ rating: 5, comment: "" })
  }

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Image */}
            <div>
              <img
                src={place.photos[0] || "/placeholder.svg"}
                alt={place.name}
                className="w-full h-64 lg:h-80 object-cover rounded-xl"
              />
            </div>

            {/* Place Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{place.name}</h1>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {place.type}
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{place.priceRange}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${i < Math.floor(place.averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{place.averageRating}</span>
                <span className="text-gray-600">({place.totalReviews.toLocaleString()} reviews)</span>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🕒</span>
                  <span>{place.openingHours}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📍</span>
                  <span>{place.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📞</span>
                  <span>{place.phone}</span>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {place.features.map((feature, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200">
                  Add to Trip
                </button>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Write Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
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
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About {place.name}</h2>
                <p className="text-gray-700 leading-relaxed">{place.description}</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Write Review
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                              className={`text-2xl ${star <= newReview.rating ? "text-yellow-400" : "text-gray-300"}`}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="Share your experience..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-6 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                            {review.user.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">• {review.visitDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      {review.photos.length > 0 && (
                        <div className="mb-4">
                          <img
                            src={review.photos[0] || "/placeholder.svg"}
                            alt="Review"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {review.categories.map((category, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {category}
                            </span>
                          ))}
                        </div>
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                          👍 Helpful ({review.helpfulVotes})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Photos</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {place.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo || "/placeholder.svg"}
                      alt={`${place.name} ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlacePage
