"use client"

import { useState } from "react"

const DestinationPage = () => {
  const [activeTab, setActiveTab] = useState("overview")

  const destination = {
    id: 1,
    name: "Rome, Italy",
    description:
      "The Eternal City, where ancient history meets vibrant modern culture. Rome offers an unparalleled journey through time with its iconic landmarks, world-class museums, and incredible cuisine.",
    photos: ["/images/rome.jpg", "/images/sightseeing.jpg"],
    location: "Lazio, Italy",
    bestTimeToVisit: "April-June, September-October",
    averageStay: "3-5 days",
    priceRange: "$$-$$$",
  }

  const accommodations = [
    {
      id: 1,
      name: "Hotel Artemide",
      type: "Hotel",
      rating: 4.5,
      priceRange: "$$$",
      photo: "/images/rome.jpg",
      description: "Luxury hotel near Termini Station",
    },
    {
      id: 2,
      name: "The First Roma Dolce",
      type: "Hotel",
      rating: 4.8,
      priceRange: "$$$$",
      photo: "/images/rome.jpg",
      description: "Boutique hotel in historic center",
    },
  ]

  const restaurants = [
    {
      id: 1,
      name: "Da Enzo al 29",
      type: "Restaurant",
      rating: 4.7,
      priceRange: "$$",
      cuisine: "Italian",
      photo: "/images/sightseeing.jpg",
      description: "Authentic Roman trattoria",
    },
    {
      id: 2,
      name: "Piperno",
      type: "Restaurant",
      rating: 4.4,
      priceRange: "$$$",
      cuisine: "Jewish-Roman",
      photo: "/images/sightseeing.jpg",
      description: "Historic restaurant since 1860",
    },
  ]

  const activities = [
    {
      id: 1,
      name: "Colosseum Tour",
      type: "Activity",
      rating: 4.9,
      priceRange: "$$",
      duration: "2-3 hours",
      photo: "/images/sightseeing.jpg",
      description: "Skip-the-line guided tour",
    },
    {
      id: 2,
      name: "Vatican Museums",
      type: "Activity",
      rating: 4.8,
      priceRange: "$$$",
      duration: "3-4 hours",
      photo: "/images/sightseeing.jpg",
      description: "Sistine Chapel and museums",
    },
  ]

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "accommodations", label: "Stay" },
    { id: "restaurants", label: "Eat" },
    { id: "activities", label: "Do" },
  ]

  const PlaceCard = ({ place }) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-medium transition-shadow duration-200">
      <img src={place.photo || "/placeholder.svg"} alt={place.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{place.name}</h3>
          <span className="text-sm text-gray-600">{place.priceRange}</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-medium">{place.rating}</span>
          </div>
          {place.cuisine && <span className="text-sm text-gray-600">• {place.cuisine}</span>}
          {place.duration && <span className="text-sm text-gray-600">• {place.duration}</span>}
        </div>

        <p className="text-sm text-gray-600 mb-4">{place.description}</p>

        <div className="flex gap-2">
          <button className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200">
            Add to Trip
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      {/* Hero Section */}
      <div className="relative h-64 lg:h-96">
        <img
          src={destination.photos[0] || "/placeholder.svg"}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="max-w-6xl mx-auto px-4 lg:px-5 pb-8 text-white">
            <h1 className="text-3xl lg:text-5xl font-bold mb-2">{destination.name}</h1>
            <p className="text-lg lg:text-xl opacity-90">{destination.location}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-5 py-8">
        {/* Quick Info */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Time to Visit</h3>
              <p className="text-gray-600">{destination.bestTimeToVisit}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Average Stay</h3>
              <p className="text-gray-600">{destination.averageStay}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Price Range</h3>
              <p className="text-gray-600">{destination.priceRange}</p>
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {destination.name}</h2>
                  <p className="text-gray-700 leading-relaxed">{destination.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {destination.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo || "/placeholder.svg"}
                        alt={`${destination.name} ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "accommodations" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Where to Stay</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {accommodations.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "restaurants" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Where to Eat</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {restaurants.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "activities" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">What to Do</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activities.map((place) => (
                    <PlaceCard key={place.id} place={place} />
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

export default DestinationPage
