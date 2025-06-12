"use client"

import { useState } from "react"
import rome from "@/Assets/PHImg/Rome.jpg"
import paris from "@/Assets/PHImg/Paris.jpg"
import barcelona from "@/Assets/PHImg/Barcelona.jpg"

const TripVisualizationPage = () => {
  const [isOwner] = useState(true) // Mock ownership check
  const [editMode, setEditMode] = useState(false)

  const trip = {
    id: 1,
    title: "European Adventure",
    startDate: "2024-06-15",
    endDate: "2024-06-30",
    status: "completed",
    isPublic: true,
    budget: 5000,
    owner: {
      name: "John Doe",
      username: "@johndoe",
    },
    destinations: [
      {
        id: 1,
        name: "Rome, Italy",
        arrivalDate: "2024-06-15",
        departureDate: "2024-06-20",
        photo: rome,
        activities: [
          {
            id: 1,
            name: "Colosseum Tour",
            date: "2024-06-16",
            time: "10:00 AM",
            type: "Activity",
            duration: "3 hours",
            cost: 45,
          },
          {
            id: 2,
            name: "Vatican Museums",
            date: "2024-06-17",
            time: "9:00 AM",
            type: "Activity",
            duration: "4 hours",
            cost: 65,
          },
          {
            id: 3,
            name: "Hotel Artemide",
            date: "2024-06-15",
            time: "3:00 PM",
            type: "Accommodation",
            duration: "5 nights",
            cost: 800,
          },
        ],
      },
      {
        id: 2,
        name: "Paris, France",
        arrivalDate: "2024-06-20",
        departureDate: "2024-06-25",
        photo: paris,
        activities: [
          {
            id: 4,
            name: "Eiffel Tower Visit",
            date: "2024-06-21",
            time: "2:00 PM",
            type: "Activity",
            duration: "2 hours",
            cost: 25,
          },
          {
            id: 5,
            name: "Louvre Museum",
            date: "2024-06-22",
            time: "10:00 AM",
            type: "Activity",
            duration: "4 hours",
            cost: 35,
          },
        ],
      },
      {
        id: 3,
        name: "Barcelona, Spain",
        arrivalDate: "2024-06-25",
        departureDate: "2024-06-30",
        photo: barcelona,
        activities: [
          {
            id: 6,
            name: "Sagrada Familia",
            date: "2024-06-26",
            time: "11:00 AM",
            type: "Activity",
            duration: "2 hours",
            cost: 30,
          },
          {
            id: 7,
            name: "Park Güell",
            date: "2024-06-27",
            time: "9:00 AM",
            type: "Activity",
            duration: "3 hours",
            cost: 20,
          },
        ],
      },
    ],
  }

  const totalCost = trip.destinations.reduce(
    (total, dest) => total + dest.activities.reduce((destTotal, activity) => destTotal + activity.cost, 0),
    0,
  )

  const ActivityCard = ({ activity }) => (
    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-900">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{activity.name}</h4>
          <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium mt-1">
            {activity.type}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-900">${activity.cost}</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>📅 {activity.date}</span>
        <span>🕒 {activity.time}</span>
        <span>⏱️ {activity.duration}</span>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 lg:px-5 py-8">
        {/* Trip Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{trip.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trip.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : trip.status === "planned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {trip.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span>
                  📅 {trip.startDate} - {trip.endDate}
                </span>
                <span>👤 {trip.owner.name}</span>
                <span>{trip.isPublic ? "🌍 Public" : "🔒 Private"}</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{trip.destinations.length}</span>
                  <span className="text-gray-600 ml-1">Destinations</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">${totalCost}</span>
                  <span className="text-gray-600 ml-1">Total Cost</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))}
                  </span>
                  <span className="text-gray-600 ml-1">Days</span>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  {editMode ? "Save Changes" : "Edit Trip"}
                </button>
                <button className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  Share Trip
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trip Timeline */}
        <div className="space-y-8">
          {trip.destinations.map((destination, index) => (
            <div key={destination.id} className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft">
              <div className="flex items-start gap-6">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  {index < trip.destinations.length - 1 && <div className="w-0.5 h-16 bg-gray-200 mt-4"></div>}
                </div>

                {/* Destination Content */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Destination Info */}
                    <div className="lg:col-span-2">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h2>
                      <div className="flex items-center gap-4 text-gray-600 mb-6">
                        <span>
                          📅 {destination.arrivalDate} - {destination.departureDate}
                        </span>
                        <span>
                          ⏱️{" "}
                          {Math.ceil(
                            (new Date(destination.departureDate) - new Date(destination.arrivalDate)) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </span>
                      </div>

                      {/* Activities */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Activities & Bookings</h3>
                        <div className="space-y-3">
                          {destination.activities.map((activity) => (
                            <ActivityCard key={activity.id} activity={activity} />
                          ))}
                        </div>

                        {editMode && (
                          <button className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors duration-200">
                            + Add Activity
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Destination Image */}
                    <div>
                      <img
                        src={destination.photo || "/placeholder.svg"}
                        alt={destination.name}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Destination Total</h4>
                        <div className="text-2xl font-bold text-gray-900">
                          ${destination.activities.reduce((total, activity) => total + activity.cost, 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trip Summary */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Summary</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">{trip.destinations.length}</div>
              <div className="text-gray-600">Cities Visited</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {trip.destinations.reduce((total, dest) => total + dest.activities.length, 0)}
              </div>
              <div className="text-gray-600">Activities Planned</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">${totalCost}</div>
              <div className="text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripVisualizationPage
