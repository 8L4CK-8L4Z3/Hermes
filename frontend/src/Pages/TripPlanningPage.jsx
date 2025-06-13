"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCreateTrip } from "@/Stores/tripStore";
import { usePopularDestinations } from "@/Stores/destinationStore";
import { usePopularActivities } from "@/Stores/activityStore";
import { getImageUrl } from "@/Utils/imageUpload";

const DestinationCard = ({ dest, onAdd, isAdded }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-medium transition-all duration-200 ${
        isHovered ? "transform -translate-y-0.5" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-w-16 aspect-h-9">
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={getImageUrl(dest.images) || "/placeholder.svg"}
          alt={dest.name || "Destination"}
          className={`w-full h-32 object-cover ${
            isImageLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-200`}
          onLoad={handleImageLoad}
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>
      <div className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">
              {dest.name || "Unnamed Destination"}
            </h4>
            <button
              onClick={() => onAdd(dest)}
              disabled={isAdded}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isAdded
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {isAdded ? "Added" : "Add"}
            </button>
          </div>
          <p className="text-sm text-gray-600">{dest.location}</p>
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({ activity, onToggle, isSelected }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-medium transition-all duration-200 ${
        isHovered ? "transform -translate-y-0.5" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-w-16 aspect-h-9">
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={getImageUrl(activity.image) || "/placeholder.svg"}
          alt={activity.name || "Activity"}
          className={`w-full h-32 object-cover ${
            isImageLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-200`}
          onLoad={handleImageLoad}
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>
      <div className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">
                {activity.name || "Unnamed Activity"}
              </h4>
              <p className="text-sm text-gray-600">
                {activity.popularity ? `${activity.popularity}% Popular` : ""}
              </p>
            </div>
            <button
              onClick={() => onToggle(activity)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {isSelected ? "Selected" : "Select"}
            </button>
          </div>
          {activity.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {activity.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const TripPlanningPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    destinations: [],
    activities: [],
    budget: "",
    visibility: "private",
    searchQuery: "",
  });

  // Fetch popular destinations and activities
  const { data: popularDestinations, isLoading: isLoadingDestinations } =
    usePopularDestinations(1, 10);
  const { data: popularActivities, isLoading: isLoadingActivities } =
    usePopularActivities(8);

  // Mutations for trip operations
  const createTrip = useCreateTrip();

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const steps = [
    { id: 1, title: "Trip Details", icon: "📝" },
    { id: 2, title: "Destinations", icon: "📍" },
    { id: 3, title: "Activities", icon: "🎯" },
    { id: 4, title: "Review", icon: "✅" },
  ];

  const handleInputChange = (field, value) => {
    setTripData((prev) => ({ ...prev, [field]: value }));
  };

  const addDestination = (destination) => {
    if (!tripData.destinations.find((d) => d._id === destination._id)) {
      setTripData((prev) => ({
        ...prev,
        destinations: [...prev.destinations, destination],
      }));
    }
  };

  const removeDestination = (destinationId) => {
    setTripData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d._id !== destinationId),
    }));
  };

  const handleSaveTrip = async () => {
    try {
      setError(null);

      // Validate required fields
      if (!tripData.title) {
        setError("Please enter a trip title");
        return;
      }
      if (!tripData.startDate || !tripData.endDate) {
        setError("Please select both start and end dates");
        return;
      }
      if (tripData.destinations.length === 0) {
        setError("Please select at least one destination");
        return;
      }

      // Create the trip with destinations included
      const newTrip = await createTrip.mutateAsync({
        title: tripData.title,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        budget: tripData.budget,
        visibility: tripData.visibility,
        activities: tripData.activities,
        destinations: tripData.destinations.map((dest) => dest._id), // Include destination IDs
      });

      navigate(`/trips/${newTrip.id}`);
    } catch (error) {
      console.error("Error saving trip:", error);
      // Handle validation errors specifically
      if (error.response?.data?.error?.errors) {
        const errors = error.response.data.error.errors;
        const errorMessages = errors.map((err) => err.msg).join(", ");
        setError(errorMessages);
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to save trip. Please try again."
        );
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Plan Your Trip
          </h1>
          <p className="text-gray-600">
            Create your perfect itinerary step by step
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    activeStep >= step.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-3 hidden lg:block">
                  <p
                    className={`text-sm font-medium ${
                      activeStep >= step.id ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 lg:w-24 h-0.5 mx-4 ${
                      activeStep > step.id ? "bg-gray-900" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft">
          {activeStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Trip Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Name
                </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tripData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (Optional)
                </label>
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
                  id="visibility"
                  checked={tripData.visibility === "public"}
                  onChange={(e) =>
                    handleInputChange(
                      "visibility",
                      e.target.checked ? "public" : "private"
                    )
                  }
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <label
                  htmlFor="visibility"
                  className="ml-2 text-sm text-gray-700"
                >
                  Make this trip public (others can view and get inspired)
                </label>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Add Destinations
              </h2>

              {/* Search */}
              <div>
                <input
                  type="text"
                  value={tripData.searchQuery}
                  onChange={(e) =>
                    handleInputChange("searchQuery", e.target.value)
                  }
                  placeholder="Search for destinations..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Available Destinations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Popular Destinations
                </h3>
                {isLoadingDestinations ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="animate-pulse">
                        <div className="bg-gray-200 h-32 rounded-t-lg"></div>
                        <div className="p-4 border border-gray-200 border-t-0 rounded-b-lg">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : popularDestinations?.data ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {popularDestinations.data
                      .filter((item) =>
                        item?.destination_id?.name
                          ?.toLowerCase()
                          .includes(tripData.searchQuery?.toLowerCase() || "")
                      )
                      .map((item) => (
                        <DestinationCard
                          key={item.destination_id._id}
                          dest={item.destination_id}
                          onAdd={addDestination}
                          isAdded={tripData.destinations.find(
                            (d) => d._id === item.destination_id._id
                          )}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No destinations available</p>
                  </div>
                )}
              </div>

              {/* Selected Destinations */}
              {tripData.destinations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Selected Destinations
                  </h3>
                  <div className="space-y-3">
                    {tripData.destinations.map((dest, index) => (
                      <div
                        key={dest._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <span className="font-medium text-gray-900">
                              {dest.name || "Unnamed Destination"}
                            </span>
                            <p className="text-sm text-gray-600">
                              {dest.location}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDestination(dest._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Activities & Interests
              </h2>
              {isLoadingActivities ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 h-32 rounded-t-lg"></div>
                      <div className="p-4 border border-gray-200 border-t-0 rounded-b-lg">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : popularActivities?.data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {popularActivities.data.map((activity) => (
                    <ActivityCard
                      key={activity._id}
                      activity={activity}
                      onToggle={(activity) => {
                        setTripData((prev) => ({
                          ...prev,
                          activities: prev.activities.includes(activity._id)
                            ? prev.activities.filter(
                                (id) => id !== activity._id
                              )
                            : [...prev.activities, activity._id],
                        }));
                      }}
                      isSelected={tripData.activities.includes(activity._id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4 text-4xl">🎯</div>
                  <p className="text-gray-600">
                    No activities available at the moment
                  </p>
                </div>
              )}
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Review Your Trip
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Trip Details
                  </h3>
                  <p>
                    <strong>Name:</strong> {tripData.title || "Untitled Trip"}
                  </p>
                  <p>
                    <strong>Dates:</strong> {tripData.startDate} to{" "}
                    {tripData.endDate}
                  </p>
                  {tripData.budget && (
                    <p>
                      <strong>Budget:</strong> ${tripData.budget}
                    </p>
                  )}
                  <p>
                    <strong>Visibility:</strong>{" "}
                    {tripData.visibility === "public" ? "Public" : "Private"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Destinations ({tripData.destinations.length})
                  </h3>
                  {tripData.destinations.map((dest, index) => (
                    <p key={dest._id}>
                      {index + 1}. {dest.name || "Unnamed Destination"}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeStep === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {activeStep < 4 ? (
              <button
                onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSaveTrip}
                disabled={createTrip.isLoading}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {createTrip.isLoading ? "Saving..." : "Save Trip"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanningPage;
