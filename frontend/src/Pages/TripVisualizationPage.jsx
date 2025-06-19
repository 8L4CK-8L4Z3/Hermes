"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTrip } from "@/Stores/tripStore";
import { useDestination } from "@/Stores/destinationStore";
import { usePlace } from "@/Stores/placeStore";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/Utils/imageUpload";

const ActivityCard = ({ activity }) => {
  const { data: placeData } = usePlace(activity.place_id);
  const place = placeData?.data;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-900">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900">
            {place?.name || "Loading..."}
          </h4>
          <span className="text-sm text-gray-600">{activity.notes}</span>
        </div>
        <span className="text-sm text-gray-600">
          {new Date(activity.date).toLocaleDateString()}
        </span>
      </div>
      {place && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{place.address}</span>
          </div>
          {place.rating && (
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <span>{place.rating} / 5</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DestinationCard = ({ destination, tripDates, activities = [] }) => {
  const { data: destinationData } = useDestination(destination);
  const dest = destinationData?.data;

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-gray-900">
          {dest?.name || destination}
        </h2>
        {dest && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {dest.country}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-gray-600 mb-4">
        <span>
          📅 {new Date(tripDates.start).toLocaleDateString()} -{" "}
          {new Date(tripDates.end).toLocaleDateString()}
        </span>
        <span>
          ⏱️{" "}
          {Math.ceil(
            (new Date(tripDates.end) - new Date(tripDates.start)) /
              (1000 * 60 * 60 * 24)
          )}{" "}
          days
        </span>
      </div>

      {dest && (
        <div className="mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {dest.timezone && <span>🕒 {dest.timezone}</span>}
            {dest.language && <span>🗣️ {dest.language}</span>}
            {dest.currency && <span>💰 {dest.currency}</span>}
          </div>
          {dest.description && (
            <p className="mt-2 text-gray-600">{dest.description}</p>
          )}
        </div>
      )}

      {/* Activities */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">
          Activities & Bookings
        </h3>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

const DestinationImageCard = ({ destination }) => {
  const { data: destinationData } = useDestination(destination);
  const dest = destinationData?.data;
  const imageUrl = getImageUrl(dest?.images);

  return (
    <div>
      <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dest?.name || "Destination"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Destination Total</h4>
        <div className="text-2xl font-bold text-gray-900">$0</div>
      </div>
    </div>
  );
};

const TripVisualizationPage = () => {
  const { id } = useParams();
  const [isOwner, setIsOwner] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { user } = useAuth();

  const { data: tripData, isLoading, error } = useTrip(id);

  useEffect(() => {
    if (tripData && user) {
      setIsOwner(user.data._id === tripData.data.user_id);
    }
  }, [tripData, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-red-600">
          Failed to load trip details. Please try again.
        </div>
      </div>
    );
  }

  if (!tripData?.data) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-gray-600">Trip not found</div>
      </div>
    );
  }

  const trip = tripData.data;

  // Group activities by destination
  const activitiesByDestination =
    trip.activities?.reduce((acc, activity) => {
      if (!acc[activity.destination_id]) {
        acc[activity.destination_id] = [];
      }
      acc[activity.destination_id].push(activity);
      return acc;
    }, {}) || {};

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 lg:px-5 py-8">
        {/* Trip Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {trip.title}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trip.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : trip.status === "planning"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {trip.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span>
                  📅 {new Date(trip.start_date).toLocaleDateString()} -{" "}
                  {new Date(trip.end_date).toLocaleDateString()}
                </span>
                <span>👤 {user?.data?.username || "Anonymous"}</span>
                <span>{trip.isPublic ? "🌍 Public" : "🔒 Private"}</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {trip.destinations.length}
                  </span>
                  <span className="text-gray-600 ml-1">Destinations</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    ${trip.budget?.amount || 0}
                  </span>
                  <span className="text-gray-600 ml-1">Total Cost</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.ceil(
                      (new Date(trip.end_date) - new Date(trip.start_date)) /
                        (1000 * 60 * 60 * 24)
                    )}
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
            <div
              key={index}
              className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft"
            >
              <div className="flex items-start gap-6">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  {index < trip.destinations.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 mt-4"></div>
                  )}
                </div>

                {/* Destination Content */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DestinationCard
                      destination={destination}
                      tripDates={{
                        start: trip.start_date,
                        end: trip.end_date,
                      }}
                      activities={activitiesByDestination[destination] || []}
                    />

                    {/* Destination Image and Total */}
                    <DestinationImageCard destination={destination} />
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
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {trip.destinations.length}
              </div>
              <div className="text-gray-600">Cities Visited</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {trip.activities?.length || 0}
              </div>
              <div className="text-gray-600">Activities Planned</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${trip.budget?.amount || 0}
              </div>
              <div className="text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripVisualizationPage;
