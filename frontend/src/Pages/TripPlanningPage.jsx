"use client"

import { useState, useContext } from "react"
import { AuthContext } from "@/Context/Auth"
import { NavigationContext } from "@/Context/Navigate"

const TripPlanningPage = () => {
  const [tripData, setTripData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    budget: "",
    isPublic: true,
    destinations: [],
    activities: [],
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const { navigate } = useContext(NavigationContext)
  const { isLoggedIn } = useContext(AuthContext)

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold mb-4">Please sign in to plan a trip</h1>
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

  const mockDestinations = [
    { id: 1, name: "Paris, France", photo: "/images/rome.jpg" },
    { id: 2, name: "Tokyo, Japan", photo: "/images/japan.jpg" },
    { id: 3, name: "New York, USA", photo: "/images/newyork.jpg" },
    { id: 4, name: "Rome, Italy", photo: "/images/rome.jpg" },
  ]

  const steps = [
    { id: 1, title: "Trip Details", icon: "📝" },
    { id: 2, title: "Destinations", icon: "📍" },
    { id: 3, title: "Activities", icon: "🎯" },
    { id: 4, title: "Review", icon: "✅" },
  ]

  const handleInputChange = (field, value) => {
    setTripData((prev) => ({ ...prev, [field]: value }))
  }

  const addDestination = (destination) => {
    if (!tripData.destinations.find((d) => d.id === destination.id)) {
      setTripData((prev) => ({
        ...prev,
        destinations: [...prev.destinations, destination],
      }))
    }
  }

  const removeDestination = (destinationId) => {
    setTripData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d.id !== destinationId),
    }))
  }

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Plan Your Trip</h1>
          <p className="text-gray-600">Create your perfect itinerary step by step</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-3 hidden lg:block">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-600"}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 lg:w-24 h-0.5 mx-4 ${currentStep > step.id ? "bg-gray-900" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Trip Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
                <input
                  type="text"
                  value={tripData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., European Adventure"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={tripData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Optional)</label>
                <input
                  type="number"
                  value={tripData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  placeholder="Enter your budget"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={tripData.isPublic}
                  onChange={(e) => handleInputChange("isPublic", e.target.checked)}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Make this trip public (others can view and get inspired)
                </label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Destinations</h2>

              {/* Search */}
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for destinations..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Selected Destinations */}
              {tripData.destinations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Destinations</h3>
                  <div className="space-y-3">
                    {tripData.destinations.map((dest, index) => (
                      <div
                        key={dest.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900">{dest.name}</span>
                        </div>
                        <button
                          onClick={() => removeDestination(dest.id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Destinations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Destinations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {mockDestinations
                    .filter((dest) => dest.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((dest) => (
                      <div
                        key={dest.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-medium transition-shadow duration-200"
                      >
                        <img
                          src={dest.photo || "/placeholder.svg"}
                          alt={dest.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{dest.name}</h4>
                            <button
                              onClick={() => addDestination(dest)}
                              disabled={tripData.destinations.find((d) => d.id === dest.id)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                tripData.destinations.find((d) => d.id === dest.id)
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-900 text-white hover:bg-gray-800"
                              }`}
                            >
                              {tripData.destinations.find((d) => d.id === dest.id) ? "Added" : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Activities & Interests</h2>
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4 text-4xl">🎯</div>
                <p className="text-gray-600">Activity selection interface would be implemented here</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Trip</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Trip Details</h3>
                  <p>
                    <strong>Name:</strong> {tripData.title || "Untitled Trip"}
                  </p>
                  <p>
                    <strong>Dates:</strong> {tripData.startDate} to {tripData.endDate}
                  </p>
                  {tripData.budget && (
                    <p>
                      <strong>Budget:</strong> ${tripData.budget}
                    </p>
                  )}
                  <p>
                    <strong>Visibility:</strong> {tripData.isPublic ? "Public" : "Private"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Destinations ({tripData.destinations.length})</h3>
                  {tripData.destinations.map((dest, index) => (
                    <p key={dest.id}>
                      {index + 1}. {dest.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentStep === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => navigate("profile")}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Save Trip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripPlanningPage
