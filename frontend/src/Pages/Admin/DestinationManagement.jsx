"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAllDestinations,
  useCreateDestination,
  useUpdateDestination,
  useDeleteDestination,
  useUpdateDestinationPhoto,
} from "@/Stores/destinationStore";
import {
  usePopularPlaces,
  useCreatePlace,
  useDeletePlace,
} from "@/Stores/placeStore";
import DestinationForm from "@/Components/Forms/DestinationForm";
import { getImageUrl } from "@/Utils/imageUpload";
const DestinationManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("destinations");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const limit = 10;

  // Move all hooks before any conditional logic
  const {
    data: destinationsData,
    isLoading: isLoadingDestinations,
    error: destinationsError,
  } = useAllDestinations(currentPage, limit);
  const {
    data: placesData,
    isLoading: isLoadingPlaces,
    error: placesError,
  } = usePopularPlaces(currentPage, limit);
  const createDestinationMutation = useCreateDestination();
  const updateDestinationMutation = useUpdateDestination();
  const deleteDestinationMutation = useDeleteDestination();
  const updatePhotoMutation = useUpdateDestinationPhoto();
  const createPlaceMutation = useCreatePlace();
  const deletePlaceMutation = useDeletePlace();

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemAction = async (itemId, action, type) => {
    try {
      switch (action) {
        case "delete":
          if (type === "destination") {
            await deleteDestinationMutation.mutateAsync(itemId);
          } else if (type === "place") {
            await deletePlaceMutation.mutateAsync(itemId);
          }
          break;
        case "edit":
          if (type === "destination") {
            const destination = destinationsData?.data?.find(
              (d) => d._id === itemId
            );
            if (destination) {
              setSelectedDestination(destination);
              setShowAddModal(true);
            }
          }
          break;
        case "view":
          navigate(`/${type}s/${itemId}`);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error handling action:", error);
      if (error.response?.data?.error?.errors) {
        console.error("Validation errors:", error.response.data.error.errors);
      }
    }
  };

  const handleAddSubmit = async (formData) => {
    try {
      if (activeTab === "destinations") {
        if (selectedDestination) {
          await updateDestinationMutation.mutateAsync({
            destinationId: selectedDestination._id,
            destinationData: formData,
          });
        } else {
          await createDestinationMutation.mutateAsync(formData);
        }
      } else if (activeTab === "places") {
        await createPlaceMutation.mutateAsync(formData);
      }
      setShowAddModal(false);
      setSelectedDestination(null);
    } catch (error) {
      console.error("Error creating/updating item:", error);
      if (error.response?.data?.error?.errors) {
        console.error("Validation errors:", error.response.data.error.errors);
      }
    }
  };

  const handlePhotoUpdate = async (destinationId, photo) => {
    try {
      const formData = new FormData();
      formData.append("image", photo);

      // Create a new image object
      const imageData = {
        is_primary: true,
        caption: "",
        uploaded_at: new Date(),
      };

      // Append the image metadata
      formData.append("imageData", JSON.stringify(imageData));

      await updatePhotoMutation.mutateAsync({
        destinationId,
        photo: formData,
      });
    } catch (error) {
      console.error("Error updating photo:", error);
      if (error.response?.data?.error?.errors) {
        console.error("Validation errors:", error.response.data.error.errors);
      }
    }
  };

  // Add error states
  if (destinationsError || placesError) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] text-red-600">
        <p>Error loading data. Please try again later.</p>
      </div>
    );
  }

  // Add loading states
  if (isLoadingDestinations || isLoadingPlaces) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredDestinations =
    destinationsData?.data?.filter(
      (dest) =>
        dest?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest?.location?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredPlaces =
    placesData?.data?.filter(
      (place) =>
        place?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place?.destination?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  const tabs = [
    {
      id: "destinations",
      label: "Destinations",
      count: destinationsData?.meta?.total || 0,
    },
    {
      id: "places",
      label: "Places",
      count: placesData?.meta?.total || 0,
    },
  ];

  const DestinationCard = ({ destination, onPhotoUpdate }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-medium transition-shadow duration-200">
      <div className="relative">
        <img
          src={getImageUrl(destination.images) || "/placeholder.svg"}
          alt={destination.name}
          className="w-full h-48 object-cover"
        />
        <label className="absolute bottom-2 right-2 bg-white rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
          Update Photo
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onPhotoUpdate(destination._id, file);
              }
            }}
          />
        </label>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {destination.name}
            </h3>
            <p className="text-sm text-gray-600">{destination.location}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              destination.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {destination.status}
          </span>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {destination.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{destination.places_count || 0} places</span>
          <span>{destination.reviews_count || 0} reviews</span>
          <span>{new Date(destination.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              handleItemAction(destination._id, "edit", "destination")
            }
            className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Edit
          </button>
          <button
            onClick={() =>
              handleItemAction(destination._id, "view", "destination")
            }
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            View
          </button>
          <button
            onClick={() =>
              handleItemAction(destination._id, "delete", "destination")
            }
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const PlaceRow = ({ place }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={getImageUrl(place.images) || "/placeholder.svg"}
            alt={place.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <div className="font-medium text-gray-900">{place.name}</div>
            <div className="text-sm text-gray-600">
              {place.destination?.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          {place.type}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐</span>
          <span className="text-sm font-medium">
            {place.average_rating || 0}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{place.price_range}</td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            place.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {place.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {new Date(place.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleItemAction(place._id, "edit", "place")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleItemAction(place._id, "view", "place")}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => handleItemAction(place._id, "delete", "place")}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 lg:px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Destination Management
            </h1>
            <p className="text-gray-600">
              Manage destinations, places, and activities
            </p>
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
              <DestinationCard
                key={destination._id}
                destination={destination}
                onPhotoUpdate={handlePhotoUpdate}
              />
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
                    <PlaceRow key={place._id} place={place} />
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
            <div className="text-gray-400 mb-4 text-4xl">
              {activeTab === "destinations" ? "🌍" : "📍"}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedDestination ? "Edit" : "Add New"}{" "}
                  {activeTab === "destinations" ? "Destination" : "Place"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedDestination(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {activeTab === "destinations" ? (
                <DestinationForm
                  onSubmit={handleAddSubmit}
                  initialData={selectedDestination}
                  onCancel={() => {
                    setShowAddModal(false);
                    setSelectedDestination(null);
                  }}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">Place form coming soon...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add pagination controls */}
        {(activeTab === "destinations" && destinationsData?.meta?.pagination) ||
        (activeTab === "places" && placesData?.meta?.pagination) ? (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-1">
                Page {currentPage} of{" "}
                {activeTab === "destinations"
                  ? Math.ceil(destinationsData.meta.total / limit)
                  : Math.ceil(placesData.meta.total / limit)}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(
                    (activeTab === "destinations"
                      ? destinationsData.meta.total
                      : placesData.meta.total) / limit
                  )
                }
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DestinationManagement;
