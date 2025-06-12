"use client"

import { useState, useContext } from "react"
import { AuthContext } from "@/Context/Auth"
import { NavigationContext } from "@/Context/Navigate"

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("trips")
  const [isFollowing, setIsFollowing] = useState(false)
  const { navigate } = useContext(NavigationContext)
  const { isLoggedIn } = useContext(AuthContext)

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Please sign in to view your profile</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
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

  const tabs = [
    { id: "trips", label: "Trips", count: 12 },
    { id: "reviews", label: "Reviews", count: 28 },
    { id: "followers", label: "Followers", count: 156 },
    { id: "following", label: "Following", count: 89 },
  ]

  const mockTrips = [
    {
      id: 1,
      title: "European Adventure",
      destinations: ["Paris", "Rome", "Barcelona"],
      startDate: "2024-06-15",
      endDate: "2024-06-30",
      status: "completed",
      isPublic: true,
      photo: "/images/rome.jpg",
    },
    {
      id: 2,
      title: "Japan Discovery",
      destinations: ["Tokyo", "Kyoto", "Osaka"],
      startDate: "2024-09-10",
      endDate: "2024-09-25",
      status: "planned",
      isPublic: true,
      photo: "/images/japan.jpg",
    },
  ]

  const mockReviews = [
    {
      id: 1,
      placeName: "Colosseum",
      rating: 5,
      comment: "Absolutely breathtaking! A must-visit when in Rome.",
      visitDate: "2024-06-20",
      photos: ["/images/sightseeing.jpg"],
    },
    {
      id: 2,
      placeName: "Central Park",
      rating: 4,
      comment: "Beautiful park in the heart of NYC. Perfect for morning jogs.",
      visitDate: "2024-05-15",
      photos: ["/images/newyork.jpg"],
    },
  ]

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 lg:px-5 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-semibold">
              JD
            </div>

            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">John Doe</h1>
                  <p className="text-gray-600 mb-3">
                    Passionate traveler exploring the world one destination at a time ✈️
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📍 New York, USA</span>
                    <span>📅 Joined March 2023</span>
                    <span>✅ Verified</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isFollowing
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button className="px-6 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab) => (
            <div key={tab.id} className="bg-white rounded-xl p-4 text-center shadow-soft">
              <div className="text-2xl font-bold text-gray-900">{tab.count}</div>
              <div className="text-sm text-gray-600 capitalize">{tab.label}</div>
            </div>
          ))}
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
            {activeTab === "trips" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-medium transition-shadow duration-200 cursor-pointer"
                    onClick={() => navigate("trip", { id: trip.id })}
                  >
                    <img src={trip.photo || "/placeholder.svg"} alt={trip.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{trip.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trip.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{trip.destinations.join(" → ")}</p>
                      <p className="text-xs text-gray-500">
                        {trip.startDate} to {trip.endDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{review.placeName}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{review.visitDate}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    {review.photos && (
                      <img
                        src={review.photos[0] || "/placeholder.svg"}
                        alt="Review"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {(activeTab === "followers" || activeTab === "following") && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">👥</div>
                <p className="text-gray-600">
                  {activeTab === "followers" ? "Followers" : "Following"} list would be displayed here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
