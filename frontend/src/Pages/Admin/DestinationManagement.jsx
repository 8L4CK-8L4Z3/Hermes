"use client"

import { useState, useContext } from "react"
import { AuthContext, NavigationContext } from "@/App"

const DestinationManagement = () => {
  const { navigate } = useContext(NavigationContext)
  const { isLoggedIn } = useContext(AuthContext)
  const [isAdmin] = useState(true)
  const [activeTab, setActiveTab] = useState("destinations")
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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

  const destinations = [
    {
      id: 1,
      name: "Rome, Italy",
      description: "The Eternal City with ancient history and vibrant culture",
      location: "Lazio, Italy",
      photo: "/images/rome.jpg",
      placesCount: 45,
      reviewsCount: 1234,
      created_at: "2023-01-15T10:00:00Z",
      status: "active",
    },
    {
      id: 2,
      name: "Tokyo, Japan",
      description: "Modern metropolis blending tradition with innovation",
      location: "Kanto, Japan",
      photo: "/images/japan.jpg",
      placesCount: 67,
      reviewsCount: 2156,
      created_at: "2023-02-20T14:30:00Z",
      status: "active",
    },
    {
      id: 3,
      name: "New York, USA",
      description: "The city that never sleeps",
      location: "New York, USA",
      photo: "/images/newyork.jpg",
      placesCount: 89,
      reviewsCount: 3421,
      created_at: "2023-03-10T09:15:00Z",
      status: "active",
    },
  ]

  const places = [
    {
      id: 1,
      destination_id: 1,
      destination: "Rome, Italy",
      type: "Activity",
      name: "Colosseum",
      description: "Iconic ancient amphitheatre",
      photo: "/images/sightseeing.jpg",
      average_rating: 4.8,
      price_range: "$$",
      address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
      created_at: "2023-01-20T11:00:00Z",
      status: "active",
    },
    {
      id: 2,
      destination_id: 1,
      destination: "Rome, Italy",
      type: "Hotel",
      name: "Hotel Artemide",
      description: "Luxury hotel near Termini Station",
      photo: "/images/rome.jpg",
      average_rating: 4.5,
      price_range: "$$$",
      address: "Via Nazionale, 22, 00184 Roma RM, Italy",
      created_at: "2023-01-25T16:30:00Z",
      status: "active",
    },
    {
      id: 3,
      destination_id: 2,
      destination: "Tokyo, Japan",
      type: "Restaurant",
      name: "Sukiyabashi Jiro",
      description: "World-famous sushi restaurant",
      photo: "/images/japan.jpg",
      average_rating: 4.9,
      price_range: "$$$$",
      address: "Tsukamoto Sogyo Building, Ginza, Tokyo",
      created_at: "2023-02-25T12:45:00Z",
      status: "active",
    },
  ]

  const handleItemAction = (itemId, action, type) => {
    console.log(`${action} ${type} ${itemId}`)
    // Handle destination/place actions
  }

  const tabs = [
    { id: "destinations", label: "Destinations", count: destinations.length },
    { id: "places", label: "Places", count: places.length },
  ]

  const DestinationCard = ({ destination }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-medium transition-shadow duration-200">
      <img src={destination.photo || "/placeholder.svg"} alt={destination.name} className="w-full h-48 object-cover" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{destination.name}</h3>
            <p className="text-sm text-gray-600">{destination.location}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              destination.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {destination.status}
          </span>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{destination.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{destination.placesCount} places</span>
          <span>{destination.reviewsCount} reviews</span>
          <span>{new Date(destination.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleItemAction(destination.id, "edit", "destination")}
            className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Edit
          </button>
          <button
            onClick={() => handleItemAction(destination.id, "view", "destination")}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            View
          </button>
          <button
            onClick={() => handleItemAction(destination.id, "delete", "destination")}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  const PlaceRow = ({ place }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={place.photo || "/placeholder.svg"} alt={place.name} className="w-12 h-12 object-cover rounded-lg" />
          <div>
            <div className="font-medium text-gray-900">{place.name}</div>
            <div className="text-sm text-gray-600">{place.destination}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{place.type}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐</span>
          <span className="text-sm font-medium">{place.average_rating}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{place.price_range}</td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            place.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {place.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{new Date(place.created_at).toLocaleDateString()}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleItemAction(place.id, "edit", "place")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleItemAction(place.id, "view", "place")}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => handleItemAction(place.id, "delete", "place")}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPlaces = places.filter(
    (place) =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.destination.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Destination Management</h1>
            <p className="text-gray-600">Manage destinations, places, and activities</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Add New {activeTab === "destinations" ? "Destination" : "Place"}
          </button>
        </div>

        {/* Search and Tabs */}
        <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-b border-gray-100">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "destinations" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}

        {activeTab === "places" && (
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Place
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlaces.map((place) => (
                    <PlaceRow key={place.id} place={place} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === "destinations" && filteredDestinations.length === 0) ||
          (activeTab === "places" && filteredPlaces.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4 text-4xl">{activeTab === "destinations" ? "🌍" : "📍"}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Add Modal (placeholder) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add New {activeTab === "destinations" ? "Destination" : "Place"}
              </h3>
              <p className="text-gray-600 mb-6">Form for adding new {activeTab} would be implemented here.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DestinationManagement
